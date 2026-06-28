import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

/* ─────────────────────────────────────────────
   Modal
   Props:
     isOpen    — boolean
     onClose   — () => void
     title     — string
     children  — ReactNode
     size      — 'sm' | 'md' | 'lg' | 'xl'
     className — extra classes on the panel
   Behaviour:
     • Traps focus within the dialog
     • Closes on Escape key
     • Closes on backdrop click
     • Locks body scroll while open
     • Restores focus to the trigger element on close
───────────────────────────────────────────── */

const SIZE_MAP = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])'

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size      = 'md',
  className = '',
}) {
  const panelRef  = useRef(null)
  const triggerRef = useRef(null) // remembers what had focus before modal opened

  /* ── Body scroll lock + focus restore ── */
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      // Small delay so the element is re-visible before we try to focus it
      const t = setTimeout(() => triggerRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  /* ── Focus trap + Escape ── */
  useEffect(() => {
    if (!isOpen) return

    const panel = panelRef.current
    if (!panel) return

    // Move focus inside on open
    const getFocusable = () => [...panel.querySelectorAll(FOCUSABLE)]
    const t = setTimeout(() => getFocusable()[0]?.focus(), 60)

    const onKey = (e) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return

      const focusable = getFocusable()
      if (focusable.length === 0) { e.preventDefault(); return }

      const first = focusable[0]
      const last  = focusable[focusable.length - 1]
      const active = document.activeElement

      if (e.shiftKey) {
        // Shift+Tab: wrap from first → last
        if (active === first || !panel.contains(active)) {
          e.preventDefault()
          last.focus()
        }
      } else {
        // Tab: wrap from last → first
        if (active === last || !panel.contains(active)) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      clearTimeout(t)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    /* ── Portal-like full-screen container ── */
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={[
          'relative w-full',
          SIZE_MAP[size] ?? SIZE_MAP.md,
          'bg-white dark:bg-gray-900',
          'rounded-2xl shadow-2xl',
          'flex flex-col max-h-[90vh]',
          'animate-slide-up',
          className,
        ].join(' ')}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5
                        border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <h2
            id="modal-title"
            className="font-display font-semibold text-xl text-gray-900 dark:text-white pr-4"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-lg flex-shrink-0
                       text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
                       hover:bg-gray-100 dark:hover:bg-gray-800
                       transition-colors duration-150"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="px-6 py-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}
