import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { notifyDealWon } from '@/lib/slack'
import { getCompanyBranding } from '@/lib/companies'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { stage } = await request.json()

  if (!stage) {
    return NextResponse.json({ error: 'Stage is required' }, { status: 400 })
  }

  const existing = await prisma.deal.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Deal not found' }, { status: 404 })

  const deal = await prisma.deal.update({
    where: { id },
    data: {
      stage,
      stageEnteredAt: new Date(),
    },
    include: {
      owner: { select: { id: true, name: true, email: true, avatar: true } },
    },
  })

  await prisma.activity.create({
    data: {
      dealId: id,
      type: 'STAGE_CHANGE',
      description: `Deal moved to ${stage}`,
      userId: session.user.id!,
      metadata: JSON.stringify({ from: existing.stage, to: stage }),
    },
  })

  // Notify Slack when a deal is manually moved to Deal Won
  if (stage === 'CLOSED_WON' && existing.stage !== 'CLOSED_WON') {
    const latestProposal = await prisma.proposal.findFirst({
      where: { dealId: id },
      orderBy: { updatedAt: 'desc' },
      select: { title: true },
    })
    notifyDealWon({
      companyName: existing.companyName,
      contactName: existing.contactName,
      value: existing.value,
      proposalTitle: latestProposal?.title,
      ownerName: deal.owner.name,
      rabornCompany: getCompanyBranding(existing.company).name,
    }).catch(() => {})
  }

  return NextResponse.json(deal)
}
