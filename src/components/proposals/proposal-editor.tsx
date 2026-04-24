'use client'

import { useState, useCallback } from 'react'
import { cn, formatCurrencyDetailed } from '@/lib/utils'
import { RichTextEditor } from './rich-text-editor'
import { PricingTable } from './pricing-table'
import { ServicesGridEditor, DEFAULT_SERVICES } from './services-grid-editor'
import { PricingTiersEditor, DEFAULT_PRICING_TIERS } from './pricing-tiers-editor'
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
    return parsed.length > 0 ? parsed : DEFAULT_PRICING_TIERS
  })

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
      updatedPricingTiers: PricingTier[],
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
        pricingTiers: updatedPricingTiers,
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
    triggerSave(sections, pricingItems, mode, pricingTiers, services, repName, repTitle, repEmail, repPhone)
  }

  function handleTiersChange(newTiers: PricingTier[]) {
    setPricingTiers(newTiers)
    triggerSave(sections, pricingItems, pricingMode, newTiers, services, repName, repTitle, repEmail, repPhone)
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
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <h4 className="text-sm font-semibold text-[#003964]">
                  Representative Information
                </h4>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-500">Quick fill:</label>
                  <select
                    value=""
                    onChange={(e) => {
                      const preset = REP_PRESETS[e.target.value as keyof typeof REP_PRESETS]
                      if (!preset) return
                      setRepName(preset.name)
                      setRepTitle(preset.title)
                      setRepEmail(preset.email)
                      setRepPhone(preset.phone)
                      triggerSave(sections, pricingItems, pricingMode, pricingTiers, services, preset.name, preset.title, preset.email, preset.phone)
                    }}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-[#00CFF8] focus:ring-2 focus:ring-[#00CFF8]/20 focus:outline-none"
                  >
                    <option value="">Select a rep…</option>
                    <option value="gary">Gary Billington</option>
                    <option value="ryan">Ryan Deshler</option>
                  </select>
                </div>
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
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#003964]">Pricing</h3>

              {/* Mode Toggle */}
              <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-1">
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
                  Tier Plans
                </button>
              </div>
            </div>

            {pricingMode === 'line_items' ? (
              <PricingTable items={pricingItems} onChange={handlePricingChange} />
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
