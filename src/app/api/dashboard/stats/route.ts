import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [deals, pendingApprovals, awaitingSignature] = await Promise.all([
    prisma.deal.findMany({
      select: { value: true, stage: true },
    }),
    prisma.proposal.count({
      where: { status: 'PENDING_APPROVAL' },
    }),
    prisma.proposal.count({
      where: { status: 'SENT' },
    }),
  ])

  const totalPipelineValue = deals
    .filter(d => d.stage !== 'CLOSED_LOST')
    .reduce((sum, d) => sum + d.value, 0)

  const closedWon = deals.filter(d => d.stage === 'CLOSED_WON').length
  const closedLost = deals.filter(d => d.stage === 'CLOSED_LOST').length
  const winRate = closedWon + closedLost > 0
    ? (closedWon / (closedWon + closedLost)) * 100
    : 0

  const dealsByStage: Record<string, number> = {}
  for (const deal of deals) {
    dealsByStage[deal.stage] = (dealsByStage[deal.stage] || 0) + deal.value
  }

  return NextResponse.json({
    totalPipelineValue,
    pendingApprovals,
    awaitingSignature,
    winRate,
    dealsByStage,
  })
}
