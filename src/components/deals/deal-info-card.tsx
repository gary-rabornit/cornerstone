'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PIPELINE_STAGES } from '@/lib/constants'
import {
  formatCurrency,
  getStageName,
  getStageColor,
} from '@/lib/utils'
import { getCompanyBranding, COMPANY_OPTIONS, type CompanyKey } from '@/lib/companies'
import { CompanyLogo } from '@/components/ui/company-logo'

interface DealInfoCardProps {
  deal: {
    id: string
    company: string
    companyName: string
    contactName: string
    contactEmail: string | null
    contactPhone: string | null
    companyWebsite: string | null
    commissionApplicable: boolean
    commissionRecipient: string | null
    coCommissionApplicable: boolean
    coCommissionRecipient: string | null
    value: number
    stage: string
    ownerId: string
    owner: {
      id: string
      name: string
      email: string
      avatar: string | null
    }
  }
  users: Array<{ id: string; name: string }>
}

export function DealInfoCard({ deal, users }: DealInfoCardProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const [company, setCompany] = useState<CompanyKey>(deal.company as CompanyKey)
  const [companyName, setCompanyName] = useState(deal.companyName)
  const [contactName, setContactName] = useState(deal.contactName)
  const [contactEmail, setContactEmail] = useState(deal.contactEmail || '')
  const [contactPhone, setContactPhone] = useState(deal.contactPhone || '')
  const [companyWebsite, setCompanyWebsite] = useState(deal.companyWebsite || '')
  const [value, setValue] = useState(String(deal.value))
  const [stage, setStage] = useState(deal.stage)
  const [ownerId, setOwnerId] = useState(deal.ownerId)

  function handleCancel() {
    setCompany(deal.company as CompanyKey)
    setCompanyName(deal.companyName)
    setContactName(deal.contactName)
    setContactEmail(deal.contactEmail || '')
    setContactPhone(deal.contactPhone || '')
    setCompanyWebsite(deal.companyWebsite || '')
    setValue(String(deal.value))
    setStage(deal.stage)
    setOwnerId(deal.ownerId)
    setEditing(false)
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/deals/${deal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company,
          companyName: companyName.trim(),
          contactName: contactName.trim(),
          contactEmail: contactEmail.trim() || null,
          contactPhone: contactPhone.trim() || null,
          companyWebsite: companyWebsite.trim() || null,
          value: parseFloat(value) || 0,
          stage,
          ownerId,
        }),
      })

      if (!res.ok) throw new Error('Failed to update deal')

      setEditing(false)
      router.refresh()
    } catch {
      // Error handled silently
    } finally {
      setLoading(false)
    }
  }

  if (!editing) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-[#1A202C]">Deal Information</h3>
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        </div>

        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
          <CompanyLogo companyKey={deal.company} size="md" />
          <span className="text-xs font-medium text-gray-500">{getCompanyBranding(deal.company).name}</span>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Client Company</p>
            <p className="mt-1 text-sm font-medium text-[#1A202C]">{deal.companyName}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact</p>
            <p className="mt-1 text-sm font-medium text-[#1A202C]">{deal.contactName}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</p>
            <p className="mt-1 text-sm text-[#1A202C]">{deal.contactEmail || '\u2014'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</p>
            <p className="mt-1 text-sm text-[#1A202C]">{deal.contactPhone || '\u2014'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Website</p>
            {deal.companyWebsite ? (
              <a href={deal.companyWebsite} target="_blank" rel="noopener noreferrer" className="mt-1 text-sm text-[#00CFF8] hover:underline block truncate">
                {deal.companyWebsite.replace(/^https?:\/\//, '')}
              </a>
            ) : (
              <p className="mt-1 text-sm text-[#1A202C]">{'\u2014'}</p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Value</p>
            <p className="mt-1 text-sm font-bold text-[#003964]">{formatCurrency(deal.value)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Stage</p>
            <span className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStageColor(deal.stage)}`}>
              {getStageName(deal.stage)}
            </span>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Owner</p>
            <p className="mt-1 text-sm font-medium text-[#1A202C]">{deal.owner.name}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Commission</p>
            <p className="mt-1 text-sm font-medium text-[#1A202C]">
              {deal.commissionApplicable ? 'Yes' : 'No'}
            </p>
          </div>
          {deal.commissionApplicable && deal.commissionRecipient && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Commission Recipient</p>
              <p className="mt-1 text-sm font-medium text-[#1A202C]">{deal.commissionRecipient}</p>
            </div>
          )}
          {deal.commissionApplicable && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Co-Commission</p>
              <p className="mt-1 text-sm font-medium text-[#1A202C]">
                {deal.coCommissionApplicable ? 'Yes' : 'No'}
              </p>
            </div>
          )}
          {deal.coCommissionApplicable && deal.coCommissionRecipient && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Co-Commission Recipient</p>
              <p className="mt-1 text-sm font-medium text-[#1A202C]">{deal.coCommissionRecipient}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSave}
      className="rounded-xl border border-[#003964]/20 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-[#1A202C]">Edit Deal</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </button>
          <Button type="submit" size="sm" loading={loading}>
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Raborn Company</label>
        <div className="flex gap-2">
          {COMPANY_OPTIONS.map((co) => (
            <button
              key={co.key}
              type="button"
              onClick={() => setCompany(co.key)}
              className={`flex-1 flex items-center justify-center rounded-lg border-2 px-3 py-2 transition-all ${
                company === co.key
                  ? 'border-[#00CFF8] bg-[#00CFF8]/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CompanyLogo companyKey={co.key} size="sm" />
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Client Company Name
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-[#003964] focus:ring-2 focus:ring-[#003964]/20 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Contact Name
          </label>
          <input
            type="text"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-[#003964] focus:ring-2 focus:ring-[#003964]/20 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Contact Email
          </label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-[#003964] focus:ring-2 focus:ring-[#003964]/20 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Phone Number
          </label>
          <input
            type="tel"
            value={contactPhone}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
              let formatted = digits
              if (digits.length > 6) {
                formatted = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
              } else if (digits.length > 3) {
                formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`
              }
              setContactPhone(formatted)
            }}
            placeholder="555-555-5555"
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-[#003964] focus:ring-2 focus:ring-[#003964]/20 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Company Website
          </label>
          <input
            type="url"
            value={companyWebsite}
            onChange={(e) => setCompanyWebsite(e.target.value)}
            placeholder="https://acme.com"
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-[#003964] focus:ring-2 focus:ring-[#003964]/20 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Deal Value ($)
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={value ? Number(value).toLocaleString('en-US') : ''}
            onChange={(e) => {
              const digits = e.target.value.replace(/[^\d]/g, '')
              setValue(digits)
            }}
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-[#003964] focus:ring-2 focus:ring-[#003964]/20 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Stage
          </label>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-[#003964] focus:ring-2 focus:ring-[#003964]/20 focus:outline-none bg-white"
          >
            {PIPELINE_STAGES.map((s) => (
              <option key={s} value={s}>
                {getStageName(s)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Owner
          </label>
          <select
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-[#003964] focus:ring-2 focus:ring-[#003964]/20 focus:outline-none bg-white"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </form>
  )
}
