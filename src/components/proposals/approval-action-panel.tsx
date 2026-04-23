'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react'

interface ApprovalActionPanelProps {
  proposalId: string
  approvalId: string
  currentStatus: string
}

export function ApprovalActionPanel({
  proposalId,
  approvalId,
  currentStatus,
}: ApprovalActionPanelProps) {
  const router = useRouter()
  const [comments, setComments] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleAction(status: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED') {
    if ((status === 'REJECTED' || status === 'CHANGES_REQUESTED') && !comments.trim()) {
      setError('Please provide comments when rejecting or requesting changes')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(
        `/api/proposals/${proposalId}/approvals/${approvalId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, comments: comments.trim() || null }),
        }
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit decision')
      }

      router.push(`/proposals/${proposalId}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  if (currentStatus !== 'PENDING') {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm text-center">
        <p className="text-sm text-gray-500">
          You have already responded to this approval request.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
      <h3 className="text-lg font-semibold text-[#003964]">Your Decision</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Comments{' '}
          <span className="text-gray-400 font-normal">
            (required for reject / request changes)
          </span>
        </label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Add your feedback..."
          rows={4}
          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#00CFF8] focus:outline-none focus:ring-1 focus:ring-[#00CFF8] resize-none"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          onClick={() => handleAction('APPROVED')}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          Approve
        </button>

        <button
          onClick={() => handleAction('CHANGES_REQUESTED')}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          Request Changes
        </button>

        <button
          onClick={() => handleAction('REJECTED')}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          Reject
        </button>
      </div>
    </div>
  )
}
