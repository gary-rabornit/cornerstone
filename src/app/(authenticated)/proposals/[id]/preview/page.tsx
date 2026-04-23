import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { ProposalRenderer } from '@/components/proposals/proposal-renderer'
import { ArrowLeft, Eye } from 'lucide-react'
import Link from 'next/link'
import type { ProposalSection, PricingItem, ServiceItem, PricingTier } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProposalPreviewPage({ params }: Props) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { id } = await params

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: {
      deal: {
        select: {
          companyName: true,
          contactName: true,
        },
      },
      createdBy: {
        select: { name: true },
      },
    },
  })

  if (!proposal) notFound()

  const sections: ProposalSection[] =
    typeof proposal.sections === 'string'
      ? JSON.parse(proposal.sections)
      : (proposal.sections as ProposalSection[]) || []

  const pricingItems: PricingItem[] =
    typeof proposal.pricingItems === 'string'
      ? JSON.parse(proposal.pricingItems)
      : (proposal.pricingItems as PricingItem[]) || []

  const pricingTiers: PricingTier[] =
    typeof proposal.pricingTiers === 'string'
      ? JSON.parse(proposal.pricingTiers)
      : (proposal.pricingTiers as PricingTier[]) || []

  const services: ServiceItem[] =
    typeof proposal.services === 'string'
      ? JSON.parse(proposal.services)
      : (proposal.services as ServiceItem[]) || []

  return (
    <div>
      {/* Preview Banner */}
      <div className="no-print mb-6 rounded-xl border border-amber-200 bg-amber-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Eye className="h-5 w-5 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Preview Mode
            </p>
            <p className="text-xs text-amber-600">
              This is how clients will see your proposal
            </p>
          </div>
        </div>
        <Link
          href={`/proposals/${id}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-amber-200 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Editor
        </Link>
      </div>

      {/* Rendered Proposal */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <ProposalRenderer
          title={proposal.title}
          company={proposal.company}
          sections={sections}
          pricingItems={pricingItems}
          pricingMode={proposal.pricingMode}
          pricingTiers={pricingTiers}
          services={services}
          repName={proposal.repName}
          repTitle={proposal.repTitle}
          repEmail={proposal.repEmail}
          repPhone={proposal.repPhone}
          deal={proposal.deal}
          createdBy={proposal.createdBy}
        />
      </div>
    </div>
  )
}
