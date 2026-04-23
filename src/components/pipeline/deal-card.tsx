'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency, getStatusColor, getStatusName } from '@/lib/utils'
import { Building2, User, Clock, Trash2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CompanyLogo } from '@/components/ui/company-logo'
import { getCompanyBranding } from '@/lib/companies'

interface DealCardProps {
  deal: {
    id: string
    company: string
    companyName: string
    contactName: string
    companyWebsite: string | null
    value: number
    stageEnteredAt: string | Date
    proposals: Array<{
      id: string
      status: string
    }>
  }
}

export function DealCard({ deal }: DealCardProps) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const daysInStage = Math.floor(
    (Date.now() - new Date(deal.stageEnteredAt).getTime()) / (1000 * 60 * 60 * 24)
  )

  const latestProposal = deal.proposals?.[0]

  function handleTrashClick(e: React.MouseEvent) {
    e.stopPropagation()
    setShowConfirm(true)
  }

  async function handleConfirmDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/deals/${deal.id}`, { method: 'DELETE' })
      if (res.ok) {
        setShowConfirm(false)
        router.refresh()
      }
    } catch {
      // ignore
    } finally {
      setDeleting(false)
    }
  }

  const branding = getCompanyBranding(deal.company)

  return (
    <>
      <div
        onClick={() => router.push(`/deals/${deal.id}`)}
        className="group cursor-pointer rounded-lg border shadow-sm transition-all hover:shadow-md relative overflow-hidden"
        style={{
          borderColor: `${deal.company === 'RABORN_SOFTWARE' ? branding.secondaryColor : branding.accentColor}50`,
          backgroundColor: `${deal.company === 'RABORN_SOFTWARE' ? branding.secondaryColor : branding.accentColor}18`,
          borderLeftWidth: '4px',
          borderLeftColor: deal.company === 'RABORN_SOFTWARE' ? branding.secondaryColor : branding.accentColor,
        }}
      >
        {/* Logo + Delete button top-right */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          <CompanyLogo companyKey={deal.company} size="xs" className={`origin-right ${deal.company === 'RABORN_SOFTWARE' ? 'scale-[0.85]' : 'scale-[0.72]'}`} />
          <button
            onClick={handleTrashClick}
            className="rounded-md p-1 text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all"
            title="Delete deal"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 min-w-0 pr-16">
            {deal.companyWebsite ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={`https://www.google.com/s2/favicons?domain=${new URL(deal.companyWebsite.startsWith('http') ? deal.companyWebsite : `https://${deal.companyWebsite}`).hostname}&sz=32`}
                alt=""
                className="h-4 w-4 shrink-0 rounded-sm"
                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden') }}
              />
            ) : null}
            <Building2 className={`h-4 w-4 shrink-0 text-gray-400 ${deal.companyWebsite ? 'hidden' : ''}`} />
            <p className="text-base font-semibold text-[#1A202C] truncate">
              {deal.companyName}
            </p>
          </div>

          <div className="mt-2 flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-gray-400" />
            <p className="text-xs text-gray-500 truncate">{deal.contactName}</p>
          </div>

          <p className="mt-3 text-lg font-bold" style={{ color: branding.primaryColor }}>
            {formatCurrency(deal.value)}
          </p>

          <div className="mt-3 flex items-center justify-between">
            {latestProposal ? (
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(latestProposal.status)}`}
              >
                {getStatusName(latestProposal.status)}
              </span>
            ) : <div />}
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              <span>{daysInStage}d</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowConfirm(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl mx-4">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Deal</h3>
              <p className="text-sm text-gray-500 mb-1">
                Are you sure you want to delete
              </p>
              <p className="text-sm font-semibold text-gray-900 mb-4">
                &ldquo;{deal.companyName}&rdquo;?
              </p>
              <p className="text-xs text-gray-400 mb-6">
                This will also remove all associated activities. This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  loading={deleting}
                  className="flex-1"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
