import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { ProposalRenderer } from '@/components/proposals/proposal-renderer'
import type { ProposalSection, PricingItem, ServiceItem, PricingTier } from '@/types'
import { ApprovalActionPanel } from '@/components/proposals/approval-action-panel'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProposalApprovePage({ params }: Props) {
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
      approvals: {
        include: {
          approver: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
  })

  if (!proposal) notFound()

  const currentApproval = proposal.approvals.find(
    (a) => a.approverId === session.user.id
  )

  if (!currentApproval) {
    redirect(`/proposals/${id}`)
  }

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
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-6 py-4">
        <p className="text-sm font-semibold text-blue-800">
          Approval Review
        </p>
        <p className="text-xs text-blue-600 mt-0.5">
          Review this proposal and provide your approval decision below
        </p>
      </div>

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

      <ApprovalActionPanel
        proposalId={id}
        approvalId={currentApproval.id}
        currentStatus={currentApproval.status}
      />
    </div>
  )
}
