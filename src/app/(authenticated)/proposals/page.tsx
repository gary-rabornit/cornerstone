import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getStatusColor, getStatusName } from '@/lib/utils'
import { FileText, Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { ProposalsListClient } from '@/components/proposals/proposals-list-client'

export default async function ProposalsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const proposals = await prisma.proposal.findMany({
    where: { isTemplate: false },
    include: {
      deal: {
        select: {
          id: true,
          companyName: true,
          contactName: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  const serialized = proposals.map((p) => ({
    id: p.id,
    title: p.title,
    company: p.company,
    status: p.status,
    companyName: p.deal?.companyName ?? null,
    createdByName: p.createdBy.name,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#003964]">Proposals</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create, manage, and track your proposals
          </p>
        </div>
        <Link
          href="/pipeline"
          className="inline-flex items-center gap-2 rounded-lg bg-[#00CFF8] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#00b8dd] transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Deal + Proposal
        </Link>
      </div>

      <ProposalsListClient proposals={serialized} />
    </div>
  )
}
