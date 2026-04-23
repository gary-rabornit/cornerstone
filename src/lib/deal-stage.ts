import { prisma } from '@/lib/prisma'
import { notifyDealWon } from '@/lib/slack'
import { getCompanyBranding } from '@/lib/companies'

/**
 * Automatically advance a deal's stage based on proposal events.
 * Only moves forward — never moves a deal backward in the pipeline.
 */

const STAGE_ORDER = [
  'LEAD',
  'QUALIFICATION',      // Proposal Created
  'PENDING_APPROVAL',
  'APPROVED',
  'PROPOSAL_SENT',
  'CLOSED_WON',
  'CLOSED_LOST',
]

function stageIndex(stage: string): number {
  return STAGE_ORDER.indexOf(stage)
}

export async function advanceDealStage(
  dealId: string,
  targetStage: string,
  userId: string,
  description: string
) {
  const deal = await prisma.deal.findUnique({ where: { id: dealId } })
  if (!deal) return

  const currentIdx = stageIndex(deal.stage)
  const targetIdx = stageIndex(targetStage)

  // Only move forward, never backward (except CLOSED_LOST which can come from any stage)
  if (targetStage === 'CLOSED_LOST' || targetIdx > currentIdx) {
    await prisma.deal.update({
      where: { id: dealId },
      data: {
        stage: targetStage,
        stageEnteredAt: new Date(),
      },
    })

    await prisma.activity.create({
      data: {
        dealId,
        type: 'STAGE_CHANGE',
        description,
        userId,
        metadata: JSON.stringify({ from: deal.stage, to: targetStage }),
      },
    })

    // Notify Slack when a deal is won
    if (targetStage === 'CLOSED_WON') {
      const owner = await prisma.user.findUnique({ where: { id: deal.ownerId }, select: { name: true } })
      const latestProposal = await prisma.proposal.findFirst({
        where: { dealId },
        orderBy: { updatedAt: 'desc' },
        select: { title: true },
      })
      notifyDealWon({
        companyName: deal.companyName,
        contactName: deal.contactName,
        value: deal.value,
        proposalTitle: latestProposal?.title,
        ownerName: owner?.name || 'Unknown',
        rabornCompany: getCompanyBranding(deal.company).name,
      }).catch(() => {})
    }
  }
}
