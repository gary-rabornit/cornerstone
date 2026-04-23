import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ProposalRenderer } from '@/components/client/proposal-renderer'
import { SignatureSection } from '@/components/client/signature-section'
import { CheckCircle, Clock, XCircle } from 'lucide-react'
import type { ProposalSection, PricingItem, ServiceItem, PricingTier } from '@/types'

interface Props {
  params: Promise<{ token: string }>
}

export default async function ClientProposalPage({ params }: Props) {
  const { token } = await params

  const clientAccess = await prisma.clientAccess.findUnique({
    where: { token },
    include: {
      proposal: {
        include: {
          deal: true,
          createdBy: { select: { name: true, email: true } },
        },
      },
    },
  })

  if (!clientAccess) {
    notFound()
  }

  // Fire-and-forget: update view count and viewedAt
  prisma.clientAccess.update({
    where: { id: clientAccess.id },
    data: {
      viewedAt: new Date(),
      viewCount: { increment: 1 },
    },
  }).catch(() => {})

  const { proposal } = clientAccess

  const isExpired = proposal.expiresAt && new Date(proposal.expiresAt) < new Date()

  if (isExpired) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="h-16 w-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-6">
            <Clock className="h-8 w-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Proposal Expired</h1>
          <p className="text-gray-500 leading-relaxed">
            This proposal is no longer available for review. Please contact the sender to request an updated version.
          </p>
        </div>
      </div>
    )
  }

  const sections: ProposalSection[] = JSON.parse(proposal.sections || '[]')
  const pricingItems: PricingItem[] = JSON.parse(proposal.pricingItems || '[]')
  const pricingTiers: PricingTier[] = JSON.parse(proposal.pricingTiers || '[]')
  const services: ServiceItem[] = JSON.parse(proposal.services || '[]')

  const rendererProps = {
    title: proposal.title,
    company: proposal.company,
    sections,
    pricingItems,
    pricingMode: proposal.pricingMode,
    pricingTiers,
    services,
    repName: proposal.repName,
    repTitle: proposal.repTitle,
    repEmail: proposal.repEmail,
    repPhone: proposal.repPhone,
    clientName: proposal.deal?.contactName || '',
    companyName: proposal.deal?.companyName || '',
    createdAt: proposal.createdAt.toISOString(),
    showBranding: true,
  }

  if (clientAccess.status === 'SIGNED') {
    return (
      <div>
        <ProposalRenderer {...rendererProps} />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
            <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-7 w-7 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-green-900 mb-2">Proposal Signed</h2>
            <p className="text-green-700 mb-4">
              Signed by {clientAccess.signedByName} on{' '}
              {clientAccess.signedAt
                ? new Date(clientAccess.signedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })
                : 'N/A'}
            </p>
            {clientAccess.signatureImage && (
              <div className="inline-block bg-white border border-green-200 rounded-lg p-4 mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={clientAccess.signatureImage} alt="Signature" className="max-h-20" />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (clientAccess.status === 'DECLINED') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Proposal Declined</h1>
          <p className="text-gray-500 leading-relaxed">
            This proposal has been declined. If you have any questions, please contact the sender.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <ProposalRenderer {...rendererProps} />
      <SignatureSection token={token} proposalTitle={proposal.title} />
    </div>
  )
}
