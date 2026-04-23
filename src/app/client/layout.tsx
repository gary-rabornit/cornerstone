import { Diamond } from 'lucide-react'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1">{children}</main>

      {/* Subtle branding footer */}
      <footer className="py-8 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-center gap-2 text-gray-400">
          <Diamond className="h-4 w-4" />
          <span className="text-xs font-medium tracking-wide">
            Powered by Cornerstone
          </span>
        </div>
      </footer>
    </div>
  )
}
