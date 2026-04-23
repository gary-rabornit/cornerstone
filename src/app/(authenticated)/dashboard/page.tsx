import { prisma } from '@/lib/prisma'
import { PIPELINE_STAGES } from '@/lib/constants'
import { COMPANY_OPTIONS, type CompanyKey } from '@/lib/companies'
import { MetricsGrid } from '@/components/dashboard/metrics-grid'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { PipelineChart } from '@/components/dashboard/pipeline-chart'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { CompanyBreakdown } from '@/components/dashboard/company-breakdown'

export default async function DashboardPage() {
  const [deals, pendingApprovals, awaitingSignature, recentActivities] =
    await Promise.all([
      prisma.deal.findMany({
        select: { value: true, stage: true, company: true },
      }),
      prisma.proposalApproval.count({
        where: { status: 'PENDING' },
      }),
      prisma.clientAccess.count({
        where: { status: 'PENDING', signedAt: null },
      }),
      prisma.activity.findMany({
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          deal: { select: { id: true, companyName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ])

  // Global metrics
  const pipelineValue = deals
    .filter((d) => d.stage !== 'CLOSED_LOST')
    .reduce((sum, d) => sum + d.value, 0)

  const closedDeals = deals.filter(
    (d) => d.stage === 'CLOSED_WON' || d.stage === 'CLOSED_LOST'
  )
  const winRate =
    closedDeals.length > 0
      ? Math.round(
          (closedDeals.filter((d) => d.stage === 'CLOSED_WON').length /
            closedDeals.length) *
            100
        )
      : 0

  const stageData = PIPELINE_STAGES.map(
    (stage) => {
      const stageDeals = deals.filter((d) => d.stage === stage)
      return {
        stage,
        value: stageDeals.reduce((sum, d) => sum + d.value, 0),
        count: stageDeals.length,
      }
    }
  )

  // Per-company metrics
  const companyStats = COMPANY_OPTIONS.map((co) => {
    const companyDeals = deals.filter((d) => d.company === co.key)
    const companyPipelineValue = companyDeals
      .filter((d) => d.stage !== 'CLOSED_LOST')
      .reduce((sum, d) => sum + d.value, 0)
    const companyClosed = companyDeals.filter(
      (d) => d.stage === 'CLOSED_WON' || d.stage === 'CLOSED_LOST'
    )
    const companyWinRate =
      companyClosed.length > 0
        ? Math.round(
            (companyClosed.filter((d) => d.stage === 'CLOSED_WON').length /
              companyClosed.length) *
              100
          )
        : 0

    return {
      company: co.key as CompanyKey,
      pipelineValue: companyPipelineValue,
      dealCount: companyDeals.filter((d) => d.stage !== 'CLOSED_LOST').length,
      winRate: companyWinRate,
    }
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1A202C]">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your sales pipeline and recent activity.
        </p>
      </div>

      <MetricsGrid
        pipelineValue={pipelineValue}
        pendingApprovals={pendingApprovals}
        awaitingSignature={awaitingSignature}
        winRate={winRate}
      />

      <CompanyBreakdown stats={companyStats} />

      <QuickActions />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <PipelineChart data={stageData} />
        </div>
        <div className="lg:col-span-2">
          <ActivityFeed activities={recentActivities} />
        </div>
      </div>
    </div>
  )
}
