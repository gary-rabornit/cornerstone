"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  X,
  Kanban,
  FileText,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchResult {
  id: string
  type: 'deal' | 'proposal'
  title: string
  subtitle: string
  status?: string
  url: string
}

export function SearchCommand() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Cmd+K to open
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setResults([])
      setSelectedIndex(0)
    }
  }, [open])

  // Search debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setSelectedIndex(0)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data.results || [])
          setSelectedIndex(0)
        }
      } catch {
        // Non-critical
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = useCallback(
    (result: SearchResult) => {
      setOpen(false)
      router.push(result.url)
    },
    [router]
  )

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault()
      handleSelect(results[selectedIndex])
    }
  }

  // Group results
  const deals = results.filter(r => r.type === 'deal')
  const proposals = results.filter(r => r.type === 'proposal')

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Command Palette */}
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-10">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 border-b border-gray-100">
          <Search className="h-5 w-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search deals, proposals..."
            className="flex-1 py-3.5 text-sm text-gray-900 placeholder-gray-400 bg-transparent border-none outline-none"
          />
          {loading && <Loader2 className="h-4 w-4 text-gray-400 animate-spin shrink-0" />}
          <button
            onClick={() => setOpen(false)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {query.trim() && !loading && results.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-500">No results found for &ldquo;{query}&rdquo;</p>
            </div>
          )}

          {!query.trim() && (
            <div className="p-6 text-center">
              <p className="text-sm text-gray-400">
                Start typing to search deals and proposals...
              </p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 border border-gray-200 rounded font-mono text-gray-500">
                  ESC
                </kbd>
                <span className="text-xs text-gray-400">to close</span>
              </div>
            </div>
          )}

          {/* Deals */}
          {deals.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">
                Deals
              </div>
              {deals.map((result, i) => {
                const globalIndex = results.indexOf(result)
                return (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setSelectedIndex(globalIndex)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                      globalIndex === selectedIndex
                        ? 'bg-[#00CFF8]/10 text-[#003964]'
                        : 'hover:bg-gray-50'
                    )}
                  >
                    <Kanban className="h-4 w-4 text-gray-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                      <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                    </div>
                    {globalIndex === selectedIndex && (
                      <ArrowRight className="h-4 w-4 text-[#00CFF8] shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* Proposals */}
          {proposals.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">
                Proposals
              </div>
              {proposals.map((result, i) => {
                const globalIndex = results.indexOf(result)
                return (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setSelectedIndex(globalIndex)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                      globalIndex === selectedIndex
                        ? 'bg-[#00CFF8]/10 text-[#003964]'
                        : 'hover:bg-gray-50'
                    )}
                  >
                    <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                      <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                    </div>
                    {globalIndex === selectedIndex && (
                      <ArrowRight className="h-4 w-4 text-[#00CFF8] shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer hint */}
        {results.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded font-mono">&uarr;</kbd>
              <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded font-mono">&darr;</kbd>
              <span>navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded font-mono">Enter</kbd>
              <span>select</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
