import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { ProposalRenderer } from '@/components/client/proposal-renderer'
import { ClientSigningShell } from '@/components/client/client-signing-shell'
import { CheckCircle, Clock, XCircle, Download } from 'lucide-react'
import { getCompanyBranding } from '@/lib/companies'
import type { ProposalSection, PricingItem, ServiceItem, PricingTier } from '@/types'

interface AuditEvent {
  timestamp: string
  event: string
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

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

  // Capture viewer info for audit trail
  const hdrs = await headers()
  const forwarded = hdrs.get('x-forwarded-for')
  const realIp = hdrs.get('x-real-ip')
  const viewerIp = forwarded?.split(',')[0].trim() || realIp?.trim() || 'unknown'
  const viewerUa = hdrs.get('user-agent') || 'unknown'

  // Fire-and-forget: update view count and append to audit trail
  ;(async () => {
    try {
      let existingAudit: AuditEvent[] = []
      try { existingAudit = JSON.parse(clientAccess.auditTrail || '[]') } catch {}

      // Only add a VIEW event if it's been >10 minutes since last view (avoid spam on refreshes)
      const lastViewEvent = [...existingAudit].reverse().find(e => e.event === 'PROPOSAL_VIEWED')
      const shouldLog = !lastViewEvent ||
        (Date.now() - new Date(lastViewEvent.timestamp).getTime()) > 10 * 60 * 1000

      const updates: Record<string, unknown> = {
        viewedAt: new Date(),
        viewCount: { increment: 1 },
      }

      if (shouldLog) {
        existingAudit.push({
          timestamp: new Date().toISOString(),
          event: 'PROPOSAL_VIEWED',
          details: { viewCount: clientAccess.viewCount + 1 },
          ipAddress: viewerIp,
          userAgent: viewerUa,
        })
        updates.auditTrail = JSON.stringify(existingAudit)
      }

      await prisma.clientAccess.update({
        where: { id: clientAccess.id },
        data: updates,
      })
    } catch {}
  })()

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

            {/* Download signed PDF */}
            <div className="mt-6">
              <a
                href={`/api/client/${token}/signed-pdf`}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Download Signed Copy
              </a>
            </div>
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

  const rabornCompanyName = getCompanyBranding(proposal.company).name

  return (
    <ClientSigningShell
      token={token}
      proposalTitle={proposal.title}
      proposalVersion={proposal.version}
      clientCompanyName={proposal.deal?.companyName || undefined}
      dealValue={proposal.deal?.value || undefined}
      rabornCompany={rabornCompanyName}
      rendererProps={rendererProps}
    />
  )
}
