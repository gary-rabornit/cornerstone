'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { X, CheckCircle2, FileText, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PIPELINE_STAGES } from '@/lib/constants'
import { getStageName } from '@/lib/utils'
import { COMPANY_OPTIONS, type CompanyKey } from '@/lib/companies'
import { CompanyLogo } from '@/components/ui/company-logo'

interface NewDealModalProps {
  open: boolean
  onClose: () => void
}

interface UserOption {
  id: string
  name: string
}

export function NewDealModal({ open, onClose }: NewDealModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<UserOption[]>([])
  const [error, setError] = useState('')

  const [createdDeal, setCreatedDeal] = useState<{
    id: string
    company: string
    companyName: string
    contactName: string
    contactEmail: string
    value: number
  } | null>(null)
  const [company, setCompany] = useState<CompanyKey | ''>('')
  const [companyName, setCompanyName] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [companyWebsite, setCompanyWebsite] = useState('')
  const [commissionApplicable, setCommissionApplicable] = useState('')
  const [commissionRecipient, setCommissionRecipient] = useState('')
  const [coCommissionApplicable, setCoCommissionApplicable] = useState('')
  const [coCommissionRecipient, setCoCommissionRecipient] = useState('')
  const [value, setValue] = useState('')
  const [stage, setStage] = useState('LEAD')
  const [ownerId, setOwnerId] = useState('')

  useEffect(() => {
    if (open) {
      fetch('/api/users')
        .then((res) => res.json())
        .then((data) => {
          setUsers(data)
          if (data.length > 0 && !ownerId) {
            setOwnerId(data[0].id)
          }
        })
        .catch(() => setError('Failed to load users'))
    }
  }, [open, ownerId])

  function resetForm() {
    setCompany('')
    setCompanyName('')
    setContactName('')
    setContactEmail('')
    setContactPhone('')
    setCompanyWebsite('')
    setCommissionApplicable('')
    setCommissionRecipient('')
    setCoCommissionApplicable('')
    setCoCommissionRecipient('')
    setValue('')
    setStage('LEAD')
    setOwnerId(users[0]?.id || '')
    setError('')
    setCreatedDeal(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!company) {
      setError('Please select a Raborn company')
      return
    }
    if (!companyName.trim()) {
      setError('Company name is required')
      return
    }
    if (!contactName.trim()) {
      setError('Contact name is required')
      return
    }
    if (!contactEmail.trim()) {
      setError('Contact email is required')
      return
    }
    if (!contactPhone.trim()) {
      setError('Phone number is required')
      return
    }
    if (!commissionApplicable) {
      setError('Please select if commission is applicable')
      return
    }
    if (commissionApplicable === 'YES' && !commissionRecipient.trim()) {
      setError('Commission recipient is required')
      return
    }
    if (commissionApplicable === 'YES' && coCommissionApplicable === 'YES' && !coCommissionRecipient.trim()) {
      setError('Co-commission recipient is required')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company,
          companyName: companyName.trim(),
          contactName: contactName.trim(),
          contactEmail: contactEmail.trim(),
          contactPhone: contactPhone.trim() || undefined,
          companyWebsite: companyWebsite.trim() || undefined,
          commissionApplicable: commissionApplicable === 'YES',
          commissionRecipient: commissionApplicable === 'YES' ? commissionRecipient.trim() : null,
          coCommissionApplicable: commissionApplicable === 'YES' && coCommissionApplicable === 'YES',
          coCommissionRecipient: commissionApplicable === 'YES' && coCommissionApplicable === 'YES' ? coCommissionRecipient.trim() : null,
          value: parseFloat(value) || 0,
          stage,
          ownerId,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create deal')
      }

      const deal = await res.json()
      setCreatedDeal({
        id: deal.id,
        company: deal.company,
        companyName: deal.companyName,
        contactName: deal.contactName,
        contactEmail: deal.contactEmail || '',
        value: deal.value,
      })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white shadow-2xl mx-4 max-h-[90vh] overflow-y-auto p-6">
        {createdDeal ? (
          /* Success Screen */
          <div className="flex flex-col items-center text-center py-4">
            <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-7 w-7 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-[#1A202C] mb-1">Deal Created!</h2>
            <p className="text-sm text-gray-500 mb-6">
              &ldquo;{createdDeal.companyName}&rdquo; has been added to the pipeline.
            </p>

            <p className="text-sm font-medium text-gray-700 mb-4">
              Would you like to create a proposal for this deal?
            </p>

            <div className="flex flex-col gap-3 w-full max-w-xs">
              <button
                onClick={() => {
                  const params = new URLSearchParams({
                    dealId: createdDeal.id,
                    company: createdDeal.company,
                    clientCompanyName: createdDeal.companyName,
                    clientContactName: createdDeal.contactName,
                    clientContactEmail: createdDeal.contactEmail,
                    dealValue: String(createdDeal.value),
                  })
                  resetForm()
                  onClose()
                  router.push(`/proposals/new?${params.toString()}`)
                }}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#00CFF8] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#00b8dd] transition-colors"
              >
                <FileText className="h-4 w-4" />
                Create Proposal
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  resetForm()
                  onClose()
                }}
                className="rounded-lg border border-gray-200 px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Not right now
              </button>
            </div>
          </div>
        ) : (
        /* Deal Form */
        <>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#1A202C]">New Deal</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Raborn Company Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Raborn Company <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {COMPANY_OPTIONS.map((co) => (
                <button
                  key={co.key}
                  type="button"
                  onClick={() => setCompany(co.key)}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-lg border-2 px-3 py-2.5 text-xs font-medium transition-all ${
                    company === co.key
                      ? 'border-[#00CFF8] bg-[#00CFF8]/5 text-gray-900'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <CompanyLogo companyKey={co.key} size="sm" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Client Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#003964] focus:ring-2 focus:ring-[#003964]/20 focus:outline-none transition-colors"
              placeholder="Acme Corporation"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Contact Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#003964] focus:ring-2 focus:ring-[#003964]/20 focus:outline-none transition-colors"
              placeholder="John Smith"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Contact Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#003964] focus:ring-2 focus:ring-[#003964]/20 focus:outline-none transition-colors"
              placeholder="john@acme.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Phone Number <span className="text-red-500">*</span>
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
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#003964] focus:ring-2 focus:ring-[#003964]/20 focus:outline-none transition-colors"
              placeholder="555-555-5555"
            />
          </div>

          {/* Commission */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Commission Applicable? <span className="text-red-500">*</span>
            </label>
            <select
              value={commissionApplicable}
              onChange={(e) => {
                setCommissionApplicable(e.target.value)
                if (e.target.value !== 'YES') {
                  setCommissionRecipient('')
                  setCoCommissionApplicable('')
                  setCoCommissionRecipient('')
                }
              }}
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#003964] focus:ring-2 focus:ring-[#003964]/20 focus:outline-none transition-colors bg-white"
            >
              <option value="">Select...</option>
              <option value="YES">Yes</option>
              <option value="NO">No</option>
            </select>
          </div>

          {commissionApplicable === 'YES' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Commission Recipient <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={commissionRecipient}
                  onChange={(e) => setCommissionRecipient(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#003964] focus:ring-2 focus:ring-[#003964]/20 focus:outline-none transition-colors"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Co-Commission Applicable? <span className="text-red-500">*</span>
                </label>
                <select
                  value={coCommissionApplicable}
                  onChange={(e) => {
                    setCoCommissionApplicable(e.target.value)
                    if (e.target.value !== 'YES') {
                      setCoCommissionRecipient('')
                    }
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#003964] focus:ring-2 focus:ring-[#003964]/20 focus:outline-none transition-colors bg-white"
                >
                  <option value="">Select...</option>
                  <option value="YES">Yes</option>
                  <option value="NO">No</option>
                </select>
              </div>

              {coCommissionApplicable === 'YES' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Co-Commission Recipient <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={coCommissionRecipient}
                    onChange={(e) => setCoCommissionRecipient(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#003964] focus:ring-2 focus:ring-[#003964]/20 focus:outline-none transition-colors"
                    placeholder="Enter name"
                  />
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Company Website
            </label>
            <input
              type="url"
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#003964] focus:ring-2 focus:ring-[#003964]/20 focus:outline-none transition-colors"
              placeholder="https://acme.com"
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
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#003964] focus:ring-2 focus:ring-[#003964]/20 focus:outline-none transition-colors"
              placeholder="10,000"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#003964] focus:ring-2 focus:ring-[#003964]/20 focus:outline-none transition-colors bg-white"
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
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-[#003964] focus:ring-2 focus:ring-[#003964]/20 focus:outline-none transition-colors bg-white"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create Deal
            </Button>
          </div>
        </form>
        </>
        )}
      </div>
    </div>
  )
}
