"use client"

import { useState, useMemo } from 'react'
import { Plus, Search, LayoutGrid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AssetGrid } from '@/components/library/asset-grid'
import { UploadModal } from '@/components/library/upload-modal'
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
  uploadedById: string
  createdAt: string
  uploadedBy: { id: string; name: string }
}

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'IMAGE', label: 'Images' },
  { key: 'DOCUMENT', label: 'Documents' },
  { key: 'TEXT_BLOCK', label: 'Text Blocks' },
] as const

type FilterTab = typeof FILTER_TABS[number]['key']

export function ContentLibraryClient({ assets: initialAssets }: { assets: Asset[] }) {
  const [assets, setAssets] = useState(initialAssets)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)

  const filteredAssets = useMemo(() => {
    let filtered = assets
    if (activeFilter !== 'all') {
      filtered = filtered.filter(a => a.type === activeFilter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(q) ||
        (a.category?.toLowerCase().includes(q)) ||
        a.tags.some(t => t.toLowerCase().includes(q))
      )
    }
    return filtered
  }, [assets, activeFilter, searchQuery])

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this asset?')) return
    const res = await fetch(`/api/library/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setAssets(prev => prev.filter(a => a.id !== id))
    }
  }

  function handleUploadSuccess() {
    setUploadOpen(false)
    window.location.reload()
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Library</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your images, documents, and reusable text blocks
          </p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Plus className="h-4 w-4" />
          Upload Asset
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                activeFilter === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="w-64">
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                viewMode === 'grid'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-400 hover:text-gray-600'
              )}
              title="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                viewMode === 'list'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-400 hover:text-gray-600'
              )}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Asset Grid */}
      <AssetGrid
        assets={filteredAssets}
        viewMode={viewMode}
        onDelete={handleDelete}
      />

      {/* Upload Modal */}
      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </>
  )
}
