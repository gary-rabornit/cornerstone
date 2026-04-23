import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { createNotification } from '@/lib/notifications'
import { advanceDealStage } from '@/lib/deal-stage'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; approvalId: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, approvalId } = await params
  const { status, comments } = await request.json()

  if (!status || !['APPROVED', 'REJECTED', 'CHANGES_REQUESTED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const approval = await prisma.proposalApproval.findUnique({
    where: { id: approvalId },
  })

  if (!approval || approval.proposalId !== id) {
    return NextResponse.json({ error: 'Approval not found' }, { status: 404 })
  }

  await prisma.proposalApproval.update({
    where: { id: approvalId },
    data: {
      status,
      comments: comments || null,
      respondedAt: new Date(),
    },
  })

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: { deal: true },
  })

  if (!proposal) return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })

  // Check if all approvals are now APPROVED
  const allApprovals = await prisma.proposalApproval.findMany({
    where: { proposalId: id },
  })

  const allApproved = allApprovals.every(a => a.status === 'APPROVED')

  if (allApproved) {
    await prisma.proposal.update({
      where: { id },
      data: { status: 'APPROVED' },
    })

    // Auto-advance deal to "Approved" stage
    if (proposal.dealId) {
      await advanceDealStage(
        proposal.dealId,
        'APPROVED',
        session.user.id!,
        `Proposal "${proposal.title}" approved — deal moved to Approved`
      )
    }
  }

  const statusLabel = status === 'CHANGES_REQUESTED' ? 'requested changes on' : status.toLowerCase()

  await createNotification({
    userId: proposal.createdById,
    type: 'APPROVAL_RESPONSE',
    message: `${session.user.name} ${statusLabel} proposal "${proposal.title}"`,
    relatedId: id,
    relatedType: 'proposal',
  })

  if (proposal.dealId) {
    await prisma.activity.create({
      data: {
        dealId: proposal.dealId,
        type: 'APPROVAL_RESPONSE',
        description: `${session.user.name} ${statusLabel} proposal "${proposal.title}"`,
        userId: session.user.id!,
      },
    })
  }

  return NextResponse.json({ success: true, allApproved })
}
