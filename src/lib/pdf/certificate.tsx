import React from 'react'
import {
  Document, Page, Text, View, StyleSheet, Image,
} from '@react-pdf/renderer'
import { COMPANIES, type CompanyKey } from '@/lib/companies'

interface AuditEvent {
  timestamp: string
  event: string
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

interface CertificatePDFProps {
  proposal: {
    id: string
    title: string
    company: string
    version: number
    deal: {
      companyName: string
      contactName: string
      contactEmail: string | null
      value: number
    } | null
  }
  access: {
    id: string
    status: string
    signedAt: Date | null
    signedByName: string | null
    signedByEmail: string | null
    signedByTitle: string | null
    signedByPhone: string | null
    selectedPlanLabel: string | null
    signatureImage: string | null
    signatureMode: string | null
    ipAddress: string | null
    userAgent: string | null
    documentHash: string | null
    signedVersion: number | null
    consentedAt: Date | null
    auditTrail: string
    viewCount: number
    viewedAt: Date | null
    createdAt: Date
  }
  rabornLogoUrl: string
}

const EVENT_LABELS: Record<string, string> = {
  PROPOSAL_VIEWED: 'Proposal Viewed',
  CONSENT_GIVEN: 'E-Signature Consent Given',
  SIGNATURE_CAPTURED: 'Signature Captured',
  DOCUMENT_SNAPSHOT_CREATED: 'Document Snapshot Created',
  PROPOSAL_DECLINED: 'Proposal Declined',
}

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 0,
  }).format(n)
}

function fmtDateTime(d: Date | string | null): string {
  if (!d) return '—'
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', second: '2-digit',
    timeZoneName: 'short',
  })
}

export function CertificatePDF({ proposal, access, rabornLogoUrl }: CertificatePDFProps) {
  const branding = COMPANIES[proposal.company as CompanyKey] || COMPANIES.RABORN_MEDIA

  let auditEvents: AuditEvent[] = []
  try { auditEvents = JSON.parse(access.auditTrail || '[]') } catch {}
  // Chronological order for the certificate
  const sortedEvents = [...auditEvents].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  const styles = StyleSheet.create({
    page: { padding: 48, fontFamily: 'Helvetica', fontSize: 10, color: '#1A202C', lineHeight: 1.4 },

    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    headerLogo: { width: 130, height: 40, objectFit: 'contain' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: branding.primaryColor },
    headerSub: { fontSize: 10, color: '#718096', marginTop: 2 },

    statusBanner: { padding: 16, borderRadius: 6, marginBottom: 20 },
    statusSigned: { backgroundColor: '#10B981' },
    statusDeclined: { backgroundColor: '#EF4444' },
    statusPending: { backgroundColor: '#F59E0B' },
    statusBannerTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
    statusBannerSub: { fontSize: 10, color: '#FFFFFF', opacity: 0.9, marginTop: 2 },

    sectionTitle: {
      fontSize: 12, fontWeight: 'bold',
      color: branding.primaryColor,
      borderLeftWidth: 3, borderLeftColor: branding.accentColor,
      paddingLeft: 10, marginBottom: 10, marginTop: 16,
    },

    grid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
    col: { width: '50%', paddingRight: 10, marginBottom: 12 },
    colFull: { width: '100%', marginBottom: 12 },
    label: { fontSize: 8, fontWeight: 'bold', color: '#718096', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
    value: { fontSize: 10, color: '#1A202C', fontWeight: 'bold' },
    valueMono: { fontSize: 8.5, color: '#1A202C', fontFamily: 'Courier' },
    valueNormal: { fontSize: 10, color: '#2D3748' },

    signatureBox: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 4, padding: 12, alignItems: 'center', marginTop: 4, backgroundColor: '#F8FAFC' },
    signatureImage: { maxHeight: 60, maxWidth: 200, objectFit: 'contain' },

    eventRow: { flexDirection: 'row', marginBottom: 10, borderBottomWidth: 0.5, borderBottomColor: '#E2E8F0', paddingBottom: 8 },
    eventDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: branding.accentColor, marginTop: 4, marginRight: 10 },
    eventBody: { flex: 1 },
    eventLabel: { fontSize: 10, fontWeight: 'bold', color: '#1A202C' },
    eventMeta: { fontSize: 8, color: '#718096', marginTop: 1 },
    eventDetails: { fontSize: 8, color: '#4A5568', fontFamily: 'Courier', marginTop: 3, backgroundColor: '#F8FAFC', padding: 5, borderRadius: 2 },

    legalBox: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', borderRadius: 4, padding: 10, marginTop: 14 },
    legalTitle: { fontSize: 9, fontWeight: 'bold', color: '#1E40AF', marginBottom: 4 },
    legalText: { fontSize: 8, color: '#1E3A8A', lineHeight: 1.5 },

    footer: {
      position: 'absolute', bottom: 24, left: 48, right: 48,
      fontSize: 8, color: '#A0AEC0', textAlign: 'center',
      borderTopWidth: 0.5, borderTopColor: '#E2E8F0', paddingTop: 8,
    },
    footerPage: { position: 'absolute', bottom: 24, right: 48, fontSize: 8, color: '#A0AEC0' },
  })

  const statusStyle =
    access.status === 'SIGNED' ? styles.statusSigned :
    access.status === 'DECLINED' ? styles.statusDeclined :
    styles.statusPending

  const statusTitle =
    access.status === 'SIGNED' ? '✓ Document Electronically Signed' :
    access.status === 'DECLINED' ? '✗ Proposal Declined' :
    '⏳ Awaiting Signature'

  const statusSub =
    access.status === 'SIGNED' ? `Signed by ${access.signedByName || 'client'} on ${fmtDateTime(access.signedAt)}` :
    access.status === 'DECLINED' ? `Declined by ${access.signedByName || 'client'} on ${fmtDateTime(access.signedAt)}` :
    `Sent ${fmtDateTime(access.createdAt)} · Viewed ${access.viewCount} time${access.viewCount !== 1 ? 's' : ''}`

  return (
    <Document
      title={`Certificate of Completion — ${proposal.title}`}
      author={branding.name}
      subject="Certificate of Completion"
      producer="Cornerstone"
      creator="Cornerstone"
    >
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Certificate of Completion</Text>
            <Text style={styles.headerSub}>Electronic signature audit record</Text>
          </View>
          <Image style={styles.headerLogo} src={rabornLogoUrl} />
        </View>

        {/* Status banner */}
        <View style={[styles.statusBanner, statusStyle]}>
          <Text style={styles.statusBannerTitle}>{statusTitle}</Text>
          <Text style={styles.statusBannerSub}>{statusSub}</Text>
        </View>

        {/* Document info */}
        <Text style={styles.sectionTitle}>Document Information</Text>
        <View style={styles.grid}>
          <View style={styles.col}>
            <Text style={styles.label}>Document Title</Text>
            <Text style={styles.value}>{proposal.title}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Raborn Company</Text>
            <Text style={styles.value}>{branding.name}</Text>
          </View>
          {proposal.deal && (
            <>
              <View style={styles.col}>
                <Text style={styles.label}>Client Company</Text>
                <Text style={styles.value}>{proposal.deal.companyName}</Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Primary Contact</Text>
                <Text style={styles.value}>{proposal.deal.contactName}</Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Contact Email</Text>
                <Text style={styles.valueNormal}>{proposal.deal.contactEmail || '—'}</Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Agreement Value</Text>
                <Text style={styles.value}>{fmtCurrency(proposal.deal.value)}</Text>
              </View>
            </>
          )}
          <View style={styles.col}>
            <Text style={styles.label}>Document Version</Text>
            <Text style={styles.value}>v{access.signedVersion || proposal.version}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Reference ID</Text>
            <Text style={styles.valueMono}>{access.id.slice(0, 12).toUpperCase()}</Text>
          </View>
          {access.selectedPlanLabel && (
            <View style={styles.colFull}>
              <Text style={styles.label}>Selected Plan</Text>
              <Text style={[styles.value, { color: '#0891B2' }]}>{access.selectedPlanLabel}</Text>
            </View>
          )}
          {access.documentHash && (
            <View style={styles.colFull}>
              <Text style={styles.label}>Document Hash (SHA-256)</Text>
              <Text style={styles.valueMono}>{access.documentHash}</Text>
            </View>
          )}
        </View>

        {/* Signer info (if signed or declined) */}
        {(access.status === 'SIGNED' || access.status === 'DECLINED') && (
          <>
            <Text style={styles.sectionTitle}>
              {access.status === 'SIGNED' ? 'Signer Information' : 'Decliner Information'}
            </Text>
            <View style={styles.grid}>
              <View style={styles.col}>
                <Text style={styles.label}>Full Legal Name</Text>
                <Text style={styles.value}>{access.signedByName || '—'}</Text>
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.valueNormal}>{access.signedByEmail || '—'}</Text>
              </View>
              {access.signedByTitle && (
                <View style={styles.col}>
                  <Text style={styles.label}>Title / Role</Text>
                  <Text style={styles.value}>{access.signedByTitle}</Text>
                </View>
              )}
              {access.signedByPhone && (
                <View style={styles.col}>
                  <Text style={styles.label}>Phone</Text>
                  <Text style={styles.value}>{access.signedByPhone}</Text>
                </View>
              )}
              <View style={styles.col}>
                <Text style={styles.label}>IP Address</Text>
                <Text style={styles.valueMono}>{access.ipAddress || '—'}</Text>
              </View>
              {access.consentedAt && (
                <View style={styles.col}>
                  <Text style={styles.label}>Consent Given At</Text>
                  <Text style={styles.valueNormal}>{fmtDateTime(access.consentedAt)}</Text>
                </View>
              )}
              {access.signatureMode && (
                <View style={styles.col}>
                  <Text style={styles.label}>Signature Method</Text>
                  <Text style={styles.value}>
                    {access.signatureMode === 'draw' ? 'Drawn signature' : access.signatureMode === 'type' ? 'Typed signature' : access.signatureMode}
                  </Text>
                </View>
              )}
              {access.userAgent && (
                <View style={styles.colFull}>
                  <Text style={styles.label}>Browser / Device</Text>
                  <Text style={styles.valueMono}>{access.userAgent}</Text>
                </View>
              )}
            </View>

            {access.signatureImage && (
              <>
                <Text style={styles.label}>Captured Signature</Text>
                <View style={styles.signatureBox}>
                  <Image style={styles.signatureImage} src={access.signatureImage} />
                </View>
              </>
            )}
          </>
        )}

        {/* Event timeline */}
        <Text style={styles.sectionTitle}>Event Timeline</Text>
        <View>
          {sortedEvents.length === 0 ? (
            <Text style={{ fontSize: 9, color: '#A0AEC0', fontStyle: 'italic' }}>No events recorded yet.</Text>
          ) : (
            sortedEvents.map((event, i) => (
              <View key={i} style={styles.eventRow}>
                <View style={styles.eventDot} />
                <View style={styles.eventBody}>
                  <Text style={styles.eventLabel}>{EVENT_LABELS[event.event] || event.event}</Text>
                  <Text style={styles.eventMeta}>
                    {fmtDateTime(event.timestamp)}
                    {event.ipAddress && event.ipAddress !== 'unknown' && ` · IP: ${event.ipAddress}`}
                  </Text>
                  {event.details && Object.keys(event.details).length > 0 && (
                    <Text style={styles.eventDetails}>{JSON.stringify(event.details, null, 2)}</Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Legal Notice */}
        <View style={styles.legalBox}>
          <Text style={styles.legalTitle}>About This Certificate</Text>
          <Text style={styles.legalText}>
            This certificate documents the electronic signature process under the U.S. E-SIGN Act
            (15 U.S.C. § 7001) and the Uniform Electronic Transactions Act (UETA). The signer
            provided affirmative consent to conduct business electronically before signing.
            {'\n\n'}
            The SHA-256 hash uniquely identifies the content that was signed; any subsequent
            modification to the source document would produce a different hash. The Reference ID
            can be used to locate this record in the Cornerstone system.
          </Text>
        </View>

        <Text style={styles.footer}>{branding.name} · Certificate of Completion · {proposal.title}</Text>
        <Text style={styles.footerPage} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
      </Page>
    </Document>
  )
}
