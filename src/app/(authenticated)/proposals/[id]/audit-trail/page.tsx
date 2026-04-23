import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Shield, CheckCircle, Eye, FileCheck,
  AlertCircle, Globe, Clock, User, Mail, Hash, Fingerprint,
  Download, FileText,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { getCompanyBranding } from '@/lib/companies'

interface AuditEvent {
  timestamp: string
  event: string
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

const EVENT_INFO: Record<string, { label: string; icon: typeof Eye; color: string }> = {
  PROPOSAL_VIEWED: { label: 'Proposal Viewed', icon: Eye, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  CONSENT_GIVEN: { label: 'E-Signature Consent Given', icon: Shield, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  SIGNATURE_CAPTURED: { label: 'Signature Captured', icon: CheckCircle, color: 'text-green-600 bg-green-50 border-green-200' },
  DOCUMENT_SNAPSHOT_CREATED: { label: 'Document Snapshot Created', icon: FileCheck, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  PROPOSAL_DECLINED: { label: 'Proposal Declined', icon: AlertCircle, color: 'text-red-600 bg-red-50 border-red-200' },
}

export default async function AuditTrailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { id } = await params

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: {
      deal: true,
      clientAccess: true,
      createdBy: { select: { name: true, email: true } },
    },
  })

  if (!proposal) notFound()

  const access = proposal.clientAccess
  const branding = getCompanyBranding(proposal.company)

  let auditEvents: AuditEvent[] = []
  if (access?.auditTrail) {
    try { auditEvents = JSON.parse(access.auditTrail) } catch {}
  }

  const sortedEvents = [...auditEvents].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/proposals/${id}`}
            className="rounded-lg p-2 text-gray-400 hover:bg-white hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#003964]">Audit Trail</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Complete history of this proposal&rsquo;s electronic signature process.
            </p>
          </div>
        </div>

        {/* Download buttons */}
        {access && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {access.status === 'SIGNED' && (
              <a
                href={`/api/proposals/${id}/signed-pdf`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#003964] px-3 py-2 text-sm font-semibold text-white hover:bg-[#003964]/90 transition-colors"
              >
                <FileText className="h-4 w-4" />
                Signed Proposal PDF
              </a>
            )}
            <a
              href={`/api/proposals/${id}/certificate`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              Certificate
            </a>
          </div>
        )}
      </div>

      {/* Certificate Card (if signed) */}
      {access?.status === 'SIGNED' && (
        <div className="bg-white border-2 border-green-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-5 border-b border-green-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-green-900">Certificate of Completion</h2>
                <p className="text-sm text-green-700">This document has been electronically signed.</p>
              </div>
            </div>
          </div>
          <div className="px-6 py-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            <Field icon={FileCheck} label="Document" value={proposal.title} />
            <Field icon={Shield} label="Raborn Company" value={branding.name} />
            <Field icon={User} label="Signed By" value={access.signedByName || '—'} />
            <Field icon={Mail} label="Email" value={access.signedByEmail || '—'} />
            {access.signedByTitle && <Field icon={User} label="Title / Role" value={access.signedByTitle} />}
            <Field icon={Clock} label="Signed At" value={access.signedAt ? new Date(access.signedAt).toLocaleString() : '—'} />
            <Field icon={Globe} label="IP Address" value={access.ipAddress || '—'} mono />
            <Field icon={Hash} label="Document Version" value={`v${access.signedVersion || proposal.version}`} />
            <Field icon={Fingerprint} label="Document Hash (SHA-256)" value={access.documentHash || '—'} mono span2 />
            <Field icon={Shield} label="Reference ID" value={access.id.slice(0, 12).toUpperCase()} mono />
            {access.consentedAt && (
              <Field icon={Shield} label="Consent Given At" value={new Date(access.consentedAt).toLocaleString()} />
            )}
          </div>

          {access.signatureImage && (
            <div className="px-6 pb-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Captured Signature</p>
              <div className="inline-block bg-gray-50 border border-gray-200 rounded-lg p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={access.signatureImage} alt="Signature" className="max-h-24" />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Signature mode: <span className="font-medium">{access.signatureMode || 'unknown'}</span>
              </p>
            </div>
          )}

          {access.userAgent && (
            <div className="px-6 pb-6 border-t border-green-100 pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Browser / Device</p>
              <p className="text-xs text-gray-600 font-mono break-all">{access.userAgent}</p>
            </div>
          )}
        </div>
      )}

      {/* Declined Banner */}
      {access?.status === 'DECLINED' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <h2 className="font-bold text-red-900">Proposal Declined</h2>
            <p className="text-sm text-red-700 mt-1">
              Declined by {access.signedByName || 'client'} on{' '}
              {access.signedAt ? new Date(access.signedAt).toLocaleString() : 'unknown date'}.
            </p>
          </div>
        </div>
      )}

      {/* Pending Banner */}
      {access?.status === 'PENDING' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3">
          <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h2 className="font-bold text-amber-900">Awaiting Signature</h2>
            <p className="text-sm text-amber-700 mt-1">
              This proposal has been sent but not yet signed.
              {access.viewCount > 0 && ` Viewed ${access.viewCount} time${access.viewCount !== 1 ? 's' : ''}.`}
            </p>
          </div>
        </div>
      )}

      {/* Not Sent */}
      {!access && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex items-start gap-3">
          <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
          <div>
            <h2 className="font-bold text-gray-700">Not Yet Sent to Client</h2>
            <p className="text-sm text-gray-500 mt-1">
              This proposal has not been sent to a client, so there is no audit trail yet.
            </p>
          </div>
        </div>
      )}

      {/* Deal Info */}
      {proposal.deal && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Agreement Details</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Client</p>
              <p className="mt-1 font-medium text-gray-900">{proposal.deal.companyName}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact</p>
              <p className="mt-1 font-medium text-gray-900">{proposal.deal.contactName}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact Email</p>
              <p className="mt-1 text-gray-900">{proposal.deal.contactEmail || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Value</p>
              <p className="mt-1 font-bold text-[#003964]">{formatCurrency(proposal.deal.value)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Event Timeline */}
      {sortedEvents.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Event Timeline</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {sortedEvents.length} event{sortedEvents.length !== 1 ? 's' : ''} recorded, most recent first.
            </p>
          </div>
          <div className="divide-y divide-gray-100">
            {sortedEvents.map((event, idx) => {
              const info = EVENT_INFO[event.event] || {
                label: event.event,
                icon: Clock,
                color: 'text-gray-600 bg-gray-50 border-gray-200',
              }
              const Icon = info.icon
              return (
                <div key={idx} className="px-6 py-4 flex gap-4">
                  <div className={`h-10 w-10 rounded-lg border flex items-center justify-center flex-shrink-0 ${info.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-semibold text-gray-900">{info.label}</p>
                      <p className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleString()}</p>
                    </div>
                    {event.ipAddress && event.ipAddress !== 'unknown' && (
                      <p className="text-xs text-gray-500 mt-1 font-mono">
                        From IP: {event.ipAddress}
                      </p>
                    )}
                    {event.details && Object.keys(event.details).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                          Details
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-50 p-3 rounded font-mono overflow-auto max-h-64">
                          {JSON.stringify(event.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Technical Notes */}
      {access?.status === 'SIGNED' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-900">
          <p className="font-semibold mb-2">About this Audit Trail</p>
          <ul className="list-disc pl-5 space-y-1 text-xs leading-relaxed">
            <li>This signature was captured under the U.S. E-SIGN Act (15 U.S.C. § 7001) and UETA.</li>
            <li>The document snapshot and SHA-256 hash preserve the exact content that was signed — any later edits to the proposal do not affect the signed version.</li>
            <li>The Reference ID and Document Hash can be used to verify the integrity of this signature.</li>
            <li>All data above is stored in the Cornerstone database and can be exported or retrieved at any time.</li>
          </ul>
        </div>
      )}
    </div>
  )
}

function Field({
  icon: Icon,
  label,
  value,
  mono = false,
  span2 = false,
}: {
  icon: typeof Eye
  label: string
  value: string
  mono?: boolean
  span2?: boolean
}) {
  return (
    <div className={span2 ? 'sm:col-span-2' : ''}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </p>
      <p className={`mt-1 text-sm text-gray-900 ${mono ? 'font-mono text-xs break-all' : 'font-medium'}`}>
        {value}
      </p>
    </div>
  )
}
