'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, FileText, Loader2, Check, Building2, Briefcase, FolderSearch, X } from 'lucide-react'
import Link from 'next/link'
/* eslint-disable @next/next/no-img-element */
import { COMPANY_OPTIONS, type CompanyKey } from '@/lib/companies'

interface TemplateOption {
  id: string
  templateName: string | null
  title: string
}

const INDUSTRIES = [
  'Healthcare',
  'Technology',
  'Real Estate',
  'Finance & Banking',
  'Education',
  'Retail & E-Commerce',
  'Manufacturing',
  'Hospitality & Tourism',
  'Legal',
  'Nonprofit',
  'Energy & Utilities',
  'Construction',
  'Agriculture',
  'Transportation & Logistics',
  'Entertainment & Media',
  'Government',
  'Food & Beverage',
  'Professional Services',
  'Automotive',
]

const SERVICES = [
  'Website Design & Development',
  'Brand Identity & Strategy',
  'Social Media Management',
  'Digital Marketing & SEO',
  'Video Production',
  'Graphic Design',
  'Content Creation & Copywriting',
  'Email Marketing',
  'PPC / Paid Advertising',
  'Photography',
  'Public Relations',
  'Marketing Strategy & Consulting',
  'App Development',
  'IT Consulting & Support',
  'Managed IT Services',
  'Cloud Solutions',
  'Cybersecurity',
  'Software Development',
  'Data Analytics',
  'E-Commerce Solutions',
]

export default function NewProposalPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedDealId = searchParams.get('dealId')
  const prefillCompany = searchParams.get('company') as CompanyKey | null
  const prefillClientCompanyName = searchParams.get('clientCompanyName')
  const prefillClientContactName = searchParams.get('clientContactName')
  const prefillClientContactEmail = searchParams.get('clientContactEmail')
  const prefillDealValue = searchParams.get('dealValue')

  // If coming from a deal, pre-select the company and skip to step 2
  const hasPrefilledCompany = !!prefillCompany
  const [step, setStep] = useState<1 | 2 | 3>(hasPrefilledCompany ? 2 : 1)
  const [company, setCompany] = useState<CompanyKey | ''>(prefillCompany || '')
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [customIndustry, setCustomIndustry] = useState('')
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [customService, setCustomService] = useState('')
  const [exampleClients, setExampleClients] = useState<string[]>([])
  const [exampleClientInput, setExampleClientInput] = useState('')
  const [title, setTitle] = useState('')
  const [clientCompanyName, setClientCompanyName] = useState(prefillClientCompanyName || '')
  const [clientContactName, setClientContactName] = useState(prefillClientContactName || '')
  const [clientContactEmail, setClientContactEmail] = useState(prefillClientContactEmail || '')
  const [dealValue, setDealValue] = useState(prefillDealValue && prefillDealValue !== '0' ? prefillDealValue : '')
  const [fromTemplateId, setFromTemplateId] = useState('')
  const [templates, setTemplates] = useState<TemplateOption[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchData() {
      const res = await fetch('/api/proposals?templates=true')
      if (res.ok) {
        const data = await res.json()
        setTemplates(data)
      }
    }
    fetchData()
  }, [])

  function toggleIndustry(ind: string) {
    setSelectedIndustries((prev) =>
      prev.includes(ind)
        ? prev.filter((i) => i !== ind)
        : [...prev, ind]
    )
  }

  function addCustomIndustry() {
    const trimmed = customIndustry.trim()
    if (trimmed && !selectedIndustries.includes(trimmed)) {
      setSelectedIndustries((prev) => [...prev, trimmed])
      setCustomIndustry('')
    }
  }

  function toggleService(service: string) {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    )
  }

  function addCustomService() {
    const trimmed = customService.trim()
    if (trimmed && !selectedServices.includes(trimmed)) {
      setSelectedServices((prev) => [...prev, trimmed])
      setCustomService('')
    }
  }

  function addExampleClient() {
    const trimmed = exampleClientInput.trim()
    if (trimmed && !exampleClients.includes(trimmed)) {
      setExampleClients((prev) => [...prev, trimmed])
      setExampleClientInput('')
    }
  }

  function removeExampleClient(client: string) {
    setExampleClients((prev) => prev.filter((c) => c !== client))
  }

  const resolvedIndustry = selectedIndustries.join(', ')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    if (!company) {
      setError('Please select a company')
      return
    }
    if (!clientCompanyName.trim()) {
      setError('Client company name is required')
      return
    }
    if (!clientContactName.trim()) {
      setError('Client contact name is required')
      return
    }
    if (!clientContactEmail.trim()) {
      setError('Client contact email is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const body: Record<string, string | string[]> = {
        title: title.trim(),
        company,
        industry: resolvedIndustry,
        serviceType: selectedServices.join(', '),
        exampleClients: exampleClients,
        clientCompanyName: clientCompanyName.trim(),
        clientContactName: clientContactName.trim(),
        clientContactEmail: clientContactEmail.trim(),
        dealValue: dealValue || '0',
      }
      if (preselectedDealId) body.dealId = preselectedDealId as string
      if (fromTemplateId) body.fromTemplateId = fromTemplateId

      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create proposal')
      }

      const proposal = await res.json()
      router.push(`/proposals/${proposal.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  const steps = [
    { num: 1, label: 'Company' },
    { num: 2, label: 'Industry & Services' },
    { num: 3, label: 'Details' },
  ]

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/proposals"
          className="rounded-lg p-2 text-gray-400 hover:bg-white hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#003964]">New Proposal</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {step === 1 && 'Select which company this proposal is for'}
            {step === 2 && 'Tell us about the client\'s industry and the services you\'ll provide'}
            {step === 3 && 'Set up your proposal details'}
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-3">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-2">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step > s.num
                    ? 'bg-[#00CFF8] text-white'
                    : step === s.num
                      ? 'bg-[#00CFF8] text-white'
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > s.num ? <Check className="h-4 w-4" /> : s.num}
              </div>
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className="flex-1 h-px bg-gray-200" />}
          </div>
        ))}
      </div>

      {/* Step 1: Company Selection */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid gap-4">
            {COMPANY_OPTIONS.map((co) => (
              <button
                key={co.key}
                type="button"
                onClick={() => setCompany(co.key)}
                className={`relative flex items-center gap-5 rounded-xl border-2 bg-white p-5 text-left transition-all ${
                  company === co.key
                    ? 'border-[#00CFF8] shadow-md shadow-[#00CFF8]/10'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                {company === co.key && (
                  <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-[#00CFF8] flex items-center justify-center">
                    <Check className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
                <div className="h-16 w-40 flex-shrink-0 flex items-center justify-center">
                  <img
                    src={co.logo}
                    alt={co.name}
                    className="max-h-16 w-auto object-contain"
                  />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{co.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: co.primaryColor }} />
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: co.secondaryColor }} />
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: co.accentColor }} />
                    <span className="text-xs text-gray-400 ml-1">Brand colors</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                if (!company) {
                  setError('Please select a company')
                  return
                }
                setError('')
                setStep(2)
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-[#00CFF8] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#00b8dd] transition-colors"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              href="/proposals"
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>
      )}

      {/* Step 2: Industry & Services */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Industry */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#003964]/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-[#003964]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Industry</h2>
                <p className="text-sm text-gray-500">What industry is the client in?</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {INDUSTRIES.map((ind) => (
                <button
                  key={ind}
                  type="button"
                  onClick={() => toggleIndustry(ind)}
                  className={`rounded-lg border px-3 py-2.5 text-sm text-left transition-all flex items-center gap-2 ${
                    selectedIndustries.includes(ind)
                      ? 'border-[#00CFF8] bg-[#00CFF8]/5 text-[#003964] font-medium'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded border flex-shrink-0 flex items-center justify-center ${
                      selectedIndustries.includes(ind)
                        ? 'border-[#00CFF8] bg-[#00CFF8]'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedIndustries.includes(ind) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  {ind}
                </button>
              ))}
            </div>

            {/* Custom industry */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customIndustry}
                onChange={(e) => setCustomIndustry(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addCustomIndustry()
                  }
                }}
                placeholder="Add a custom industry..."
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#00CFF8] focus:outline-none focus:ring-1 focus:ring-[#00CFF8]"
              />
              <button
                type="button"
                onClick={addCustomIndustry}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Add
              </button>
            </div>

            {selectedIndustries.length > 0 && (
              <p className="text-sm text-gray-500">
                {selectedIndustries.length} industr{selectedIndustries.length !== 1 ? 'ies' : 'y'} selected
              </p>
            )}
          </div>

          {/* Services */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#625AED]/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-[#625AED]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Services</h2>
                <p className="text-sm text-gray-500">What services will you provide? Select all that apply.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {SERVICES.map((svc) => (
                <button
                  key={svc}
                  type="button"
                  onClick={() => toggleService(svc)}
                  className={`rounded-lg border px-3 py-2.5 text-sm text-left transition-all flex items-center gap-2 ${
                    selectedServices.includes(svc)
                      ? 'border-[#625AED] bg-[#625AED]/5 text-[#003964] font-medium'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded border flex-shrink-0 flex items-center justify-center ${
                      selectedServices.includes(svc)
                        ? 'border-[#625AED] bg-[#625AED]'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedServices.includes(svc) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  {svc}
                </button>
              ))}
            </div>

            {/* Custom service */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customService}
                onChange={(e) => setCustomService(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addCustomService()
                  }
                }}
                placeholder="Add a custom service..."
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#625AED] focus:outline-none focus:ring-1 focus:ring-[#625AED]"
              />
              <button
                type="button"
                onClick={addCustomService}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Add
              </button>
            </div>

            {/* Selected count */}
            {selectedServices.length > 0 && (
              <p className="text-sm text-gray-500">
                {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {/* Example Work / Client References */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#00CFF8]/10 flex items-center justify-center">
                <FolderSearch className="h-5 w-5 text-[#00CFF8]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Example Work</h2>
                <p className="text-sm text-gray-500">
                  Add client names whose work you&apos;d like to showcase in this proposal.
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-400">
              Enter the names of past clients whose projects are relevant to this proposal.
              We&apos;ll pull example work from the shared portfolio folder to include in the proposal.
            </p>

            {/* Client name input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={exampleClientInput}
                onChange={(e) => setExampleClientInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addExampleClient()
                  }
                }}
                placeholder="e.g. Acme Corp, Sunrise Healthcare..."
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#00CFF8] focus:outline-none focus:ring-1 focus:ring-[#00CFF8]"
              />
              <button
                type="button"
                onClick={addExampleClient}
                disabled={!exampleClientInput.trim()}
                className="rounded-lg bg-[#00CFF8] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#00b8dd] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>

            {/* Added clients */}
            {exampleClients.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Clients to include ({exampleClients.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {exampleClients.map((client) => (
                    <span
                      key={client}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#003964]/10 px-3 py-1.5 text-sm font-medium text-[#003964]"
                    >
                      {client}
                      <button
                        type="button"
                        onClick={() => removeExampleClient(client)}
                        className="text-[#003964]/50 hover:text-[#003964] transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {exampleClients.length === 0 && (
              <div className="rounded-lg border border-dashed border-gray-200 px-4 py-6 text-center">
                <FolderSearch className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">
                  No clients added yet. Add client names above to include their work as examples.
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  This is optional — you can skip this step.
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setError('')
                setStep(1)
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              type="button"
              onClick={() => {
                if (selectedIndustries.length === 0) {
                  setError('Please select at least one industry')
                  return
                }
                if (selectedServices.length === 0) {
                  setError('Please select at least one service')
                  return
                }
                setError('')
                setStep(3)
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-[#00CFF8] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#00b8dd] transition-colors"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              href="/proposals"
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>
      )}

      {/* Step 3: Proposal Details */}
      {step === 3 && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5"
        >
          {/* Selected Company Badge */}
          {company && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-2.5">
                <img
                  src={COMPANY_OPTIONS.find((c) => c.key === company)?.logo || ''}
                  alt=""
                  className="max-h-8 w-auto object-contain"
                />
                <span className="text-sm font-medium text-gray-700">
                  {COMPANY_OPTIONS.find((c) => c.key === company)?.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-[#00CFF8] hover:underline"
              >
                Change
              </button>
            </div>
          )}

          {/* Industry & Services Summary */}
          <div className="rounded-lg bg-gray-50 px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#003964]" />
                <span className="text-sm font-medium text-gray-700">Industries</span>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-sm text-[#00CFF8] hover:underline"
              >
                Change
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedIndustries.map((ind) => (
                <span
                  key={ind}
                  className="inline-flex items-center rounded-full bg-[#00CFF8]/10 px-2.5 py-0.5 text-xs font-medium text-[#003964]"
                >
                  {ind}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedServices.map((svc) => (
                <span
                  key={svc}
                  className="inline-flex items-center rounded-full bg-[#625AED]/10 px-2.5 py-0.5 text-xs font-medium text-[#625AED]"
                >
                  {svc}
                </span>
              ))}
            </div>
            {exampleClients.length > 0 && (
              <>
                <div className="flex items-center gap-2 pt-1">
                  <FolderSearch className="h-4 w-4 text-[#00CFF8]" />
                  <span className="text-sm font-medium text-gray-700">Example Work</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {exampleClients.map((client) => (
                    <span
                      key={client}
                      className="inline-flex items-center rounded-full bg-[#003964]/10 px-2.5 py-0.5 text-xs font-medium text-[#003964]"
                    >
                      {client}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Proposal Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Website Redesign Proposal"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#00CFF8] focus:outline-none focus:ring-1 focus:ring-[#00CFF8]"
            />
          </div>

          {/* Client Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="clientCompanyName"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Client Company <span className="text-red-500">*</span>
              </label>
              <input
                id="clientCompanyName"
                type="text"
                value={clientCompanyName}
                onChange={(e) => setClientCompanyName(e.target.value)}
                placeholder="e.g. Acme Corporation"
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#00CFF8] focus:outline-none focus:ring-1 focus:ring-[#00CFF8]"
              />
            </div>
            <div>
              <label
                htmlFor="clientContactName"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Contact Name <span className="text-red-500">*</span>
              </label>
              <input
                id="clientContactName"
                type="text"
                value={clientContactName}
                onChange={(e) => setClientContactName(e.target.value)}
                placeholder="e.g. John Smith"
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#00CFF8] focus:outline-none focus:ring-1 focus:ring-[#00CFF8]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="clientContactEmail"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Contact Email <span className="text-red-500">*</span>
              </label>
              <input
                id="clientContactEmail"
                type="email"
                value={clientContactEmail}
                onChange={(e) => setClientContactEmail(e.target.value)}
                placeholder="e.g. john@acme.com"
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#00CFF8] focus:outline-none focus:ring-1 focus:ring-[#00CFF8]"
              />
            </div>
            <div>
              <label
                htmlFor="dealValue"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Deal Value ($)
              </label>
              <input
                id="dealValue"
                type="text"
                inputMode="numeric"
                value={dealValue ? Number(dealValue).toLocaleString('en-US') : ''}
                onChange={(e) => {
                  const digits = e.target.value.replace(/[^\d]/g, '')
                  setDealValue(digits)
                }}
                placeholder="e.g. 10,000"
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#00CFF8] focus:outline-none focus:ring-1 focus:ring-[#00CFF8]"
              />
            </div>
          </div>

          {/* Template Selector */}
          <div>
            <label
              htmlFor="template"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Start from Template
            </label>
            <select
              id="template"
              value={fromTemplateId}
              onChange={(e) => setFromTemplateId(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-[#00CFF8] focus:outline-none focus:ring-1 focus:ring-[#00CFF8] bg-white"
            >
              <option value="">Blank proposal</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.templateName || t.title}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Optionally start with content from an existing template
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-[#00CFF8] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#00b8dd] transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              Create Proposal
            </button>
            <Link
              href="/proposals"
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}
