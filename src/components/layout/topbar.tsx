"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { SearchCommand } from "@/components/layout/search-command"

export function Topbar() {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <header className="topbar h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
        {/* Left: spacer for mobile hamburger + page title area */}
        <div className="flex items-center gap-4 lg:gap-0">
          <div className="w-8 lg:hidden" /> {/* spacer for hamburger */}
        </div>

        {/* Right: search + notifications */}
        <div className="flex items-center gap-4">
          {/* Search trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 hover:bg-gray-200 transition-colors"
          >
            <Search className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400 w-48 text-left">Search...</span>
            <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-white border border-gray-200 rounded">
              &#8984;K
            </kbd>
          </button>

          {/* Notifications */}
          <NotificationBell />
        </div>
      </header>

      {/* Search Command Palette */}
      <SearchCommand />
    </>
  )
}
