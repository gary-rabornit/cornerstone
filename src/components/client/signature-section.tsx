"use client"

import { useState, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Pen, Type, CheckCircle, XCircle, Loader2, Eraser } from 'lucide-react'
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
}

type SignatureMode = 'draw' | 'type'

export function SignatureSection({ token, proposalTitle }: SignatureSectionProps) {
  const [mode, setMode] = useState<SignatureMode>('draw')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [title, setTitle] = useState('')
  const [typedSignature, setTypedSignature] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<'signed' | 'declined' | null>(null)
  const [error, setError] = useState<string | null>(null)

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
      // Render typed signature on a canvas
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
    if (!fullName.trim() || !email.trim()) {
      setError('Please fill in your full name and email.')
      return
    }

    const signatureImage = getSignatureImage()
    if (!signatureImage) {
      setError(mode === 'draw' ? 'Please draw your signature.' : 'Please type your signature.')
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
          signedByTitle: title.trim() || undefined,
          signatureImage,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to sign proposal')
      }

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

  if (success === 'signed') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-green-50 border border-green-200 rounded-xl p-10 text-center">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-900 mb-2">
            Thank You!
          </h2>
          <p className="text-green-700 text-lg">
            You have successfully signed &ldquo;{proposalTitle}&rdquo;.
          </p>
          <p className="text-green-600 text-sm mt-2">
            A confirmation has been sent to your email.
          </p>
        </div>
      </div>
    )
  }

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

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 sm:px-8 py-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <h2 className="text-xl font-bold text-[#003964]">Sign This Proposal</h2>
          <p className="text-sm text-gray-500 mt-1">
            Please review the proposal above, then sign below to accept.
          </p>
        </div>

        <div className="px-6 sm:px-8 py-8 space-y-6">
          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Contact Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
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
          <Input
            label="Title / Position"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. CEO, Marketing Director"
          />

          {/* Signature Mode Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Signature
            </label>
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setMode('draw')}
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
              <button
                onClick={() => setMode('type')}
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
                  onClick={clearSignature}
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
            <button
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
              size="lg"
              className="bg-green-600 hover:bg-green-700 focus:ring-green-500 w-full sm:w-auto"
            >
              <CheckCircle className="h-4 w-4" />
              Accept &amp; Sign
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
