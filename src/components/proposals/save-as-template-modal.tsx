'use client'

import { useState } from 'react'
import { X, Loader2, Bookmark } from 'lucide-react'

interface SaveAsTemplateModalProps {
  proposalId: string
  isOpen: boolean
  onClose: () => void
}

export function SaveAsTemplateModal({
  proposalId,
  isOpen,
  onClose,
}: SaveAsTemplateModalProps) {
  const [templateName, setTemplateName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSave() {
    if (!templateName.trim()) {
      setError('Template name is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/proposals/${proposalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isTemplate: true,
          templateName: templateName.trim(),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save as template')
      }

      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
        setTemplateName('')
      }, 1500)
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
      <div className="relative w-full max-w-md mx-4 rounded-xl border border-gray-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-[#625AED]" />
            <h2 className="text-lg font-semibold text-[#003964]">
              Save as Template
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
          {success ? (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                <Bookmark className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-green-700">
                Template saved successfully!
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Template Name
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g. Standard Web Development Proposal"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#00CFF8] focus:outline-none focus:ring-1 focus:ring-[#00CFF8]"
                  autoFocus
                />
              </div>
              <p className="text-xs text-gray-400">
                This proposal&apos;s content will be saved as a reusable template.
              </p>

              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !templateName.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#625AED] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#5248d4] transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Template
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
