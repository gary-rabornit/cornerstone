'use client'

import { useState, useCallback } from 'react'
import { cn, formatCurrencyDetailed } from '@/lib/utils'
import { RichTextEditor } from './rich-text-editor'
import { PricingTable } from './pricing-table'
import { ServicesGridEditor, DEFAULT_SERVICES } from './services-grid-editor'
import { PricingTiersEditor, DEFAULT_PRICING_TIERS } from './pricing-tiers-editor'
import { RabornPricingEditor } from './raborn-pricing-editor'
import { DEFAULT_RABORN_PRICING, migrateRabornPricing, type RabornPricingData } from '@/lib/raborn-pricing'
import type { ProposalSection, PricingItem, ServiceItem, PricingTier } from '@/types'
import {
  FileImage,
  LayoutGrid,
  Briefcase,
  ClipboardList,
  DollarSign,
  ScrollText,
  PenLine,
} from 'lucide-react'

// Quick-select presets for common reps
const REP_PRESETS = {
  gary: {
    name: 'Gary Billington',
    title: 'Vice President of Growth Initiatives',
    email: 'Gary@RabornMedia.com',
    phone: '704-255-5168',
  },
  ryan: {
    name: 'Ryan Deshler',
    title: 'Director of Business Development // Senior Designer & Developer',
    email: 'Ryan@RabornMedia.com',
    phone: '657-514-0868',
  },
} as const

interface ProposalData {
  id: string
  title: string
  company: string
  status: string
  sections: ProposalSection[]
  pricingItems: PricingItem[]
  pricingMode: string
  pricingTiers: PricingTier[]
  services: ServiceItem[]
  repName: string | null
  repTitle: string | null
  repEmail: string | null
  repPhone: string | null
  deal?: {
    companyName: string
    contactName: string
  } | null
}

interface ProposalEditorProps {
  proposal: ProposalData
  onSave: (data: {
    sections: ProposalSection[]
    pricingItems: PricingItem[]
    pricingMode: string
    pricingTiers: PricingTier[]
    services: ServiceItem[]
    repName: string
    repTitle: string
    repEmail: string
    repPhone: string
  }) => void
}

const TABS = [
  { key: 'cover', label: 'Cover', icon: FileImage },
  { key: 'services_overview', label: 'Services Overview', icon: LayoutGrid },
  { key: 'scope', label: 'Scope & Services', icon: Briefcase },
  { key: 'services_detail', label: 'Services Detail', icon: ClipboardList },
  { key: 'pricing', label: 'Pricing', icon: DollarSign },
  { key: 'terms', label: 'Terms', icon: ScrollText },
  { key: 'signature', label: 'Signature', icon: PenLine },
] as const

type TabKey = (typeof TABS)[number]['key']

function safeParse<T>(raw: unknown, fallback: T): T {
  if (Array.isArray(raw)) return raw as T
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw || JSON.stringify(fallback))
      return Array.isArray(parsed) ? parsed as T : fallback
    } catch {
      return fallback
    }
  }
  return fallback
}

function safeParseString(raw: unknown, fallback: string): string {
  if (typeof raw === 'string') return raw
  return fallback
}

export function ProposalEditor({ proposal, onSave }: ProposalEditorProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('cover')

  const [sections, setSections] = useState<ProposalSection[]>(() => {
    const existing = safeParse<ProposalSection[]>(proposal.sections, [])
    return TABS.map((tab) => {
      const found = existing.find((s) => s.type === tab.key)
      return (
        found || {
          id: crypto.randomUUID(),
          type: tab.key as ProposalSection['type'],
          title: tab.label,
          content: '',
          order: TABS.findIndex((t) => t.key === tab.key),
        }
      )
    })
  })

  const [pricingItems, setPricingItems] = useState<PricingItem[]>(() =>
    safeParse<PricingItem[]>(proposal.pricingItems, [])
  )

  const [pricingMode, setPricingMode] = useState<string>(() =>
    safeParseString(proposal.pricingMode, 'line_items')
  )

  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>(() => {
    const parsed = safeParse<PricingTier[]>(proposal.pricingTiers, [])
    // Only use as tiers if it's actually an array of tiers (not Raborn pricing data)
    if (Array.isArray(parsed) && parsed.length > 0 && 'monthlyCost' in (parsed[0] || {})) {
      return parsed as PricingTier[]
    }
    return DEFAULT_PRICING_TIERS
  })

  // Raborn pricing (Monthly Flex / Project with solution tiers) — stored in pricingTiers JSON when mode === 'raborn'
  const [rabornPricing, setRabornPricing] = useState<RabornPricingData>(() => {
    if (proposal.pricingMode === 'raborn') {
      try {
        const raw = typeof proposal.pricingTiers === 'string'
          ? proposal.pricingTiers
          : JSON.stringify(proposal.pricingTiers)
        const parsed = JSON.parse(raw)
        return migrateRabornPricing(parsed)
      } catch {}
    }
    return DEFAULT_RABORN_PRICING
  })

  const isRabornITOrSoftware =
    proposal.company === 'RABORN_IT' || proposal.company === 'RABORN_SOFTWARE'

  const [services, setServices] = useState<ServiceItem[]>(() => {
    const parsed = safeParse<ServiceItem[]>(proposal.services, [])
    return parsed.length > 0 ? parsed : DEFAULT_SERVICES
  })

  const [repName, setRepName] = useState(proposal.repName || '')
  const [repTitle, setRepTitle] = useState(proposal.repTitle || '')
  const [repEmail, setRepEmail] = useState(proposal.repEmail || '')
  const [repPhone, setRepPhone] = useState(proposal.repPhone || '')

  // Cover section fields parsed from content
  const coverSection = sections.find((s) => s.type === 'cover')
  const coverData = parseCoverContent(coverSection?.content || '')

  // Services overview intro from section content
  const servicesOverviewSection = sections.find((s) => s.type === 'services_overview')
  const companyIntro = servicesOverviewSection?.content || ''

  function parseCoverContent(content: string): {
    serviceType: string
    projectName: string
    clientName: string
    date: string
  } {
    try {
      const parsed = JSON.parse(content)
      return {
        serviceType: parsed.serviceType || '',
        projectName: parsed.projectName || '',
        clientName: parsed.clientName || '',
        date: parsed.date || '',
      }
    } catch {
      return { serviceType: '', projectName: '', clientName: '', date: '' }
    }
  }

  const triggerSave = useCallback(
    (
      updatedSections: ProposalSection[],
      updatedPricingItems: PricingItem[],
      updatedPricingMode: string,
      updatedPricingTiers: PricingTier[] | RabornPricingData,
      updatedServices: ServiceItem[],
      updatedRepName: string,
      updatedRepTitle: string,
      updatedRepEmail: string,
      updatedRepPhone: string
    ) => {
      onSave({
        sections: updatedSections,
        pricingItems: updatedPricingItems,
        pricingMode: updatedPricingMode,
        // When mode is 'raborn', pricingTiers holds the RabornPricingData object; otherwise an array
        pricingTiers: updatedPricingTiers as PricingTier[],
        services: updatedServices,
        repName: updatedRepName,
        repTitle: updatedRepTitle,
        repEmail: updatedRepEmail,
        repPhone: updatedRepPhone,
      })
    },
    [onSave]
  )

  function updateSection(type: string, content: string) {
    const updated = sections.map((s) =>
      s.type === type ? { ...s, content } : s
    )
    setSections(updated)
    triggerSave(updated, pricingItems, pricingMode, pricingTiers, services, repName, repTitle, repEmail, repPhone)
  }

  function updateCover(field: string, value: string) {
    const updated = { ...coverData, [field]: value }
    updateSection('cover', JSON.stringify(updated))
  }

  function handleRepChange(field: 'repName' | 'repTitle' | 'repEmail' | 'repPhone', value: string) {
    const setters = { repName: setRepName, repTitle: setRepTitle, repEmail: setRepEmail, repPhone: setRepPhone }
    setters[field](value)
    const vals = { repName, repTitle, repEmail, repPhone, [field]: value }
    triggerSave(sections, pricingItems, pricingMode, pricingTiers, services, vals.repName, vals.repTitle, vals.repEmail, vals.repPhone)
  }

  function handlePricingChange(newItems: PricingItem[]) {
    setPricingItems(newItems)
    triggerSave(sections, newItems, pricingMode, pricingTiers, services, repName, repTitle, repEmail, repPhone)
  }

  function handlePricingModeChange(mode: string) {
    setPricingMode(mode)
    // Save with the appropriate pricing payload for the new mode
    const payload = mode === 'raborn' ? rabornPricing : pricingTiers
    triggerSave(sections, pricingItems, mode, payload, services, repName, repTitle, repEmail, repPhone)
  }

  function handleTiersChange(newTiers: PricingTier[]) {
    setPricingTiers(newTiers)
    triggerSave(sections, pricingItems, pricingMode, newTiers, services, repName, repTitle, repEmail, repPhone)
  }

  function handleRabornPricingChange(next: RabornPricingData) {
    setRabornPricing(next)
    triggerSave(sections, pricingItems, pricingMode, next, services, repName, repTitle, repEmail, repPhone)
  }

  function handleServicesChange(newServices: ServiceItem[]) {
    setServices(newServices)
    triggerSave(sections, pricingItems, pricingMode, pricingTiers, newServices, repName, repTitle, repEmail, repPhone)
  }

  function handleIntroChange(intro: string) {
    updateSection('services_overview', intro)
  }

  const activeSection = sections.find((s) => s.type === activeTab)

  const inputClass =
    'w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#00CFF8] focus:outline-none focus:ring-1 focus:ring-[#00CFF8]'

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-1 rounded-lg bg-white p-1 shadow-sm border border-gray-200 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
                activeTab === tab.key
                  ? 'bg-[#003964] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* ===== COVER ===== */}
        {activeTab === 'cover' && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-[#003964]">Cover Page</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Service Type
                </label>
                <input
                  type="text"
                  value={coverData.serviceType}
                  onChange={(e) => updateCover('serviceType', e.target.value)}
                  placeholder="e.g. Marketing Services"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Project Name
                </label>
                <input
                  type="text"
                  value={coverData.projectName}
                  onChange={(e) => updateCover('projectName', e.target.value)}
                  placeholder="e.g. Website Refresh Project"
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Client Name
                </label>
                <input
                  type="text"
                  value={coverData.clientName || proposal.deal?.companyName || ''}
                  onChange={(e) => updateCover('clientName', e.target.value)}
                  placeholder="Client or company name"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={coverData.date}
                  onChange={(e) => updateCover('date', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Rep Info */}
            <div className="border-t border-gray-200 pt-5 mt-5">
              <h4 className="text-sm font-semibold text-[#003964] mb-3">
                Representative Information
              </h4>

              {/* Quick-fill rep buttons */}
              <div className="mb-5 rounded-lg border border-[#00CFF8]/30 bg-[#00CFF8]/5 p-4">
                <p className="text-xs font-semibold text-[#003964] uppercase tracking-wide mb-3">
                  Quick Fill — select a rep to auto-populate
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(REP_PRESETS).map(([key, preset]) => {
                    const isSelected =
                      repName === preset.name &&
                      repTitle === preset.title &&
                      repEmail.toLowerCase() === preset.email.toLowerCase() &&
                      repPhone === preset.phone
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setRepName(preset.name)
                          setRepTitle(preset.title)
                          setRepEmail(preset.email)
                          setRepPhone(preset.phone)
                          triggerSave(sections, pricingItems, pricingMode, pricingTiers, services, preset.name, preset.title, preset.email, preset.phone)
                        }}
                        className={cn(
                          'flex items-start gap-3 rounded-lg border-2 bg-white p-3 text-left transition-all',
                          isSelected
                            ? 'border-[#00CFF8] shadow-sm shadow-[#00CFF8]/10'
                            : 'border-gray-200 hover:border-[#00CFF8]/50 hover:bg-[#00CFF8]/5'
                        )}
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#003964]/10 text-sm font-bold text-[#003964]">
                          {preset.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1A202C] truncate">
                            {preset.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{preset.title}</p>
                        </div>
                        {isSelected && (
                          <span className="text-xs font-bold text-[#00CFF8]">✓</span>
                        )}
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  Or type custom rep info below.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Rep Name
                  </label>
                  <input
                    type="text"
                    value={repName}
                    onChange={(e) => handleRepChange('repName', e.target.value)}
                    placeholder="John Smith"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Rep Title
                  </label>
                  <input
                    type="text"
                    value={repTitle}
                    onChange={(e) => handleRepChange('repTitle', e.target.value)}
                    placeholder="Account Executive"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Rep Email
                  </label>
                  <input
                    type="email"
                    value={repEmail}
                    onChange={(e) => handleRepChange('repEmail', e.target.value)}
                    placeholder="john@company.com"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Rep Phone
                  </label>
                  <input
                    type="tel"
                    value={repPhone}
                    onChange={(e) => handleRepChange('repPhone', e.target.value)}
                    placeholder="(555) 123-4567"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== SERVICES OVERVIEW ===== */}
        {activeTab === 'services_overview' && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[#003964]">Services Overview</h3>
            <ServicesGridEditor
              services={services}
              companyIntro={companyIntro}
              onChange={handleServicesChange}
              onIntroChange={handleIntroChange}
            />
          </div>
        )}

        {/* ===== SCOPE & SERVICES ===== */}
        {activeTab === 'scope' && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[#003964]">Scope & Services</h3>
            <RichTextEditor
              content={activeSection?.content || ''}
              onChange={(html) => updateSection('scope', html)}
              placeholder="Define the scope, deliverables, and services included..."
            />
          </div>
        )}

        {/* ===== SERVICES DETAIL ===== */}
        {activeTab === 'services_detail' && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[#003964]">Services Detail</h3>
            <p className="text-sm text-gray-500">
              Detail the project phases, timeline, and resource allocation.
            </p>
            <RichTextEditor
              content={activeSection?.content || ''}
              onChange={(html) => updateSection('services_detail', html)}
              placeholder="Outline project phases, timeline, milestones, and resources..."
            />
          </div>
        )}

        {/* ===== PRICING ===== */}
        {activeTab === 'pricing' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h3 className="text-lg font-semibold text-[#003964]">Pricing</h3>

              {/* Mode Toggle */}
              <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-1">
                {isRabornITOrSoftware && (
                  <button
                    type="button"
                    onClick={() => handlePricingModeChange('raborn')}
                    className={cn(
                      'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
                      pricingMode === 'raborn'
                        ? 'bg-[#003964] text-white'
                        : 'text-gray-500 hover:bg-gray-100'
                    )}
                  >
                    Raborn Pricing
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handlePricingModeChange('line_items')}
                  className={cn(
                    'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
                    pricingMode === 'line_items'
                      ? 'bg-[#003964] text-white'
                      : 'text-gray-500 hover:bg-gray-100'
                  )}
                >
                  Line Items
                </button>
                <button
                  type="button"
                  onClick={() => handlePricingModeChange('tier_plans')}
                  className={cn(
                    'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
                    pricingMode === 'tier_plans'
                      ? 'bg-[#003964] text-white'
                      : 'text-gray-500 hover:bg-gray-100'
                  )}
                >
                  Custom Tiers
                </button>
              </div>
            </div>

            {pricingMode === 'line_items' ? (
              <PricingTable items={pricingItems} onChange={handlePricingChange} />
            ) : pricingMode === 'raborn' ? (
              <RabornPricingEditor
                value={rabornPricing}
                onChange={handleRabornPricingChange}
              />
            ) : (
              <PricingTiersEditor tiers={pricingTiers} onChange={handleTiersChange} />
            )}
          </div>
        )}

        {/* ===== TERMS ===== */}
        {activeTab === 'terms' && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[#003964]">Terms & Conditions</h3>
            <RichTextEditor
              content={activeSection?.content || ''}
              onChange={(html) => updateSection('terms', html)}
              placeholder="Outline payment terms, warranties, and conditions..."
            />
          </div>
        )}

        {/* ===== SIGNATURE ===== */}
        {activeTab === 'signature' && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-[#003964]">Signature</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Closing Message
              </label>
              <textarea
                value={activeSection?.content || ''}
                onChange={(e) => updateSection('signature', e.target.value)}
                placeholder="Thank you for considering our proposal. We look forward to working with you..."
                rows={4}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#00CFF8] focus:outline-none focus:ring-1 focus:ring-[#00CFF8] resize-y"
              />
            </div>

            {/* Read-only rep info */}
            <div className="border-t border-gray-200 pt-5">
              <h4 className="text-sm font-semibold text-gray-500 mb-3">
                Representative (from Cover)
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3">
                  <div className="text-xs text-gray-400 mb-0.5">Name</div>
                  <div className="text-sm font-medium text-gray-900">
                    {repName || '—'}
                  </div>
                </div>
                <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3">
                  <div className="text-xs text-gray-400 mb-0.5">Title</div>
                  <div className="text-sm font-medium text-gray-900">
                    {repTitle || '—'}
                  </div>
                </div>
                <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3">
                  <div className="text-xs text-gray-400 mb-0.5">Email</div>
                  <div className="text-sm font-medium text-gray-900">
                    {repEmail || '—'}
                  </div>
                </div>
                <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3">
                  <div className="text-xs text-gray-400 mb-0.5">Phone</div>
                  <div className="text-sm font-medium text-gray-900">
                    {repPhone || '—'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
