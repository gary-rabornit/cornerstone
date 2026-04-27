import { formatCurrencyDetailed } from '@/lib/utils'
import { getCompanyBranding } from '@/lib/companies'
import type { ProposalSection, PricingItem, ServiceItem, PricingTier } from '@/types'
import { RabornPricingDisplay } from './raborn-pricing-display'
import { migrateRabornPricing, type RabornPricingData } from '@/lib/raborn-pricing'
import {
  Globe,
  Search,
  PenTool,
  BarChart3,
  Share2,
  Code,
  Megaphone,
  Mail,
  Camera,
  Video,
  Palette,
  ShieldCheck,
  Server,
  Database,
  Cloud,
  Smartphone,
  Monitor,
  Headphones,
  FileText,
  Users,
  TrendingUp,
  Target,
  Zap,
  Settings,
  Phone,
  type LucideIcon,
} from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  globe: Globe,
  search: Search,
  'pen-tool': PenTool,
  'bar-chart': BarChart3,
  'bar-chart-3': BarChart3,
  share: Share2,
  'share-2': Share2,
  code: Code,
  megaphone: Megaphone,
  mail: Mail,
  camera: Camera,
  video: Video,
  palette: Palette,
  shield: ShieldCheck,
  'shield-check': ShieldCheck,
  server: Server,
  database: Database,
  cloud: Cloud,
  smartphone: Smartphone,
  monitor: Monitor,
  headphones: Headphones,
  'file-text': FileText,
  users: Users,
  'trending-up': TrendingUp,
  target: Target,
  zap: Zap,
  settings: Settings,
}

function getIcon(name: string): LucideIcon {
  return ICON_MAP[name.toLowerCase()] || Globe
}

interface ProposalRendererProps {
  title: string
  company: string
  sections: ProposalSection[]
  pricingItems: PricingItem[]
  pricingMode: string
  pricingTiers: PricingTier[]
  services: ServiceItem[]
  repName?: string | null
  repTitle?: string | null
  repEmail?: string | null
  repPhone?: string | null
  deal?: { companyName: string; contactName: string } | null
  createdBy?: { name: string }
}

function parseCoverContent(content: string): {
  serviceType: string
  projectName: string
  clientName: string
  date: string
} {
  try {
    const parsed = JSON.parse(content)
    return {
      serviceType: parsed.serviceType || parsed.title || '',
      projectName: parsed.projectName || parsed.subtitle || '',
      clientName: parsed.clientName || '',
      date: parsed.date || '',
    }
  } catch {
    return { serviceType: '', projectName: '', clientName: '', date: '' }
  }
}

function safeParseArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

const TIER_COLORS = ['#E85D3A', '#2AA89A', '#3B82C4']

export function ProposalRenderer({
  title,
  company,
  sections: rawSections,
  pricingItems: rawPricingItems,
  pricingMode,
  pricingTiers: rawPricingTiers,
  services: rawServices,
  repName,
  repTitle,
  repEmail,
  repPhone,
  deal,
  createdBy,
}: ProposalRendererProps) {
  const branding = getCompanyBranding(company)
  const sections = safeParseArray<ProposalSection>(rawSections)
  const pricingItems = safeParseArray<PricingItem>(rawPricingItems)
  const pricingTiers = safeParseArray<PricingTier>(rawPricingTiers)
  const services = safeParseArray<ServiceItem>(rawServices)

  // If pricingMode is 'raborn', rawPricingTiers contains a RabornPricingData object (not an array)
  let rabornPricing: RabornPricingData | null = null
  if (pricingMode === 'raborn') {
    try {
      const raw = typeof rawPricingTiers === 'string' ? rawPricingTiers : JSON.stringify(rawPricingTiers)
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && 'mode' in parsed) {
        rabornPricing = migrateRabornPricing(parsed)
      }
    } catch {}
  }

  const coverSection = sections.find((s) => s.type === 'cover')
  const cover = coverSection ? parseCoverContent(coverSection.content) : null
  const servicesOverview = sections.find((s) => s.type === 'services_overview')
  const scope = sections.find((s) => s.type === 'scope')
  const servicesDetail = sections.find((s) => s.type === 'services_detail')
  const terms = sections.find((s) => s.type === 'terms')
  const signature = sections.find((s) => s.type === 'signature')

  const enabledServices = services.filter((s) => s.enabled)

  const contentSections = sections
    .filter((s) => s.type !== 'cover' && s.type !== 'table_of_contents' && s.content)
    .sort((a, b) => a.order - b.order)

  const subtotal = pricingItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  )

  const clientName = cover?.clientName || deal?.companyName || ''
  const displayDate = cover?.date
    ? new Date(cover.date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })

  return (
    <div className="mx-auto max-w-4xl py-8 space-y-0">
      {/* ===== PAGE 1: COVER PAGE ===== */}
      <div className="relative bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-12" style={{ minHeight: '700px' }}>
        {/* Date top-left */}
        <div className="px-10 pt-8">
          <p className="text-sm text-gray-400">{displayDate}</p>
        </div>

        {/* Logo centered */}
        <div className="flex justify-center pt-12 pb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={branding.logo}
            alt={branding.name}
            className="h-20 w-auto object-contain"
          />
        </div>

        {/* Client company name */}
        <div className="text-center px-10 pb-12">
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: branding.primaryColor }}>
            {clientName}
          </h1>
        </div>

        {/* Dark navy bar at bottom-third */}
        <div
          className="px-10 py-16"
          style={{ backgroundColor: branding.primaryColor }}
        >
          <div className="space-y-3">
            <h2 className="text-3xl font-bold">
              <span style={{ color: branding.accentColor }}>
                {cover?.serviceType || 'Marketing'}
              </span>{' '}
              <span className="text-white">Services</span>
            </h2>
            <p className="text-xl text-white/80">
              {cover?.projectName || title}
            </p>
          </div>
        </div>

        {/* Rep info at bottom */}
        <div className="px-10 py-7 bg-gray-50 border-t border-gray-100">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.18em] mb-3"
            style={{ color: branding.accentColor }}
          >
            Prepared by
          </p>
          <div className="flex items-start gap-5">
            <div
              className="w-1 self-stretch rounded-full"
              style={{ backgroundColor: branding.accentColor }}
            />
            <div className="space-y-2">
              <div>
                <p
                  className="text-lg font-semibold leading-tight"
                  style={{ color: branding.primaryColor }}
                >
                  {repName || createdBy?.name || ''}
                </p>
                {repTitle && (
                  <p className="text-sm text-gray-600 mt-0.5">{repTitle}</p>
                )}
              </div>
              {(repPhone || repEmail) && (
                <div className="flex flex-col gap-1 pt-1 text-sm text-gray-600">
                  {repPhone && (
                    <span className="inline-flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5" style={{ color: branding.accentColor }} />
                      {repPhone}
                    </span>
                  )}
                  {repEmail && (
                    <span className="inline-flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5" style={{ color: branding.accentColor }} />
                      {repEmail}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== PAGE 2: TABLE OF CONTENTS ===== */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-12 px-10 py-12">
        <h2
          className="text-2xl font-bold mb-8 pl-4"
          style={{
            borderLeft: `4px solid ${branding.accentColor}`,
            color: branding.primaryColor,
          }}
        >
          Proposal Contents
        </h2>
        <div className="space-y-0">
          {contentSections.map((section, index) => (
            <div
              key={section.id}
              className="flex items-center justify-between px-4 py-3"
              style={{
                backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white',
              }}
            >
              <span className="text-sm text-gray-700 font-medium">
                {section.title}
              </span>
              <span className="text-sm text-gray-400">{index + 3}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== SERVICES OVERVIEW ===== */}
      {servicesOverview?.content && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-12 px-10 py-12">
          <h2
            className="text-2xl font-bold mb-6 pl-4"
            style={{
              borderLeft: `4px solid ${branding.accentColor}`,
              color: branding.primaryColor,
            }}
          >
            Services Overview
          </h2>
          <div
            className="prose prose-gray max-w-none text-gray-600 leading-relaxed mb-8 [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-gray-900 [&>h3]:mt-6 [&>h3]:mb-2"
            dangerouslySetInnerHTML={{ __html: servicesOverview.content }}
          />

          {enabledServices.length > 0 && (
            <>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                These services include:
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-4">
                {enabledServices.map((service) => {
                  const IconComponent = getIcon(service.icon)
                  return (
                    <div
                      key={service.id}
                      className="flex flex-col items-center gap-2 text-center"
                    >
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${branding.accentColor}15` }}
                      >
                        <IconComponent
                          className="w-6 h-6"
                          style={{ color: branding.accentColor }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 leading-tight">
                        {service.name}
                      </span>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ===== SCOPE & SERVICES ===== */}
      {scope?.content && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-12 px-10 py-12">
          <h2
            className="text-2xl font-bold mb-6 pl-4"
            style={{
              borderLeft: `4px solid ${branding.accentColor}`,
              color: branding.primaryColor,
            }}
          >
            <span style={{ color: branding.accentColor }}>Scope &amp; Services</span>{' '}
            <span>Overview</span>
          </h2>
          <div
            className="prose prose-gray max-w-none text-gray-600 leading-relaxed [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-gray-900 [&>h3]:mt-6 [&>h3]:mb-2 [&>h4]:text-sm [&>h4]:font-bold [&>h4]:uppercase [&>h4]:tracking-wider [&>h4]:text-gray-500 [&>h4]:mt-8 [&>h4]:mb-3"
            dangerouslySetInnerHTML={{ __html: scope.content }}
          />
        </div>
      )}

      {/* ===== SERVICES DETAIL ===== */}
      {servicesDetail?.content && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-12 px-10 py-12">
          <h2
            className="text-2xl font-bold mb-6 pl-4"
            style={{
              borderLeft: `4px solid ${branding.accentColor}`,
              color: branding.primaryColor,
            }}
          >
            Services Detail
          </h2>
          <div
            className="prose prose-gray max-w-none text-gray-600 leading-relaxed [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-gray-900 [&>h3]:mt-6 [&>h3]:mb-2"
            dangerouslySetInnerHTML={{ __html: servicesDetail.content }}
          />
        </div>
      )}

      {/* ===== PRICING (Raborn) ===== */}
      {pricingMode === 'raborn' && rabornPricing && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-12 px-10 py-12">
          <h2
            className="text-2xl font-bold mb-8 pl-4"
            style={{
              borderLeft: `4px solid ${branding.accentColor}`,
              color: branding.primaryColor,
            }}
          >
            Pricing
          </h2>
          <RabornPricingDisplay
            data={rabornPricing}
            accentColor={branding.accentColor}
            primaryColor={branding.primaryColor}
          />
        </div>
      )}

      {/* ===== PRICING (legacy tiers) ===== */}
      {(pricingMode === 'tiers' && pricingTiers.length > 0) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-12 px-10 py-12">
          <h2
            className="text-2xl font-bold mb-8 pl-4"
            style={{
              borderLeft: `4px solid ${branding.accentColor}`,
              color: branding.primaryColor,
            }}
          >
            Pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingTiers.map((tier, index) => {
              const tierColor = TIER_COLORS[index % TIER_COLORS.length]
              const isRecommended = tier.recommended
              return (
                <div
                  key={tier.id}
                  className="rounded-xl border overflow-hidden flex flex-col"
                  style={{
                    borderColor: isRecommended ? tierColor : '#e5e7eb',
                    boxShadow: isRecommended ? `0 4px 24px ${tierColor}20` : undefined,
                  }}
                >
                  {/* Tier header */}
                  <div
                    className="px-6 py-5 text-white"
                    style={{ backgroundColor: tierColor }}
                  >
                    <h3 className="text-lg font-bold">{tier.name}</h3>
                    <p className="text-sm text-white/80 mt-1">{tier.description}</p>
                  </div>

                  {/* Tier body */}
                  <div className="px-6 py-6 flex-1 space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Agreement Length</span>
                      <span className="font-semibold text-gray-900">{tier.months} months</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Hours / Month</span>
                      <span className="font-semibold text-gray-900">{tier.hours}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Monthly Cost</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrencyDetailed(tier.monthlyCost)}
                      </span>
                    </div>
                    {tier.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Savings</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrencyDetailed(tier.discount)}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-gray-100 pt-4 flex justify-between">
                      <span className="text-sm font-semibold text-gray-700">Total Cost</span>
                      <span className="text-lg font-bold" style={{ color: tierColor }}>
                        {formatCurrencyDetailed(tier.totalCost)}
                      </span>
                    </div>
                  </div>

                  {/* Select button */}
                  <div className="px-6 pb-6">
                    <button
                      className="w-full py-2.5 rounded-lg text-sm font-semibold transition-colors"
                      style={{
                        backgroundColor: isRecommended ? tierColor : 'transparent',
                        color: isRecommended ? 'white' : tierColor,
                        border: `2px solid ${tierColor}`,
                      }}
                    >
                      {isRecommended ? 'Recommended' : 'Select'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {(pricingMode !== 'tiers' && pricingItems.length > 0) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-12 px-10 py-12">
          <h2
            className="text-2xl font-bold mb-8 pl-4"
            style={{
              borderLeft: `4px solid ${branding.accentColor}`,
              color: branding.primaryColor,
            }}
          >
            Pricing
          </h2>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: branding.primaryColor }}>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">
                    Services
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-white">
                    Price
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-white">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {pricingItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className={index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}
                  >
                    <td className="px-6 py-3 text-sm text-gray-900">
                      {item.description}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600 text-right">
                      {item.quantity > 1
                        ? `${item.quantity} x ${formatCurrencyDetailed(item.unitPrice)}`
                        : formatCurrencyDetailed(item.unitPrice)}
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-900 text-right">
                      {formatCurrencyDetailed(item.quantity * item.unitPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td
                    colSpan={2}
                    className="px-6 py-3 text-right text-sm font-bold"
                    style={{ color: branding.primaryColor }}
                  >
                    Total
                  </td>
                  <td
                    className="px-6 py-3 text-right text-lg font-bold"
                    style={{ color: branding.primaryColor }}
                  >
                    {formatCurrencyDetailed(subtotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Agreement Total summary */}
          <div className="mt-8 rounded-lg p-6" style={{ backgroundColor: `${branding.primaryColor}08` }}>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold" style={{ color: branding.primaryColor }}>
                Agreement Total
              </span>
              <span className="text-2xl font-bold" style={{ color: branding.primaryColor }}>
                {formatCurrencyDetailed(subtotal)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ===== TERMS & CONDITIONS ===== */}
      {terms?.content && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-12 px-10 py-12">
          <h2
            className="text-2xl font-bold mb-6 pl-4"
            style={{
              borderLeft: `4px solid ${branding.accentColor}`,
              color: branding.primaryColor,
            }}
          >
            General Terms &amp; Conditions
          </h2>
          <div
            className="prose prose-gray max-w-none text-gray-600 leading-relaxed [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-gray-900 [&>h3]:mt-6 [&>h3]:mb-2"
            dangerouslySetInnerHTML={{ __html: terms.content }}
          />
        </div>
      )}

      {/* ===== SIGNATURE ===== */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-12 px-10 py-12">
        <div className="text-center mb-10">
          <p className="text-gray-600 italic text-lg leading-relaxed max-w-2xl mx-auto">
            Thank you for the opportunity to present this proposal.
            We look forward to working with you and are confident we can
            deliver exceptional results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Rep signature */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Authorized Representative
            </p>
            <div className="border-b-2 border-gray-300 pb-2 mb-3">
              <p className="text-lg font-semibold" style={{ color: branding.primaryColor }}>
                {repName || createdBy?.name || ''}
              </p>
            </div>
            {repTitle && (
              <p className="text-sm text-gray-500 mb-1">{repTitle}</p>
            )}
            {repPhone && (
              <p className="text-sm text-gray-500 mb-1">{repPhone}</p>
            )}
            {repEmail && (
              <p className="text-sm text-gray-500">{repEmail}</p>
            )}
          </div>

          {/* Client signature area */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Client Signature
            </p>
            <div className="border-b-2 border-gray-300 pb-2 mb-3 min-h-[32px]" />
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>Name: _______________________</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400 mt-2">
              <span>Date: _______________________</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
