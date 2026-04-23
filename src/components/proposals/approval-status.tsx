import { cn } from '@/lib/utils'
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'

interface Approval {
  id: string
  approverId: string
  status: string
  comments: string | null
  respondedAt: string | null
  approver: {
    id: string
    name: string
    email: string
  }
}

interface ApprovalStatusProps {
  approvals: Approval[]
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: typeof CheckCircle }
> = {
  APPROVED: {
    label: 'Approved',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle,
  },
  REJECTED: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-700',
    icon: XCircle,
  },
  PENDING: {
    label: 'Pending',
    color: 'bg-amber-100 text-amber-700',
    icon: Clock,
  },
  CHANGES_REQUESTED: {
    label: 'Changes Requested',
    color: 'bg-orange-100 text-orange-700',
    icon: AlertTriangle,
  },
}

export function ApprovalStatus({ approvals }: ApprovalStatusProps) {
  if (!approvals || approvals.length === 0) return null

  const approved = approvals.filter((a) => a.status === 'APPROVED').length
  const total = approvals.length

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#003964]">Approval Status</h3>
        <span className="text-xs font-medium text-gray-500">
          {approved} of {total} approved
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-green-500 transition-all duration-300"
          style={{ width: `${total > 0 ? (approved / total) * 100 : 0}%` }}
        />
      </div>

      {/* Approver list */}
      <div className="space-y-3">
        {approvals.map((approval) => {
          const config = STATUS_CONFIG[approval.status] || STATUS_CONFIG.PENDING
          const Icon = config.icon
          return (
            <div
              key={approval.id}
              className="flex items-start gap-3 rounded-lg border border-gray-100 px-4 py-3"
            >
              <Icon
                className={cn(
                  'h-5 w-5 mt-0.5 shrink-0',
                  approval.status === 'APPROVED' && 'text-green-600',
                  approval.status === 'REJECTED' && 'text-red-600',
                  approval.status === 'PENDING' && 'text-amber-500',
                  approval.status === 'CHANGES_REQUESTED' && 'text-orange-500'
                )}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {approval.approver.name}
                  </span>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      config.color
                    )}
                  >
                    {config.label}
                  </span>
                </div>
                {approval.comments && (
                  <p className="text-sm text-gray-600 mt-1">{approval.comments}</p>
                )}
                {approval.respondedAt && (
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(approval.respondedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
