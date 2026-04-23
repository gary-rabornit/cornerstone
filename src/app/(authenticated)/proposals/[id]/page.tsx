'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { cn, getStatusColor, getStatusName } from '@/lib/utils'
import { ProposalEditor } from '@/components/proposals/proposal-editor'
import { ApprovalStatus } from '@/components/proposals/approval-status'
import { SubmitForApprovalModal } from '@/components/proposals/submit-for-approval-modal'
import { SaveAsTemplateModal } from '@/components/proposals/save-as-template-modal'
import type { ProposalSection, PricingItem, ServiceItem, PricingTier } from '@/types'
import {
  ArrowLeft,
  Save,
  Eye,
  Send,
  UserCheck,
  Bookmark,
  Loader2,
  Check,
  ExternalLink,
  X,
  Copy,
  Shield,
} from 'lucide-react'
import Link from 'next/link'
import { getCompanyBranding } from '@/lib/companies'
import { CompanyLogo } from '@/components/ui/company-logo'

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
  deal: {
    id: string
    companyName: string
    contactName: string
  } | null
  createdBy: {
    id: string
    name: string
  }
  approvals: {
    id: string
    approverId: string
    status: string
    comments: string | null
    respondedAt: string | null
    approver: {
      id: string
      name: string
      email: string
    }
  }[]
}

export default function ProposalEditorPage() {
  const params = useParams()
  const router = useRouter()
  const proposalId = params.id as string

  const [proposal, setProposal] = useState<ProposalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [titleEditing, setTitleEditing] = useState(false)
  const [titleValue, setTitleValue] = useState('')
  const [approvalModalOpen, setApprovalModalOpen] = useState(false)
  const [templateModalOpen, setTemplateModalOpen] = useState(false)
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [clientUrl, setClientUrl] = useState('')
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetchProposal()
  }, [proposalId])

  async function fetchProposal() {
    try {
      const res = await fetch(`/api/proposals/${proposalId}`)
      if (!res.ok) throw new Error('Not found')
      const data = await res.json()
      // Parse JSON fields
      data.sections =
        typeof data.sections === 'string' ? JSON.parse(data.sections) : data.sections || []
      data.pricingItems =
        typeof data.pricingItems === 'string'
          ? JSON.parse(data.pricingItems)
          : data.pricingItems || []
      data.pricingTiers =
        typeof data.pricingTiers === 'string'
          ? JSON.parse(data.pricingTiers)
          : data.pricingTiers || []
      data.services =
        typeof data.services === 'string'
          ? JSON.parse(data.services)
          : data.services || []
      setProposal(data)
      setTitleValue(data.title)
    } catch {
      router.push('/proposals')
    } finally {
      setLoading(false)
    }
  }

  const debouncedSave = useCallback(
    (data: {
      sections: ProposalSection[];
      pricingItems: PricingItem[];
      pricingMode?: string;
      pricingTiers?: PricingTier[];
      services?: ServiceItem[];
      repName?: string;
      repTitle?: string;
      repEmail?: string;
      repPhone?: string;
    }) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      setSaveStatus('saving')
      saveTimerRef.current = setTimeout(async () => {
        try {
          const body: Record<string, unknown> = {
            sections: JSON.stringify(data.sections),
            pricingItems: JSON.stringify(data.pricingItems),
          }
          if (data.pricingMode !== undefined) body.pricingMode = data.pricingMode
          if (data.pricingTiers !== undefined) body.pricingTiers = JSON.stringify(data.pricingTiers)
          if (data.services !== undefined) body.services = JSON.stringify(data.services)
          if (data.repName !== undefined) body.repName = data.repName
          if (data.repTitle !== undefined) body.repTitle = data.repTitle
          if (data.repEmail !== undefined) body.repEmail = data.repEmail
          if (data.repPhone !== undefined) body.repPhone = data.repPhone

          await fetch(`/api/proposals/${proposalId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
          setSaveStatus('saved')
          setTimeout(() => setSaveStatus('idle'), 2000)
        } catch {
          setSaveStatus('idle')
        }
      }, 2000)
    },
    [proposalId]
  )

  async function handleSaveTitle() {
    if (!titleValue.trim() || titleValue === proposal?.title) {
      setTitleEditing(false)
      return
    }
    await fetch(`/api/proposals/${proposalId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: titleValue.trim() }),
    })
    setProposal((prev) => (prev ? { ...prev, title: titleValue.trim() } : prev))
    setTitleEditing(false)
  }

  async function handleManualSave() {
    if (!proposal) return
    setSaveStatus('saving')
    try {
      await fetch(`/api/proposals/${proposalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sections: JSON.stringify(proposal.sections),
          pricingItems: JSON.stringify(proposal.pricingItems),
          pricingMode: proposal.pricingMode,
          pricingTiers: JSON.stringify(proposal.pricingTiers),
          services: JSON.stringify(proposal.services),
          repName: proposal.repName,
          repTitle: proposal.repTitle,
          repEmail: proposal.repEmail,
          repPhone: proposal.repPhone,
        }),
      })
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      setSaveStatus('idle')
    }
  }

  async function handleSendToClient() {
    try {
      const res = await fetch(`/api/proposals/${proposalId}/send`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Failed to send')
      const data = await res.json()
      setClientUrl(data.clientUrl || `${window.location.origin}/client/proposals/${proposalId}`)
      setSendModalOpen(true)
      fetchProposal()
    } catch {
      // Error handling
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#00CFF8]" />
      </div>
    )
  }

  if (!proposal) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/proposals"
            className="rounded-lg p-2 text-gray-400 hover:bg-white hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            {titleEditing ? (
              <input
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                autoFocus
                className="text-2xl font-bold text-[#003964] bg-transparent border-b-2 border-[#00CFF8] focus:outline-none py-0.5"
              />
            ) : (
              <h1
                onClick={() => setTitleEditing(true)}
                className="text-2xl font-bold text-[#003964] cursor-pointer hover:text-[#00CFF8] transition-colors"
                title="Click to edit title"
              >
                {proposal.title}
              </h1>
            )}
            <div className="flex items-center gap-3 mt-1">
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                  getStatusColor(proposal.status)
                )}
              >
                {getStatusName(proposal.status)}
              </span>
              {proposal.company && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-0.5">
                  <CompanyLogo companyKey={proposal.company} size="md" />
                </span>
              )}
              {proposal.deal && (
                <span className="text-sm text-gray-500">
                  {proposal.deal.companyName}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Save Status + Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Save indicator */}
          <span className="text-xs text-gray-400 mr-2">
            {saveStatus === 'saving' && (
              <span className="inline-flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="inline-flex items-center gap-1 text-green-600">
                <Check className="h-3 w-3" />
                Saved
              </span>
            )}
          </span>

          <button
            onClick={handleManualSave}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Save className="h-4 w-4" />
            Save
          </button>

          <Link
            href={`/proposals/${proposalId}/preview`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Link>

          {(proposal.status === 'SENT' || proposal.status === 'SIGNED' || proposal.status === 'DECLINED') && (
            <Link
              href={`/proposals/${proposalId}/audit-trail`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Shield className="h-4 w-4" />
              Audit Trail
            </Link>
          )}

          {proposal.status === 'DRAFT' && (
            <button
              onClick={() => setApprovalModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#625AED] px-3 py-2 text-sm font-semibold text-white hover:bg-[#5248d4] transition-colors"
            >
              <UserCheck className="h-4 w-4" />
              Submit for Approval
            </button>
          )}

          {proposal.status === 'APPROVED' && (
            <button
              onClick={handleSendToClient}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#00CFF8] px-3 py-2 text-sm font-semibold text-white hover:bg-[#00b8dd] transition-colors"
            >
              <Send className="h-4 w-4" />
              Send to Client
            </button>
          )}

          <button
            onClick={() => setTemplateModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Bookmark className="h-4 w-4" />
            Save as Template
          </button>
        </div>
      </div>

      {/* Approval Status */}
      {proposal.approvals && proposal.approvals.length > 0 && (
        <ApprovalStatus approvals={proposal.approvals} />
      )}

      {/* Editor */}
      <ProposalEditor proposal={proposal} onSave={debouncedSave} />

      {/* Modals */}
      <SubmitForApprovalModal
        proposalId={proposalId}
        isOpen={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        onSubmit={() => fetchProposal()}
      />

      <SaveAsTemplateModal
        proposalId={proposalId}
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
      />

      {/* Send to Client URL Modal */}
      {sendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSendModalOpen(false)}
          />
          <div className="relative w-full max-w-md mx-4 rounded-xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-[#00CFF8]" />
                <h2 className="text-lg font-semibold text-[#003964]">
                  Proposal Sent
                </h2>
              </div>
              <button
                onClick={() => setSendModalOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-3">
              <p className="text-sm text-gray-600">
                Your proposal has been sent. Share this link with your client:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={clientUrl}
                  readOnly
                  className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(clientUrl)}
                  className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 transition-colors"
                  title="Copy link"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex justify-end border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setSendModalOpen(false)}
                className="rounded-lg bg-[#00CFF8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#00b8dd] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
