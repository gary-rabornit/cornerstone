import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { createNotification } from '@/lib/notifications'
import { sendEmail, proposalSentToClientEmail } from '@/lib/email'
import { advanceDealStage } from '@/lib/deal-stage'
import { v4 as uuidv4 } from 'uuid'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: { deal: true },
  })

  if (!proposal) return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })

  if (proposal.status !== 'APPROVED') {
    return NextResponse.json(
      { error: 'Proposal must be APPROVED before sending' },
      { status: 400 }
    )
  }

  const token = uuidv4()

  await prisma.clientAccess.create({
    data: {
      proposalId: id,
      token,
    },
  })

  await prisma.proposal.update({
    where: { id },
    data: { status: 'SENT' },
  })

  if (proposal.dealId) {
    await prisma.activity.create({
      data: {
        dealId: proposal.dealId,
        type: 'PROPOSAL_SENT',
        description: `Proposal "${proposal.title}" sent to client`,
        userId: session.user.id!,
      },
    })

    // Auto-advance deal to "Proposal Sent" stage
    await advanceDealStage(
      proposal.dealId,
      'PROPOSAL_SENT',
      session.user.id!,
      `Proposal "${proposal.title}" sent to client — deal moved to Proposal Sent`
    )
  }

  await createNotification({
    userId: proposal.createdById,
    type: 'PROPOSAL_SENT',
    message: `Proposal "${proposal.title}" has been sent to client`,
    relatedId: id,
    relatedType: 'proposal',
  })

  // Send email to client if we have their email
  const clientEmail = proposal.deal?.contactEmail
  const clientName = proposal.deal?.contactName || 'there'
  if (clientEmail) {
    const requester = await prisma.user.findUnique({
      where: { id: session.user.id! },
      select: { name: true },
    })

    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const clientViewUrl = `${APP_URL}/client/${token}`

    const { subject, html } = proposalSentToClientEmail({
      requesterName: requester?.name || 'Our team',
      proposalTitle: proposal.title,
      clientName,
      clientEmail,
      clientViewUrl,
    })
    sendEmail({ to: clientEmail, subject, html }).catch(() => {})
  }

  return NextResponse.json({ clientUrl: `/client/${token}` })
}
