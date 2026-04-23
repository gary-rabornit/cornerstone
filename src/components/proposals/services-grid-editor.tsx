'use client'

import { useCallback } from 'react'
import { cn } from '@/lib/utils'
import {
  Globe,
  Layout,
  Palette,
  Video,
  Share2,
  Megaphone,
  Newspaper,
  Handshake,
  Tv,
  Radio,
  Clapperboard,
  Search,
  PenTool,
  Users,
  MousePointerClick,
  FlaskConical,
  PiggyBank,
  Camera,
  BarChart3,
  Compass,
  Mail,
  CheckSquare,
  Square,
  type LucideIcon,
} from 'lucide-react'
import type { ServiceItem } from '@/types'

const ICON_MAP: Record<string, LucideIcon> = {
  Globe,
  Layout,
  Palette,
  Video,
  Share2,
  Megaphone,
  Newspaper,
  Handshake,
  Tv,
  Radio,
  Clapperboard,
  Search,
  PenTool,
  Users,
  MousePointerClick,
  FlaskConical,
  PiggyBank,
  Camera,
  BarChart3,
  Compass,
  Mail,
}

export const DEFAULT_SERVICES: ServiceItem[] = [
  { id: 'website-development', name: 'Website Development', icon: 'Globe', enabled: true },
  { id: 'ux-ui', name: 'UX/UI', icon: 'Layout', enabled: true },
  { id: 'graphic-design', name: 'Graphic Design', icon: 'Palette', enabled: true },
  { id: 'videography', name: 'Videography', icon: 'Video', enabled: true },
  { id: 'social-media', name: 'Social Media', icon: 'Share2', enabled: true },
  { id: 'digital-advertising', name: 'Digital Advertising', icon: 'Megaphone', enabled: true },
  { id: 'print-advertising', name: 'Print Advertising', icon: 'Newspaper', enabled: true },
  { id: 'sponsorship-placement', name: 'Sponsorship Placement', icon: 'Handshake', enabled: true },
  { id: 'ott', name: 'OTT', icon: 'Tv', enabled: true },
  { id: 'radio', name: 'Radio', icon: 'Radio', enabled: true },
  { id: 'animation', name: 'Animation', icon: 'Clapperboard', enabled: true },
  { id: 'seo', name: 'SEO', icon: 'Search', enabled: true },
  { id: 'copywriting', name: 'Copywriting', icon: 'PenTool', enabled: true },
  { id: 'public-relations', name: 'Public Relations', icon: 'Users', enabled: true },
  { id: 'search-engine-marketing', name: 'Search Engine Marketing', icon: 'MousePointerClick', enabled: true },
  { id: 'research', name: 'Research', icon: 'FlaskConical', enabled: true },
  { id: 'budgeting', name: 'Budgeting', icon: 'PiggyBank', enabled: true },
  { id: 'photography', name: 'Photography', icon: 'Camera', enabled: true },
  { id: 'reporting', name: 'Reporting', icon: 'BarChart3', enabled: true },
  { id: 'strategy', name: 'Strategy', icon: 'Compass', enabled: true },
  { id: 'email-marketing', name: 'Email Marketing', icon: 'Mail', enabled: true },
]

interface ServicesGridEditorProps {
  services: ServiceItem[]
  companyIntro: string
  onChange: (services: ServiceItem[]) => void
  onIntroChange: (intro: string) => void
}

export function ServicesGridEditor({
  services,
  companyIntro,
  onChange,
  onIntroChange,
}: ServicesGridEditorProps) {
  const allEnabled = services.every((s) => s.enabled)

  const toggleService = useCallback(
    (id: string) => {
      onChange(
        services.map((s) =>
          s.id === id ? { ...s, enabled: !s.enabled } : s
        )
      )
    },
    [services, onChange]
  )

  const toggleAll = useCallback(() => {
    const newEnabled = !allEnabled
    onChange(services.map((s) => ({ ...s, enabled: newEnabled })))
  }, [allEnabled, services, onChange])

  return (
    <div className="space-y-6">
      {/* Company Introduction */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Company Introduction
        </label>
        <textarea
          value={companyIntro}
          onChange={(e) => onIntroChange(e.target.value)}
          placeholder="Provide a brief introduction about your company and the services you offer..."
          rows={4}
          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#00CFF8] focus:outline-none focus:ring-1 focus:ring-[#00CFF8] resize-y"
        />
      </div>

      {/* Select All / Deselect All */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-[#003964]">Services Offered</h4>
        <button
          type="button"
          onClick={toggleAll}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#003964] hover:text-[#00CFF8] transition-colors"
        >
          {allEnabled ? (
            <>
              <Square className="h-4 w-4" />
              Deselect All
            </>
          ) : (
            <>
              <CheckSquare className="h-4 w-4" />
              Select All
            </>
          )}
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-7 gap-3">
        {services.map((service) => {
          const IconComponent = ICON_MAP[service.icon] || Globe
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => toggleService(service.id)}
              className={cn(
                'relative flex flex-col items-center gap-2 rounded-lg border-2 px-2 py-4 text-center transition-all',
                service.enabled
                  ? 'border-teal-400 bg-teal-50/50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              )}
            >
              {/* Check overlay */}
              {service.enabled && (
                <div className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 text-white">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <IconComponent
                className={cn(
                  'h-6 w-6',
                  service.enabled ? 'text-teal-600' : 'text-gray-400'
                )}
              />
              <span
                className={cn(
                  'text-xs font-medium leading-tight',
                  service.enabled ? 'text-teal-700' : 'text-gray-500'
                )}
              >
                {service.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
