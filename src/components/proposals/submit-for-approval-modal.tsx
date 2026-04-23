'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, UserCheck } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface SubmitForApprovalModalProps {
  proposalId: string
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
}

export function SubmitForApprovalModal({
  proposalId,
  isOpen,
  onClose,
  onSubmit,
}: SubmitForApprovalModalProps) {
  const [users, setUsers] = useState<User[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetch('/api/users')
        .then((res) => res.json())
        .then((data) => setUsers(data))
        .catch(() => setError('Failed to load team members'))
    }
  }, [isOpen])

  function toggleUser(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    )
  }

  async function handleSubmit() {
    if (selectedIds.length === 0) {
      setError('Select at least one approver')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/proposals/${proposalId}/approvals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approverIds: selectedIds,
          message,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit for approval')
      }

      onSubmit()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 rounded-xl border border-gray-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-[#00CFF8]" />
            <h2 className="text-lg font-semibold text-[#003964]">
              Submit for Approval
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Approvers
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto rounded-lg border border-gray-200 p-3">
              {users.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-2">
                  Loading team members...
                </p>
              )}
              {users.map((user) => (
                <label
                  key={user.id}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(user.id)}
                    onChange={() => toggleUser(user.id)}
                    className="h-4 w-4 rounded border-gray-300 text-[#00CFF8] focus:ring-[#00CFF8]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.role} &middot; {user.email}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Message <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a note for the approvers..."
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#00CFF8] focus:outline-none focus:ring-1 focus:ring-[#00CFF8] resize-none"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || selectedIds.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-[#00CFF8] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#00b8dd] transition-colors disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit for Approval
          </button>
        </div>
      </div>
    </div>
  )
}
