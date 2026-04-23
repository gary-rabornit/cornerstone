import { prisma } from '@/lib/prisma'
import { PIPELINE_STAGES } from '@/lib/constants'
import { KanbanBoard } from '@/components/pipeline/kanban-board'

export default async function PipelinePage() {
  const deals = await prisma.deal.findMany({
    include: {
      owner: { select: { id: true, name: true, email: true, avatar: true } },
      proposals: {
        select: { id: true, status: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Compute per-company pipeline totals
  const companyTotals = ['RABORN_MEDIA', 'RABORN_IT', 'RABORN_SOFTWARE'].map((key) => {
    const companyDeals = deals.filter((d) => d.company === key && d.stage !== 'CLOSED_LOST')
    return {
      company: key,
      totalValue: companyDeals.reduce((sum, d) => sum + d.value, 0),
      dealCount: companyDeals.length,
    }
  })

  const columns = PIPELINE_STAGES.map((stage) => {
    const stageDeals = deals.filter((d) => d.stage === stage)
    return {
      stage,
      deals: stageDeals,
      totalValue: stageDeals.reduce((sum, d) => sum + d.value, 0),
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A202C]">Sales Pipeline</h1>
        <p className="mt-1 text-sm text-gray-500">
          Drag and drop deals between stages to update their status.
        </p>
      </div>

      <KanbanBoard columns={columns} companyTotals={companyTotals} />
    </div>
  )
}
