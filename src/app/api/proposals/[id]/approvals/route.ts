import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { createNotificationForMany } from '@/lib/notifications'
import { sendEmail, approvalRequestEmail } from '@/lib/email'
import { advanceDealStage } from '@/lib/deal-stage'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const approvals = await prisma.proposalApproval.findMany({
    where: { proposalId: id },
    include: {
      approver: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(approvals)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { approverIds, message } = await request.json()

  if (!approverIds || !Array.isArray(approverIds) || approverIds.length === 0) {
    return NextResponse.json({ error: 'At least one approver is required' }, { status: 400 })
  }

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: { deal: true },
  })

  if (!proposal) return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })

  await prisma.proposal.update({
    where: { id },
    data: { status: 'PENDING_APPROVAL' },
  })

  const approvalData = approverIds.map((approverId: string) => ({
    proposalId: id,
    approverId,
    comments: message || null,
  }))

  await prisma.proposalApproval.createMany({ data: approvalData })

  await createNotificationForMany({
    userIds: approverIds,
    type: 'APPROVAL_REQUESTED',
    message: `Your approval is requested for proposal "${proposal.title}"`,
    relatedId: id,
    relatedType: 'proposal',
  })

  // Send approval request emails to each approver
  const approvers = await prisma.user.findMany({
    where: { id: { in: approverIds } },
    select: { name: true, email: true },
  })

  const requester = await prisma.user.findUnique({
    where: { id: session.user.id! },
    select: { name: true },
  })

  for (const approver of approvers) {
    const { subject, html } = approvalRequestEmail({
      approverName: approver.name,
      proposalTitle: proposal.title,
      clientName: proposal.deal?.companyName || 'Unknown Client',
      requesterName: requester?.name || 'A team member',
      proposalId: id,
      message: message || undefined,
    })
    // Fire and forget — don't block the response
    sendEmail({ to: approver.email, subject, html }).catch(() => {})
  }

  if (proposal.dealId) {
    await prisma.activity.create({
      data: {
        dealId: proposal.dealId,
        type: 'APPROVAL_REQUESTED',
        description: `Proposal "${proposal.title}" submitted for approval`,
        userId: session.user.id!,
      },
    })

    // Auto-advance deal to "Pending Approval" stage
    await advanceDealStage(
      proposal.dealId,
      'PENDING_APPROVAL',
      session.user.id!,
      `Proposal "${proposal.title}" submitted for approval — deal moved to Pending Approval`
    )
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
