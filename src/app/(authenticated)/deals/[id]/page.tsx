import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getStatusColor, getStatusName, formatCurrency } from '@/lib/utils'
import { Plus, FileText } from 'lucide-react'
import { DealInfoCard } from '@/components/deals/deal-info-card'
import { ActivityTimeline } from '@/components/deals/activity-timeline'

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true, avatar: true } },
      proposals: {
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          version: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      activities: {
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!deal) {
    notFound()
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A202C]">{deal.companyName}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {deal.contactName}
            {deal.contactEmail && ` \u2022 ${deal.contactEmail}`}
          </p>
        </div>
        <Link
          href={`/proposals/new?${new URLSearchParams({
            dealId: deal.id,
            company: deal.company,
            clientCompanyName: deal.companyName,
            clientContactName: deal.contactName,
            clientContactEmail: deal.contactEmail || '',
            dealValue: String(deal.value),
          }).toString()}`}
          className="inline-flex items-center gap-2 rounded-lg bg-[#00CFF8] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#00b8dd] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Proposal
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          <DealInfoCard deal={deal} users={users} />

          {/* Proposals list */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-[#1A202C]">
              Linked Proposals
            </h3>
            {deal.proposals.length === 0 ? (
              <p className="text-sm text-gray-500">
                No proposals linked to this deal yet.
              </p>
            ) : (
              <div className="space-y-3">
                {deal.proposals.map((proposal) => (
                  <Link
                    key={proposal.id}
                    href={`/proposals/${proposal.id}`}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-4 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#625AED]/10">
                        <FileText className="h-4 w-4 text-[#625AED]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#1A202C] truncate group-hover:text-[#003964] transition-colors">
                          {proposal.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          v{proposal.version} &middot;{' '}
                          {new Date(proposal.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(proposal.status)}`}
                    >
                      {getStatusName(proposal.status)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div>
          <ActivityTimeline activities={deal.activities} />
        </div>
      </div>
    </div>
  )
}
