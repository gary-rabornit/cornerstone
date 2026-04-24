"use client"

import { useState } from 'react'
import {
  Image as ImageIcon,
  FileText,
  Type,
  Pencil,
  Trash2,
  Copy,
  Eye,
  File,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { cn } from '@/lib/utils'

interface Asset {
  id: string
  name: string
  type: string
  category: string | null
  tags: string[]
  filePath: string | null
  content: string | null
  fileSize: number | null
  mimeType: string | null
  createdAt: string
  uploadedBy: { id: string; name: string }
}

interface AssetGridProps {
  assets: Asset[]
  viewMode: 'grid' | 'list'
  onDelete: (id: string) => void
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '--'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function AssetIcon({ type, className }: { type: string; className?: string }) {
  const iconClass = cn('shrink-0', className)
  switch (type) {
    case 'IMAGE':
      return <ImageIcon className={cn(iconClass, 'text-blue-500')} />
    case 'DOCUMENT':
      return <FileText className={cn(iconClass, 'text-orange-500')} />
    case 'TEXT_BLOCK':
      return <Type className={cn(iconClass, 'text-purple-500')} />
    default:
      return <File className={cn(iconClass, 'text-gray-400')} />
  }
}

function typeBadgeColor(type: string): string {
  switch (type) {
    case 'IMAGE':
      return 'bg-blue-50 text-blue-700'
    case 'DOCUMENT':
      return 'bg-orange-50 text-orange-700'
    case 'TEXT_BLOCK':
      return 'bg-purple-50 text-purple-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

function typeLabel(type: string): string {
  switch (type) {
    case 'IMAGE':
      return 'Image'
    case 'DOCUMENT':
      return 'Document'
    case 'TEXT_BLOCK':
      return 'Text Block'
    default:
      return type
  }
}

export function AssetGrid({ assets, viewMode, onDelete }: AssetGridProps) {
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null)

  async function handleCopy(asset: Asset) {
    if (asset.type === 'TEXT_BLOCK' && asset.content) {
      await navigator.clipboard.writeText(asset.content)
    } else if (asset.filePath) {
      await navigator.clipboard.writeText(asset.filePath)
    }
  }

  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No assets found</h3>
        <p className="text-sm text-gray-500">
          Upload your first asset or adjust your search filters.
        </p>
      </div>
    )
  }

  if (viewMode === 'list') {
    return (
      <>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-4 py-3 font-medium text-gray-500">Name</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Type</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Category</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Size</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Date</th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {assets.map(asset => (
                  <tr
                    key={asset.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setPreviewAsset(asset)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <AssetIcon type={asset.type} className="h-5 w-5" />
                        <span className="font-medium text-gray-900 truncate max-w-[200px]">
                          {asset.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={typeBadgeColor(asset.type)}>
                        {typeLabel(asset.type)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {asset.category || '--'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatFileSize(asset.fileSize)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(asset.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setPreviewAsset(asset)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleCopy(asset)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                          title="Copy"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(asset.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <PreviewModal asset={previewAsset} onClose={() => setPreviewAsset(null)} />
      </>
    )
  }

  // Grid view
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {assets.map(asset => (
          <Card
            key={asset.id}
            className="group hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
            onClick={() => setPreviewAsset(asset)}
          >
            {/* Thumbnail / Icon area */}
            <div className="h-36 bg-gray-50 flex items-center justify-center relative overflow-hidden">
              {asset.type === 'IMAGE' && asset.filePath ? (
                <img
                  src={asset.filePath}
                  alt={asset.name}
                  className="h-full w-full object-cover"
                  onError={e => {
                    ;(e.target as HTMLImageElement).style.display = 'none'
                    ;(e.target as HTMLImageElement).parentElement!.classList.add('fallback-icon')
                  }}
                />
              ) : asset.type === 'DOCUMENT' && asset.filePath && asset.mimeType === 'application/pdf' ? (
                <div className="relative h-full w-full pointer-events-none bg-white">
                  <iframe
                    src={`${asset.filePath}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                    className="h-full w-full border-0"
                    title={asset.name}
                  />
                </div>
              ) : asset.type === 'TEXT_BLOCK' ? (
                <div className="px-4 py-3 w-full">
                  <p className="text-xs text-gray-500 line-clamp-5 leading-relaxed">
                    {asset.content || 'Empty text block'}
                  </p>
                </div>
              ) : (
                <AssetIcon type={asset.type} className="h-12 w-12" />
              )}

              {/* Type badge overlay */}
              <Badge className={cn('absolute top-2 right-2 text-[10px]', typeBadgeColor(asset.type))}>
                {typeLabel(asset.type)}
              </Badge>

              {/* Hover actions */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={e => { e.stopPropagation(); setPreviewAsset(asset) }}
                  className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                  title="Preview"
                >
                  <Eye className="h-4 w-4 text-gray-700" />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); handleCopy(asset) }}
                  className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                  title="Copy"
                >
                  <Copy className="h-4 w-4 text-gray-700" />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); onDelete(asset.id) }}
                  className="p-2 bg-white rounded-lg shadow-sm hover:bg-red-50 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <h3 className="text-sm font-medium text-gray-900 truncate">{asset.name}</h3>
              <div className="flex items-center gap-2 mt-1.5">
                {asset.category && (
                  <Badge className="bg-gray-100 text-gray-600 text-[10px]">
                    {asset.category}
                  </Badge>
                )}
                <span className="text-xs text-gray-400">
                  {formatDate(asset.createdAt)}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <PreviewModal asset={previewAsset} onClose={() => setPreviewAsset(null)} />
    </>
  )
}

function PreviewModal({ asset, onClose }: { asset: Asset | null; onClose: () => void }) {
  if (!asset) return null

  const isPdf = asset.mimeType === 'application/pdf'

  return (
    <Modal isOpen={!!asset} onClose={onClose} title={asset.name} size="xl">
      <div className="space-y-4">
        {/* Preview content */}
        {asset.type === 'IMAGE' && asset.filePath && (
          <div className="rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center min-h-[200px]">
            <img
              src={asset.filePath}
              alt={asset.name}
              className="max-w-full max-h-[70vh] object-contain"
            />
          </div>
        )}
        {asset.type === 'DOCUMENT' && asset.filePath && isPdf && (
          <div className="rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
            <iframe
              src={`${asset.filePath}#toolbar=1&navpanes=0&view=FitH`}
              className="w-full border-0"
              style={{ height: '70vh', minHeight: '500px' }}
              title={asset.name}
            />
            <div className="px-4 py-2 bg-white border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
              <span>{formatFileSize(asset.fileSize)}</span>
              <a
                href={asset.filePath}
                download
                className="text-[#00CFF8] hover:underline font-medium"
              >
                Download original
              </a>
            </div>
          </div>
        )}
        {asset.type === 'DOCUMENT' && asset.filePath && !isPdf && (
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <FileText className="h-10 w-10 text-orange-500" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">{asset.name}</p>
              <p className="text-sm text-gray-500">{formatFileSize(asset.fileSize)}</p>
            </div>
            <a
              href={asset.filePath}
              download
              className="text-sm text-[#00CFF8] hover:underline font-medium"
            >
              Download
            </a>
          </div>
        )}
        {asset.type === 'TEXT_BLOCK' && (
          <div className="p-4 bg-gray-50 rounded-lg max-h-[70vh] overflow-y-auto">
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {asset.content || 'No content'}
            </p>
          </div>
        )}

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Type</span>
            <p className="font-medium text-gray-900">{typeLabel(asset.type)}</p>
          </div>
          <div>
            <span className="text-gray-500">Category</span>
            <p className="font-medium text-gray-900">{asset.category || '--'}</p>
          </div>
          <div>
            <span className="text-gray-500">Uploaded by</span>
            <p className="font-medium text-gray-900">{asset.uploadedBy.name}</p>
          </div>
          <div>
            <span className="text-gray-500">Date</span>
            <p className="font-medium text-gray-900">{formatDate(asset.createdAt)}</p>
          </div>
          {asset.tags.length > 0 && (
            <div className="col-span-2">
              <span className="text-gray-500">Tags</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {asset.tags.map(tag => (
                  <Badge key={tag} className="bg-gray-100 text-gray-600">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
