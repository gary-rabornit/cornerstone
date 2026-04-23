import React from 'react'
import {
  Document, Page, Text, View, StyleSheet, Image, Font,
} from '@react-pdf/renderer'
import { COMPANIES, type CompanyKey } from '@/lib/companies'
import type { ProposalSection, PricingItem, PricingTier, ServiceItem } from '@/types'

interface SignedProposalPDFProps {
  proposal: {
    id: string
    title: string
    company: string
    industry: string | null
    serviceType: string | null
    sections: string
    pricingItems: string
    pricingMode: string
    pricingTiers: string
    services: string
    repName: string | null
    repTitle: string | null
    repEmail: string | null
    repPhone: string | null
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
    signedAt: Date | null
    signedByName: string | null
    signedByEmail: string | null
    signedByTitle: string | null
    signedByPhone: string | null
    signatureImage: string | null
    signatureMode: string | null
    ipAddress: string | null
    documentHash: string | null
    signedVersion: number | null
  }
  rabornLogoUrl: string  // absolute URL to logo
}

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(n)
}

function fmtDate(d: Date | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
    timeZoneName: 'short',
  })
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function safeParse<T>(json: string, fallback: T): T {
  try {
    const parsed = JSON.parse(json)
    return parsed as T
  } catch {
    return fallback
  }
}

export function SignedProposalPDF({ proposal, access, rabornLogoUrl }: SignedProposalPDFProps) {
  const branding = COMPANIES[proposal.company as CompanyKey] || COMPANIES.RABORN_MEDIA
  const sections = safeParse<ProposalSection[]>(proposal.sections || '[]', [])
  const pricingItems = safeParse<PricingItem[]>(proposal.pricingItems || '[]', [])
  const pricingTiers = safeParse<PricingTier[]>(proposal.pricingTiers || '[]', [])
  const services = safeParse<ServiceItem[]>(proposal.services || '[]', [])

  const styles = StyleSheet.create({
    page: { padding: 48, fontFamily: 'Helvetica', fontSize: 10, color: '#1A202C', lineHeight: 1.5 },
    coverPage: { padding: 0 },
    coverTop: { padding: 48, paddingBottom: 24 },
    coverDate: { fontSize: 10, color: '#718096' },
    coverLogo: { width: 180, height: 56, objectFit: 'contain', marginTop: 40, marginBottom: 60, alignSelf: 'center' },
    coverTitle: { fontSize: 36, fontWeight: 'bold', textAlign: 'center', color: branding.primaryColor, marginBottom: 80 },
    coverBanner: { backgroundColor: branding.primaryColor, padding: 36, paddingTop: 40 },
    coverServiceType: { fontSize: 28, fontWeight: 'bold', color: branding.accentColor },
    coverServiceLabel: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
    coverProjectName: { fontSize: 16, color: '#FFFFFF', marginTop: 12, opacity: 0.9 },
    coverRep: { marginTop: 32, color: '#FFFFFF' },
    coverRepName: { fontSize: 12, fontWeight: 'bold' },
    coverRepDetail: { fontSize: 9, opacity: 0.85, marginTop: 2 },

    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 16,
      borderLeftWidth: 4,
      borderLeftColor: branding.accentColor,
      paddingLeft: 12,
      color: branding.primaryColor,
    },
    sectionHeader: { marginBottom: 24, marginTop: 8 },
    prose: { fontSize: 10.5, color: '#2D3748', lineHeight: 1.7, marginBottom: 8 },

    servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, marginBottom: 16 },
    serviceChip: {
      backgroundColor: `${branding.accentColor}20`,
      paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12,
      marginRight: 6, marginBottom: 6,
    },
    serviceChipText: { fontSize: 9, color: branding.primaryColor, fontWeight: 'bold' },

    pricingTable: { marginTop: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 4 },
    pricingHeader: { flexDirection: 'row', backgroundColor: branding.primaryColor, padding: 10 },
    pricingHeaderCol: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' },
    pricingRow: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
    pricingRowAlt: { backgroundColor: '#F8FAFC' },
    pricingTotal: { flexDirection: 'row', padding: 12, backgroundColor: `${branding.accentColor}15`, borderTopWidth: 2, borderTopColor: branding.primaryColor },
    pricingTotalLabel: { fontSize: 12, fontWeight: 'bold', color: branding.primaryColor },
    pricingTotalValue: { fontSize: 14, fontWeight: 'bold', color: branding.primaryColor, textAlign: 'right' },

    tierCard: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 6, marginBottom: 12, overflow: 'hidden' },
    tierHeader: { padding: 12, backgroundColor: branding.primaryColor },
    tierTitle: { fontSize: 13, fontWeight: 'bold', color: '#FFFFFF' },
    tierRecommended: { backgroundColor: branding.accentColor },
    tierBody: { padding: 14 },
    tierRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    tierRowLabel: { fontSize: 9, color: '#718096' },
    tierRowValue: { fontSize: 10, fontWeight: 'bold', color: '#1A202C' },
    tierTotal: { fontSize: 15, fontWeight: 'bold', color: branding.primaryColor, marginTop: 8 },

    // Certificate page
    certPage: { padding: 48 },
    certBanner: { backgroundColor: '#10B981', padding: 24, borderRadius: 8, marginBottom: 24 },
    certBannerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' },
    certBannerSub: { fontSize: 11, color: '#FFFFFF', textAlign: 'center', marginTop: 4, opacity: 0.9 },
    certSection: { marginBottom: 20 },
    certLabel: { fontSize: 8, fontWeight: 'bold', color: '#718096', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
    certValue: { fontSize: 11, color: '#1A202C', fontWeight: 'bold' },
    certValueMono: { fontSize: 9, color: '#1A202C', fontFamily: 'Courier' },
    certGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
    certCol: { width: '50%', paddingRight: 8, marginBottom: 14 },
    certColFull: { width: '100%', marginBottom: 14 },
    certSignatureBox: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 4, padding: 16, alignItems: 'center', backgroundColor: '#FFFFFF', marginTop: 8 },
    certSignatureImage: { maxHeight: 80, maxWidth: 240, objectFit: 'contain' },

    certLegalBox: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', borderRadius: 6, padding: 14, marginTop: 12 },
    certLegalTitle: { fontSize: 10, fontWeight: 'bold', color: '#1E40AF', marginBottom: 6 },
    certLegalText: { fontSize: 8.5, color: '#1E3A8A', lineHeight: 1.5 },

    footer: {
      position: 'absolute',
      bottom: 24, left: 48, right: 48,
      fontSize: 8, color: '#A0AEC0', textAlign: 'center',
      borderTopWidth: 0.5, borderTopColor: '#E2E8F0', paddingTop: 8,
    },
    footerPage: { position: 'absolute', bottom: 24, right: 48, fontSize: 8, color: '#A0AEC0' },
  })

  // Cover data from the "cover" section (if any)
  const coverSection = sections.find(s => s.type === 'cover') as ProposalSection & {
    serviceType?: string; projectName?: string; clientName?: string; date?: string;
  } | undefined
  const serviceType = coverSection?.serviceType || proposal.serviceType || 'Professional'
  const projectName = coverSection?.projectName || proposal.title
  const clientName = coverSection?.clientName || proposal.deal?.companyName || ''
  const coverDate = coverSection?.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  // Order text sections similar to how the web renders
  const execSummary = sections.find(s => s.type === 'executive_summary')
  const servicesOverview = sections.find(s => s.type === 'services_overview')
  const scope = sections.find(s => s.type === 'scope')
  const servicesDetail = sections.find(s => s.type === 'services_detail')
  const terms = sections.find(s => s.type === 'terms')

  const pricingTotal = pricingItems.reduce((sum, p) => sum + (p.total || 0), 0)

  return (
    <Document
      title={`Signed — ${proposal.title}`}
      author={branding.name}
      subject={`Signed proposal for ${proposal.deal?.companyName || 'Client'}`}
      producer="Cornerstone"
      creator="Cornerstone"
    >
      {/* ─── Cover Page ─────────────────────────── */}
      <Page size="LETTER" style={styles.coverPage}>
        <View style={styles.coverTop}>
          <Text style={styles.coverDate}>{coverDate}</Text>
          <Image style={styles.coverLogo} src={rabornLogoUrl} />
          <Text style={styles.coverTitle}>{clientName || proposal.title}</Text>
        </View>
        <View style={styles.coverBanner}>
          <Text>
            <Text style={styles.coverServiceType}>{serviceType}</Text>
            <Text style={styles.coverServiceLabel}> Services</Text>
          </Text>
          <Text style={styles.coverProjectName}>{projectName}</Text>
          {proposal.repName && (
            <View style={styles.coverRep}>
              <Text style={styles.coverRepName}>{proposal.repName}</Text>
              {proposal.repTitle && <Text style={styles.coverRepDetail}>{proposal.repTitle}</Text>}
              {proposal.repEmail && <Text style={styles.coverRepDetail}>{proposal.repEmail}</Text>}
              {proposal.repPhone && <Text style={styles.coverRepDetail}>{proposal.repPhone}</Text>}
            </View>
          )}
        </View>
      </Page>

      {/* ─── Body Content ────────────────────────── */}
      {(execSummary?.content || servicesOverview?.content || services.length > 0) && (
        <Page size="LETTER" style={styles.page}>
          {execSummary?.content && (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Executive Summary</Text>
              <Text style={styles.prose}>{stripHtml(execSummary.content)}</Text>
            </View>
          )}

          {servicesOverview?.content && (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Services Overview</Text>
              <Text style={styles.prose}>{stripHtml(servicesOverview.content)}</Text>
              {services.filter(s => s.enabled).length > 0 && (
                <>
                  <Text style={{ fontSize: 9, color: '#718096', marginTop: 8, marginBottom: 6 }}>Included Services:</Text>
                  <View style={styles.servicesGrid}>
                    {services.filter(s => s.enabled).map((s, i) => (
                      <View key={i} style={styles.serviceChip}>
                        <Text style={styles.serviceChipText}>{s.name}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
          )}

          <Text style={styles.footer}>{branding.name} · Signed proposal · {proposal.title}</Text>
          <Text style={styles.footerPage} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
        </Page>
      )}

      {(scope?.content || servicesDetail?.content) && (
        <Page size="LETTER" style={styles.page}>
          {scope?.content && (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Scope &amp; Services</Text>
              <Text style={styles.prose}>{stripHtml(scope.content)}</Text>
            </View>
          )}
          {servicesDetail?.content && (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Service Details</Text>
              <Text style={styles.prose}>{stripHtml(servicesDetail.content)}</Text>
            </View>
          )}
          <Text style={styles.footer}>{branding.name} · Signed proposal · {proposal.title}</Text>
          <Text style={styles.footerPage} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
        </Page>
      )}

      {/* Pricing */}
      {(pricingItems.length > 0 || pricingTiers.length > 0) && (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pricing</Text>

            {proposal.pricingMode === 'tiers' && pricingTiers.length > 0 && (
              <View>
                {pricingTiers.map((tier, i) => (
                  <View key={i} style={styles.tierCard}>
                    <View style={[styles.tierHeader, tier.recommended ? styles.tierRecommended : {}]}>
                      <Text style={styles.tierTitle}>{tier.name}{tier.recommended ? ' — Recommended' : ''}</Text>
                    </View>
                    <View style={styles.tierBody}>
                      {tier.description && <Text style={{ fontSize: 9, color: '#718096', marginBottom: 8 }}>{tier.description}</Text>}
                      <View style={styles.tierRow}><Text style={styles.tierRowLabel}>Agreement length</Text><Text style={styles.tierRowValue}>{tier.months} months</Text></View>
                      <View style={styles.tierRow}><Text style={styles.tierRowLabel}>Hours / month</Text><Text style={styles.tierRowValue}>{tier.hoursPerMonth}</Text></View>
                      <View style={styles.tierRow}><Text style={styles.tierRowLabel}>Monthly cost</Text><Text style={styles.tierRowValue}>{fmtCurrency(tier.monthlyCost)}</Text></View>
                      {tier.discountPercent > 0 && <View style={styles.tierRow}><Text style={styles.tierRowLabel}>Discount</Text><Text style={styles.tierRowValue}>{tier.discountPercent}%</Text></View>}
                      <Text style={styles.tierTotal}>
                        Total: {fmtCurrency((tier.monthlyCost * tier.months) * (1 - tier.discountPercent / 100))}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {(proposal.pricingMode === 'line_items' || !proposal.pricingMode) && pricingItems.length > 0 && (
              <View style={styles.pricingTable}>
                <View style={styles.pricingHeader}>
                  <Text style={[styles.pricingHeaderCol, { flex: 3 }]}>Description</Text>
                  <Text style={[styles.pricingHeaderCol, { flex: 1, textAlign: 'right' }]}>Qty</Text>
                  <Text style={[styles.pricingHeaderCol, { flex: 1.5, textAlign: 'right' }]}>Unit Price</Text>
                  <Text style={[styles.pricingHeaderCol, { flex: 1.5, textAlign: 'right' }]}>Total</Text>
                </View>
                {pricingItems.map((item, i) => (
                  <View key={i} style={[styles.pricingRow, i % 2 === 1 ? styles.pricingRowAlt : {}]}>
                    <Text style={{ flex: 3, fontSize: 9 }}>{item.description}</Text>
                    <Text style={{ flex: 1, fontSize: 9, textAlign: 'right' }}>{item.quantity}</Text>
                    <Text style={{ flex: 1.5, fontSize: 9, textAlign: 'right' }}>{fmtCurrency(item.unitPrice)}</Text>
                    <Text style={{ flex: 1.5, fontSize: 9, textAlign: 'right', fontWeight: 'bold' }}>{fmtCurrency(item.total)}</Text>
                  </View>
                ))}
                <View style={styles.pricingTotal}>
                  <Text style={[styles.pricingTotalLabel, { flex: 5.5 }]}>Agreement Total</Text>
                  <Text style={[styles.pricingTotalValue, { flex: 1.5 }]}>{fmtCurrency(pricingTotal)}</Text>
                </View>
              </View>
            )}
          </View>
          <Text style={styles.footer}>{branding.name} · Signed proposal · {proposal.title}</Text>
          <Text style={styles.footerPage} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
        </Page>
      )}

      {/* Terms */}
      {terms?.content && (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Terms &amp; Conditions</Text>
            <Text style={styles.prose}>{stripHtml(terms.content)}</Text>
          </View>
          <Text style={styles.footer}>{branding.name} · Signed proposal · {proposal.title}</Text>
          <Text style={styles.footerPage} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
        </Page>
      )}

      {/* ─── Signature Certificate Page ──────────── */}
      <Page size="LETTER" style={styles.certPage}>
        <View style={styles.certBanner}>
          <Text style={styles.certBannerTitle}>✓ Electronically Signed</Text>
          <Text style={styles.certBannerSub}>This proposal has been signed and accepted.</Text>
        </View>

        <View style={styles.certSection}>
          <View style={styles.certGrid}>
            <View style={styles.certCol}>
              <Text style={styles.certLabel}>Signed By</Text>
              <Text style={styles.certValue}>{access.signedByName || '—'}</Text>
            </View>
            <View style={styles.certCol}>
              <Text style={styles.certLabel}>Email</Text>
              <Text style={styles.certValue}>{access.signedByEmail || '—'}</Text>
            </View>
            {access.signedByTitle && (
              <View style={styles.certCol}>
                <Text style={styles.certLabel}>Title / Role</Text>
                <Text style={styles.certValue}>{access.signedByTitle}</Text>
              </View>
            )}
            {access.signedByPhone && (
              <View style={styles.certCol}>
                <Text style={styles.certLabel}>Phone</Text>
                <Text style={styles.certValue}>{access.signedByPhone}</Text>
              </View>
            )}
            <View style={styles.certCol}>
              <Text style={styles.certLabel}>Signed At</Text>
              <Text style={styles.certValue}>{fmtDate(access.signedAt)}</Text>
            </View>
            <View style={styles.certCol}>
              <Text style={styles.certLabel}>IP Address</Text>
              <Text style={styles.certValueMono}>{access.ipAddress || '—'}</Text>
            </View>
            <View style={styles.certCol}>
              <Text style={styles.certLabel}>Document Version</Text>
              <Text style={styles.certValue}>v{access.signedVersion || proposal.version}</Text>
            </View>
            <View style={styles.certCol}>
              <Text style={styles.certLabel}>Signature Method</Text>
              <Text style={styles.certValue}>{access.signatureMode === 'draw' ? 'Drawn signature' : access.signatureMode === 'type' ? 'Typed signature' : '—'}</Text>
            </View>
            <View style={styles.certCol}>
              <Text style={styles.certLabel}>Reference ID</Text>
              <Text style={styles.certValueMono}>{access.id.slice(0, 12).toUpperCase()}</Text>
            </View>
            <View style={styles.certColFull}>
              <Text style={styles.certLabel}>Document Hash (SHA-256)</Text>
              <Text style={styles.certValueMono}>{access.documentHash || '—'}</Text>
            </View>
          </View>
        </View>

        {access.signatureImage && (
          <View style={styles.certSection}>
            <Text style={styles.certLabel}>Captured Signature</Text>
            <View style={styles.certSignatureBox}>
              <Image style={styles.certSignatureImage} src={access.signatureImage} />
            </View>
          </View>
        )}

        <View style={styles.certLegalBox}>
          <Text style={styles.certLegalTitle}>Legal Notice</Text>
          <Text style={styles.certLegalText}>
            This signature was captured under the U.S. E-SIGN Act (15 U.S.C. § 7001) and the
            Uniform Electronic Transactions Act (UETA). The signer gave affirmative consent to
            conduct business electronically and to sign this agreement using an electronic
            signature, which carries the same legal effect as a handwritten signature. The
            SHA-256 hash above uniquely identifies the content that was signed; any subsequent
            modification to the document would result in a different hash.
          </Text>
        </View>

        <Text style={styles.footer}>{branding.name} · Signed proposal · {proposal.title}</Text>
        <Text style={styles.footerPage} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
      </Page>
    </Document>
  )
}
