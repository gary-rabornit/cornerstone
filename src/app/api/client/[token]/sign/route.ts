import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications'
import { advanceDealStage } from '@/lib/deal-stage'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const { signedByName, signedByEmail, signatureImage, status } = await request.json()

  if (!status || !['SIGNED', 'DECLINED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const clientAccess = await prisma.clientAccess.findUnique({
    where: { token },
    include: {
      proposal: {
        include: { deal: true },
      },
    },
  })

  if (!clientAccess) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.clientAccess.update({
    where: { id: clientAccess.id },
    data: {
      status,
      signedByName: signedByName || null,
      signedByEmail: signedByEmail || null,
      signatureImage: signatureImage || null,
      signedAt: new Date(),
    },
  })

  const proposalStatus = status === 'SIGNED' ? 'SIGNED' : 'DECLINED'
  await prisma.proposal.update({
    where: { id: clientAccess.proposalId },
    data: { status: proposalStatus },
  })

  const proposal = clientAccess.proposal
  const actionLabel = status === 'SIGNED' ? 'signed' : 'declined'

  await createNotification({
    userId: proposal.createdById,
    type: `PROPOSAL_${status}`,
    message: `${signedByName || 'Client'} ${actionLabel} proposal "${proposal.title}"`,
    relatedId: proposal.id,
    relatedType: 'proposal',
  })

  if (proposal.dealId) {
    await prisma.activity.create({
      data: {
        dealId: proposal.dealId,
        type: `PROPOSAL_${status}`,
        description: `${signedByName || 'Client'} ${actionLabel} proposal "${proposal.title}"`,
        userId: proposal.createdById,
      },
    })

    // Auto-advance deal stage based on client response
    const targetStage = status === 'SIGNED' ? 'CLOSED_WON' : 'CLOSED_LOST'
    const stageDesc = status === 'SIGNED'
      ? `Client signed proposal "${proposal.title}" — deal closed won`
      : `Client declined proposal "${proposal.title}" — deal closed lost`
    await advanceDealStage(proposal.dealId, targetStage, proposal.createdById, stageDesc)
  }

  return NextResponse.json({ success: true })
}
