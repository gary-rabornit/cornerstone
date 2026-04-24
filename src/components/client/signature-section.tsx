"use client"

import { useState, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import {
  Pen, Type, CheckCircle, XCircle, Loader2, Eraser,
  Shield, FileText, AlertTriangle, Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SignatureCanvas = dynamic(() => import('react-signature-canvas') as any, {
  ssr: false,
  loading: () => (
    <div className="h-[200px] bg-gray-50 rounded-lg flex items-center justify-center">
      <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
    </div>
  ),
}) as any

interface SignatureSectionProps {
  token: string
  proposalTitle: string
  proposalVersion: number
  clientCompanyName?: string
  dealValue?: number
  rabornCompany: string

  // When true, the client must select one plan before signing
  requiresPlanSelection?: boolean
  selectedPlanId?: string | null
  selectedPlanLabel?: string | null
  selectedSolutionName?: string | null
}

type SignatureMode = 'draw' | 'type'

export function SignatureSection({
  token,
  proposalTitle,
  proposalVersion,
  clientCompanyName,
  dealValue,
  rabornCompany,
  requiresPlanSelection = false,
  selectedPlanId,
  selectedPlanLabel,
  selectedSolutionName,
}: SignatureSectionProps) {
  const [mode, setMode] = useState<SignatureMode>('type')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [title, setTitle] = useState('')
  const [phone, setPhone] = useState('')
  const [typedSignature, setTypedSignature] = useState('')
  const [consented, setConsented] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<'signed' | 'declined' | null>(null)
  const [successData, setSuccessData] = useState<{
    signedAt: string
    signedByName: string
    referenceId: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [missingFields, setMissingFields] = useState<string[]>([])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sigCanvasRef = useRef<any>(null)

  const clearSignature = useCallback(() => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear()
    }
  }, [])

  function getSignatureImage(): string | null {
    if (mode === 'draw') {
      if (!sigCanvasRef.current || sigCanvasRef.current.isEmpty()) return null
      return sigCanvasRef.current.toDataURL('image/png')
    } else {
      if (!typedSignature.trim()) return null
      const canvas = document.createElement('canvas')
      canvas.width = 500
      canvas.height = 120
      const ctx = canvas.getContext('2d')
      if (!ctx) return null
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, 500, 120)
      ctx.fillStyle = '#1a202c'
      ctx.font = 'italic 42px Georgia, serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(typedSignature, 250, 60)
      return canvas.toDataURL('image/png')
    }
  }

  async function handleSign() {
    // Collect all missing fields so the user can see everything they still need
    const missing: string[] = []
    if (requiresPlanSelection && !selectedPlanId) {
      missing.push('Plan selection (scroll up and pick a plan)')
    }
    if (!fullName.trim()) missing.push('Full Legal Name')
    if (!email.trim()) missing.push('Email')
    if (!title.trim()) missing.push('Title / Position')
    if (!phone.trim()) missing.push('Phone Number')
    if (!consented) missing.push('Electronic Signature Consent (checkbox)')

    const signatureImage = getSignatureImage()
    if (!signatureImage) missing.push(mode === 'draw' ? 'Drawn Signature' : 'Typed Signature')

    if (missing.length > 0) {
      setMissingFields(missing)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/client/${token}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'SIGNED',
          signedByName: fullName.trim(),
          signedByEmail: email.trim(),
          signedByTitle: title.trim(),
          signedByPhone: phone.trim(),
          signatureImage,
          signatureMode: mode,
          consentedToElectronicSig: true,
          selectedPlanId: selectedPlanId || null,
          selectedPlanLabel: selectedPlanLabel || null,
          selectedSolutionName: selectedSolutionName || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to sign proposal')
      }

      const data = await res.json()
      setSuccessData({
        signedAt: data.signedAt || new Date().toISOString(),
        signedByName: fullName.trim(),
        referenceId: data.referenceId || token.slice(0, 12).toUpperCase(),
      })
      setSuccess('signed')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleDecline() {
    if (!confirm('Are you sure you want to decline this proposal?')) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/client/${token}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'DECLINED',
          signedByName: fullName.trim() || 'Declined',
          signedByEmail: email.trim() || 'declined@unknown.com',
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to decline proposal')
      }

      setSuccess('declined')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // ───────── Success: Signed ─────────
  if (success === 'signed') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-green-50 border border-green-200 rounded-xl p-10 text-center">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-900 mb-2">
            Proposal Signed Successfully
          </h2>
          <p className="text-green-700 text-lg mb-6">
            Thank you for signing &ldquo;{proposalTitle}&rdquo;.
          </p>

          {/* Certificate of Completion */}
          <div className="bg-white border border-green-200 rounded-lg p-6 max-w-lg mx-auto text-left">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Certificate of Completion
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Signed by:</span>
                <span className="font-medium text-gray-900">{successData?.signedByName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Signed at:</span>
                <span className="font-medium text-gray-900">
                  {successData && new Date(successData.signedAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Reference ID:</span>
                <span className="font-mono text-xs text-gray-900">{successData?.referenceId}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={`/api/client/${token}/signed-pdf`}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download Signed Copy
            </a>
          </div>

          <p className="text-green-600 text-sm mt-6">
            A confirmation email has been sent to your inbox.
          </p>
        </div>
      </div>
    )
  }

  // ───────── Success: Declined ─────────
  if (success === 'declined') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-10 text-center">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-red-900 mb-2">
            Proposal Declined
          </h2>
          <p className="text-red-700">
            You have declined this proposal. The sender has been notified.
          </p>
        </div>
      </div>
    )
  }

  // ───────── Main Signature Form ─────────
  const formattedValue = dealValue
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(dealValue)
    : null

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-6">
      {/* Agreement Summary */}
      <div className="bg-white border-2 border-[#003964] rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 sm:px-8 py-5 bg-[#003964] text-white">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-[#00CFF8]" />
            <h2 className="text-lg font-bold">Agreement Summary</h2>
          </div>
          <p className="text-xs text-blue-100 mt-1">
            Please review the terms below before signing.
          </p>
        </div>
        <div className="px-6 sm:px-8 py-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Agreement</p>
              <p className="mt-1 font-semibold text-gray-900">{proposalTitle}</p>
            </div>
            {clientCompanyName && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Between</p>
                <p className="mt-1 font-semibold text-gray-900">{rabornCompany} &amp; {clientCompanyName}</p>
              </div>
            )}
            {formattedValue && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Value</p>
                <p className="mt-1 font-semibold text-[#003964]">{formattedValue}</p>
              </div>
            )}
          </div>

          {/* Selected Plan confirmation */}
          {requiresPlanSelection && (
            <div
              className={`rounded-lg border-2 px-4 py-3 mt-2 ${
                selectedPlanId
                  ? 'border-green-200 bg-green-50'
                  : 'border-amber-200 bg-amber-50'
              }`}
            >
              <p className={`text-xs font-semibold uppercase tracking-wide ${selectedPlanId ? 'text-green-800' : 'text-amber-800'}`}>
                Selected Plan
              </p>
              {selectedPlanId ? (
                <p className="mt-1 text-sm font-semibold text-green-900">
                  ✓ {selectedSolutionName} · {selectedPlanLabel}
                </p>
              ) : (
                <p className="mt-1 text-sm font-medium text-amber-800">
                  No plan selected yet. Please scroll up and pick one of the offered plans.
                </p>
              )}
            </div>
          )}

          <p className="text-xs text-gray-500 pt-2 border-t border-gray-100">
            By signing below, you agree to the full terms detailed in the proposal above.
          </p>
        </div>
      </div>

      {/* Signature Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 sm:px-8 py-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <h2 className="text-xl font-bold text-[#003964]">Sign This Proposal</h2>
          <p className="text-sm text-gray-500 mt-1">
            Complete the fields below to electronically accept this agreement.
          </p>
        </div>

        <div className="px-6 sm:px-8 py-8 space-y-6">
          {error && (
            <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Contact Information */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Signer Information
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Legal Name *"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="John Smith"
              />
              <Input
                label="Email *"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="john@company.com"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <Input
                label="Title / Position *"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. CEO, Marketing Director"
              />
              <Input
                label="Phone Number *"
                type="tel"
                value={phone}
                onChange={e => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
                  let formatted = digits
                  if (digits.length > 6) {
                    formatted = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
                  } else if (digits.length > 3) {
                    formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`
                  }
                  setPhone(formatted)
                }}
                placeholder="555-555-5555"
              />
            </div>
          </div>

          {/* ESIGN Consent Disclosure */}
          <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-amber-600" />
              <h3 className="text-sm font-bold text-amber-900">
                Electronic Signature Consent
              </h3>
            </div>
            <div className="space-y-2 text-xs text-amber-900 leading-relaxed">
              <p>
                By checking the box below, you agree to the following:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  You consent to conduct business electronically and to sign this agreement
                  using an electronic signature (the &ldquo;E-SIGN Act,&rdquo; 15 U.S.C. &sect; 7001, and UETA).
                </li>
                <li>
                  You understand that your electronic signature has the same legal effect
                  as a handwritten signature.
                </li>
                <li>
                  You have had the opportunity to review the full proposal above, and your
                  signature confirms agreement to its terms.
                </li>
                <li>
                  This signature will be permanently linked to this specific proposal and
                  cannot be altered once submitted.
                </li>
              </ul>
            </div>
            <label className="mt-4 flex items-start gap-3 cursor-pointer p-3 -mx-1 rounded-md hover:bg-amber-100/50 transition-colors">
              <input
                type="checkbox"
                checked={consented}
                onChange={(e) => setConsented(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-amber-400 text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <span className="text-sm font-semibold text-amber-900">
                I agree and consent to sign this agreement electronically.
              </span>
            </label>
          </div>

          {/* Signature Pad */}
          <div className={cn(
            'transition-opacity',
            !consented && 'opacity-50 pointer-events-none'
          )}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Your Signature {!consented && <span className="text-xs font-normal text-gray-400 ml-2">(consent required first)</span>}
            </label>
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => setMode('type')}
                disabled={!consented}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  mode === 'type'
                    ? 'bg-[#003964] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                <Type className="h-4 w-4" />
                Type
              </button>
              <button
                type="button"
                onClick={() => setMode('draw')}
                disabled={!consented}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  mode === 'draw'
                    ? 'bg-[#003964] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                <Pen className="h-4 w-4" />
                Draw
              </button>
            </div>

            {mode === 'draw' ? (
              <div className="relative">
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
                  <SignatureCanvas
                    ref={sigCanvasRef}
                    canvasProps={{
                      className: 'w-full h-[200px]',
                      style: { width: '100%', height: '200px' },
                    }}
                    penColor="#1a202c"
                    dotSize={2}
                    minWidth={1.5}
                    maxWidth={3}
                  />
                </div>
                <button
                  type="button"
                  onClick={clearSignature}
                  disabled={!consented}
                  className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <Eraser className="h-3 w-3" />
                  Clear
                </button>
                <p className="text-xs text-gray-400 mt-1.5 text-center">
                  Draw your signature above using your mouse or touchscreen
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <Input
                  value={typedSignature}
                  onChange={e => setTypedSignature(e.target.value)}
                  placeholder="Type your full name"
                />
                {typedSignature && (
                  <div className="border-2 border-gray-200 rounded-lg p-6 bg-white text-center">
                    <p className="text-3xl text-gray-800 italic" style={{ fontFamily: 'Georgia, serif' }}>
                      {typedSignature}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Legal notice */}
          <p className="text-xs text-gray-500 text-center border-t border-gray-100 pt-4">
            Clicking &ldquo;Accept &amp; Sign&rdquo; below constitutes your electronic signature and
            legally binds you to the terms of this agreement.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={handleDecline}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              Decline Proposal
            </button>

            <Button
              onClick={handleSign}
              loading={loading}
              disabled={!consented}
              size="lg"
              className="bg-green-600 hover:bg-green-700 focus:ring-green-500 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="h-4 w-4" />
              Accept &amp; Sign
            </Button>
          </div>
        </div>
      </div>

      {/* Missing Fields Modal */}
      {missingFields.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMissingFields([])}
          />
          <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl overflow-hidden">
            <div className="px-6 py-5 bg-amber-50 border-b border-amber-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-900">Missing Information</h3>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Please complete all required fields before signing.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              <p className="text-sm text-gray-700 mb-3">
                The following {missingFields.length === 1 ? 'field needs' : 'fields need'} to be filled in:
              </p>
              <ul className="space-y-2">
                {missingFields.map((field) => (
                  <li
                    key={field}
                    className="flex items-start gap-2.5 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-800"
                  >
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="font-medium">{field}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-500 mt-4">
                Scroll up to fill out the missing {missingFields.length === 1 ? 'field' : 'fields'} and try again.
              </p>
            </div>

            <div className="flex justify-end border-t border-gray-200 px-6 py-4 bg-gray-50">
              <button
                onClick={() => setMissingFields([])}
                className="rounded-lg bg-[#003964] px-5 py-2 text-sm font-semibold text-white hover:bg-[#003964]/90 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
