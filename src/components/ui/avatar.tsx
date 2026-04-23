import { cn } from "@/lib/utils"
import { getInitials } from "@/lib/utils"

const sizeStyles = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
}

interface AvatarProps {
  name: string
  src?: string | null
  size?: keyof typeof sizeStyles
  className?: string
}

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          "rounded-full object-cover",
          sizeStyles[size],
          className
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        "rounded-full bg-[#625AED] flex items-center justify-center text-white font-semibold",
        sizeStyles[size],
        className
      )}
      title={name}
    >
      {getInitials(name)}
    </div>
  )
}
