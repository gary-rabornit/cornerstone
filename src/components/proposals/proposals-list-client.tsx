'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { cn, getStatusColor, getStatusName } from '@/lib/utils'
import { Search, FileText } from 'lucide-react'
import { getCompanyBranding, COMPANY_OPTIONS } from '@/lib/companies'
import { CompanyLogo } from '@/components/ui/company-logo'

interface ProposalRow {
  id: string
  title: string
  company: string
  status: string
  companyName: string | null
  createdByName: string
  createdAt: string
  updatedAt: string
}

const STATUS_TABS = ['All', 'Draft', 'Pending', 'Approved', 'Sent', 'Signed'] as const

const STATUS_MAP: Record<string, string> = {
  Draft: 'DRAFT',
  Pending: 'PENDING_APPROVAL',
  Approved: 'APPROVED',
  Sent: 'SENT',
  Signed: 'SIGNED',
}

export function ProposalsListClient({ proposals }: { proposals: ProposalRow[] }) {
  const [activeTab, setActiveTab] = useState<string>('All')
  const [companyFilter, setCompanyFilter] = useState<string>('ALL')
  const [search, setSearch] = useState('')
  const router = useRouter()

  // Per-company summary counts
  const companySummary = useMemo(() => {
    return COMPANY_OPTIONS.map((co) => {
      const coProposals = proposals.filter((p) => p.company === co.key)
      return {
        key: co.key,
        name: co.name,
        primaryColor: co.primaryColor,
        count: coProposals.length,
      }
    })
  }, [proposals])

  const filtered = useMemo(() => {
    let list = proposals

    // Company filter
    if (companyFilter !== 'ALL') {
      list = list.filter((p) => p.company === companyFilter)
    }

    // Status filter
    if (activeTab !== 'All') {
      const statusKey = STATUS_MAP[activeTab]
      list = list.filter((p) => p.status === statusKey)
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.companyName && p.companyName.toLowerCase().includes(q))
      )
    }

    return list
  }, [proposals, activeTab, companyFilter, search])

  return (
    <div className="space-y-4">
      {/* Company summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {companySummary.map((co) => (
          <button
            key={co.key}
            onClick={() => setCompanyFilter(companyFilter === co.key ? 'ALL' : co.key)}
            className={`flex items-center gap-8 rounded-xl border-2 bg-white p-4 text-left transition-all ${
              companyFilter === co.key
                ? 'border-[#00CFF8] shadow-sm'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <CompanyLogo companyKey={co.key} size="md" />
            <div>
              <p className="text-xl font-bold" style={{ color: co.primaryColor }}>
                {co.count}
              </p>
              <p className="text-xs text-gray-500">proposals</p>
            </div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Status Tabs */}
        <div className="flex gap-1 rounded-lg bg-white p-1 shadow-sm border border-gray-200">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                activeTab === tab
                  ? 'bg-[#003964] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search proposals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#00CFF8] focus:outline-none focus:ring-1 focus:ring-[#00CFF8]"
          />
        </div>
      </div>

      {/* Active company filter badge */}
      {companyFilter !== 'ALL' && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Filtered by:</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
            <CompanyLogo companyKey={companyFilter} size="xs" />
            {getCompanyBranding(companyFilter).name}
            <button
              onClick={() => setCompanyFilter('ALL')}
              className="ml-1 text-gray-400 hover:text-gray-600"
            >
              &times;
            </button>
          </span>
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-16">
          <FileText className="h-12 w-12 text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No proposals found</p>
          <p className="text-sm text-gray-400 mt-1">
            {search ? 'Try adjusting your search' : 'Create your first proposal to get started'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((proposal) => (
                <tr
                  key={proposal.id}
                  onClick={() => router.push(`/proposals/${proposal.id}`)}
                  className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-[#003964]">
                      {proposal.title}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {proposal.company && (
                      <CompanyLogo companyKey={proposal.company} size="sm" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {proposal.companyName || '---'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                        getStatusColor(proposal.status)
                      )}
                    >
                      {getStatusName(proposal.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(proposal.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(proposal.updatedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
