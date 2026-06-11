import { useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  message: string
  type: ToastType
  leaving: boolean
}

/** Fire-and-forget toast, callable from anywhere (mirrors the
 *  window-event pattern already used for 'transactionAdded'). */
export function toast(message: string, type: ToastType = 'success') {
  window.dispatchEvent(new CustomEvent('app:toast', { detail: { message, type } }))
}

const TOAST_STYLE: Record<ToastType, { icon: React.ReactNode; accent: string }> = {
  success: { icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />, accent: 'border-emerald-400/30' },
  error:   { icon: <AlertCircle className="h-4 w-4 text-rose-400" />,    accent: 'border-rose-400/30' },
  info:    { icon: <Info className="h-4 w-4 text-blue-400" />,           accent: 'border-blue-400/30' },
}

let nextId = 0

export default function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    const handler = (e: Event) => {
      const { message, type = 'success' } = (e as CustomEvent).detail ?? {}
      if (!message) return
      const id = ++nextId
      setToasts(prev => [...prev.slice(-2), { id, message, type, leaving: false }])
      setTimeout(() => {
        setToasts(prev => prev.map(t => (t.id === id ? { ...t, leaving: true } : t)))
      }, 2400)
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 2700)
    }
    window.addEventListener('app:toast', handler)
    return () => window.removeEventListener('app:toast', handler)
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 lg:bottom-8 z-[70] flex flex-col items-center gap-2 px-4">
      {toasts.map(t => (
        <div
          key={t.id}
          role="status"
          className={`pointer-events-auto flex items-center gap-2.5 rounded-xl border ${TOAST_STYLE[t.type].accent} bg-popover/95 px-4 py-2.5 shadow-xl backdrop-blur-md transition-all duration-300 ${
            t.leaving ? 'opacity-0 translate-y-2' : 'animate-slide-up'
          }`}
        >
          {TOAST_STYLE[t.type].icon}
          <span className="text-xs font-medium text-foreground">{t.message}</span>
        </div>
      ))}
    </div>
  )
}
