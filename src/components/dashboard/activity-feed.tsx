import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { getInitials } from '@/lib/utils'

interface ActivityItem {
  id: string
  type: string
  description: string
  createdAt: string | Date
  deal: {
    id: string
    companyName: string
  }
  user: {
    id: string
    name: string
    avatar: string | null
  }
}

interface ActivityFeedProps {
  activities: ActivityItem[]
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-[#1A202C]">Recent Activity</h3>
        <p className="text-sm text-gray-500">No recent activity to display.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="mb-5 text-lg font-semibold text-[#1A202C]">Recent Activity</h3>
      <div className="space-y-4">
        {activities.slice(0, 10).map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#625AED]/10 text-xs font-semibold text-[#625AED]">
              {getInitials(activity.user.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-[#1A202C]">
                <span className="font-medium">{activity.user.name}</span>{' '}
                {activity.description}
              </p>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                <Link
                  href={`/deals/${activity.deal.id}`}
                  className="font-medium text-[#003964] hover:underline"
                >
                  {activity.deal.companyName}
                </Link>
                <span>&middot;</span>
                <span>
                  {formatDistanceToNow(new Date(activity.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
