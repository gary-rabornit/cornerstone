import { formatDistanceToNow } from 'date-fns'
import { getInitials } from '@/lib/utils'
import {
  ArrowRightLeft,
  FileText,
  Plus,
  Send,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Activity,
} from 'lucide-react'

interface TimelineActivity {
  id: string
  type: string
  description: string
  createdAt: string | Date
  user: {
    id: string
    name: string
    avatar: string | null
  }
}

interface ActivityTimelineProps {
  activities: TimelineActivity[]
}

const typeConfig: Record<string, { icon: typeof Activity; color: string; bg: string }> = {
  STAGE_CHANGE: { icon: ArrowRightLeft, color: 'text-[#003964]', bg: 'bg-[#003964]/10' },
  DEAL_CREATED: { icon: Plus, color: 'text-green-600', bg: 'bg-green-100' },
  PROPOSAL_CREATED: { icon: FileText, color: 'text-[#625AED]', bg: 'bg-[#625AED]/10' },
  PROPOSAL_SENT: { icon: Send, color: 'text-[#00CFF8]', bg: 'bg-[#00CFF8]/10' },
  PROPOSAL_APPROVED: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
  PROPOSAL_REJECTED: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
  NOTE_ADDED: { icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-100' },
}

const defaultConfig = { icon: Activity, color: 'text-gray-500', bg: 'bg-gray-100' }

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="mb-5 text-lg font-semibold text-[#1A202C]">Activity</h3>

      {activities.length === 0 ? (
        <p className="text-sm text-gray-500">No activity recorded yet.</p>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[17px] top-2 bottom-2 w-px bg-gray-200" />

          <div className="space-y-5">
            {activities.map((activity) => {
              const config = typeConfig[activity.type] || defaultConfig
              const Icon = config.icon

              return (
                <div key={activity.id} className="relative flex gap-3.5">
                  <div
                    className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${config.bg}`}
                  >
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div className="min-w-0 pt-1">
                    <p className="text-sm text-[#1A202C]">{activity.description}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                      <span className="font-medium">{activity.user.name}</span>
                      <span>&middot;</span>
                      <span>
                        {formatDistanceToNow(new Date(activity.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
