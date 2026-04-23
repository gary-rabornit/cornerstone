'use client'

import Link from 'next/link'
import { FilePlus, Kanban, FolderOpen } from 'lucide-react'

const actions = [
  {
    label: 'New Proposal',
    description: 'Create a new sales proposal',
    href: '/proposals?new=true',
    icon: FilePlus,
    color: 'bg-[#003964]',
  },
  {
    label: 'View Pipeline',
    description: 'Manage your sales pipeline',
    href: '/pipeline',
    icon: Kanban,
    color: 'bg-[#625AED]',
  },
  {
    label: 'Content Library',
    description: 'Browse reusable content blocks',
    href: '/library',
    icon: FolderOpen,
    color: 'bg-[#00CFF8]',
  },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <Link
            key={action.href}
            href={action.href}
            className="group flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-gray-200"
          >
            <div
              className={`${action.color} flex h-12 w-12 shrink-0 items-center justify-center rounded-lg`}
            >
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-[#1A202C] group-hover:text-[#003964] transition-colors">
                {action.label}
              </p>
              <p className="text-sm text-gray-500">{action.description}</p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
