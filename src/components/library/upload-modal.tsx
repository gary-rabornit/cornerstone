"use client"

import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react'
import { Upload, FileText, Type, X, AlertCircle, CheckCircle } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif']
const ACCEPTED_DOC_TYPES = ['application/pdf']
const ALL_ACCEPTED = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_DOC_TYPES]
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

type TabType = 'file' | 'text'

export function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('file')
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Shared fields
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')

  // Text block fields
  const [textContent, setTextContent] = useState('')

  function resetForm() {
    setSelectedFile(null)
    setFileError(null)
    setName('')
    setCategory('')
    setTags('')
    setTextContent('')
    setUploadProgress(0)
    setUploading(false)
  }

  function handleClose() {
    resetForm()
    onClose()
  }

  function validateFile(file: File): string | null {
    if (!ALL_ACCEPTED.includes(file.type)) {
      return 'Invalid file type. Accepted: JPG, PNG, SVG, GIF, PDF'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size exceeds 10MB limit'
    }
    return null
  }

  function handleFileSelect(file: File) {
    const error = validateFile(file)
    if (error) {
      setFileError(error)
      setSelectedFile(null)
      return
    }
    setFileError(null)
    setSelectedFile(file)
    if (!name) {
      setName(file.name.replace(/\.[^/.]+$/, ''))
    }
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleDrag = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }, [name])

  async function handleSubmitFile() {
    if (!selectedFile || !name.trim()) return
    setUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('name', name.trim())
    if (category.trim()) formData.append('category', category.trim())
    if (tags.trim()) formData.append('tags', tags.trim())

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90))
    }, 200)

    try {
      const res = await fetch('/api/library', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Upload failed')
      }

      setUploadProgress(100)
      setTimeout(() => {
        resetForm()
        onSuccess()
      }, 500)
    } catch (err) {
      clearInterval(progressInterval)
      setFileError(err instanceof Error ? err.message : 'Upload failed')
      setUploading(false)
      setUploadProgress(0)
    }
  }

  async function handleSubmitText() {
    if (!name.trim() || !textContent.trim()) return
    setUploading(true)

    try {
      const res = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          type: 'TEXT_BLOCK',
          content: textContent.trim(),
          category: category.trim() || undefined,
          tags: tags.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save')
      }

      resetForm()
      onSuccess()
    } catch (err) {
      setFileError(err instanceof Error ? err.message : 'Save failed')
      setUploading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload Asset" size="lg">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-5">
        <button
          onClick={() => { setActiveTab('file'); setFileError(null) }}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
            activeTab === 'file'
              ? 'border-[#00CFF8] text-[#003964]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <Upload className="h-4 w-4" />
          File Upload
        </button>
        <button
          onClick={() => { setActiveTab('text'); setFileError(null) }}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
            activeTab === 'text'
              ? 'border-[#00CFF8] text-[#003964]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <Type className="h-4 w-4" />
          Text Block
        </button>
      </div>

      {/* Error */}
      {fileError && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {fileError}
        </div>
      )}

      {activeTab === 'file' ? (
        <div className="space-y-4">
          {/* Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
              dragActive
                ? 'border-[#00CFF8] bg-[#00CFF8]/5'
                : selectedFile
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.svg,.gif,.pdf"
              onChange={handleInputChange}
              className="hidden"
            />
            {selectedFile ? (
              <div className="flex items-center justify-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); setSelectedFile(null); setName('') }}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium text-[#003964]">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-400">
                  JPG, PNG, SVG, GIF, or PDF (max 10MB)
                </p>
              </>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00CFF8] rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Fields */}
          <Input
            label="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Asset name"
          />
          <Input
            label="Category"
            value={category}
            onChange={e => setCategory(e.target.value)}
            placeholder="e.g. Branding, Case Studies"
          />
          <Input
            label="Tags"
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="Comma-separated tags"
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitFile}
              loading={uploading}
              disabled={!selectedFile || !name.trim()}
            >
              Upload
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Text block name"
          />
          <Input
            label="Category"
            value={category}
            onChange={e => setCategory(e.target.value)}
            placeholder="e.g. Boilerplate, Terms"
          />
          <Input
            label="Tags"
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="Comma-separated tags"
          />
          <Textarea
            label="Content"
            value={textContent}
            onChange={e => setTextContent(e.target.value)}
            placeholder="Write your reusable text content here..."
            className="min-h-[180px]"
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitText}
              loading={uploading}
              disabled={!name.trim() || !textContent.trim()}
            >
              Save Text Block
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
