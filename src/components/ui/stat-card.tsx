import { type ReactNode } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  icon: ReactNode
  iconBgColor?: string
  label: string
  value: string | number
  trend?: {
    value: number
    direction: "up" | "down"
  }
  className?: string
}

export function StatCard({
  icon,
  iconBgColor = "bg-[#00CFF8]/10",
  label,
  value,
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-sm border border-gray-200 p-5",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex items-center justify-center h-10 w-10 rounded-lg",
            iconBgColor
          )}
        >
          {icon}
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trend.direction === "up" ? "text-green-600" : "text-red-600"
            )}
          >
            {trend.direction === "up" ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            {trend.value}%
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  )
}
