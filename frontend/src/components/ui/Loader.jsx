/* ─────────────────────────────────────────────
   Loader  — three named exports + one default

   Named:
     <Spinner />      — animated ring, sizes: sm/md/lg/xl
     <SkeletonLine /> — single shimmer line (use className to size)
     <SkeletonCard /> — full room-card shaped skeleton

   Default:
     <Loader />       — centered spinner + optional message
                        (used for page/section loading states)
───────────────────────────────────────────── */

/* ── Spinner ── */
export function Spinner({ size = 'md', className = '' }) {
  const ring = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-[3px]',
    xl: 'w-16 h-16 border-4',
  }

  return (
    <div
      role="status"
      aria-label="Loading"
      className={[
        'rounded-full animate-spin',
        'border-primary-200 dark:border-primary-900',
        'border-t-primary-500 dark:border-t-sage',
        ring[size] ?? ring.md,
        className,
      ].join(' ')}
    />
  )
}

/* ── SkeletonLine ── */
export function SkeletonLine({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={[
        'rounded-lg shimmer-bg',
        className,
      ].join(' ')}
    />
  )
}

/* ── SkeletonCard ── */
export function SkeletonCard({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={[
        'bg-white dark:bg-gray-900 rounded-2xl overflow-hidden',
        'border border-gray-100 dark:border-gray-800',
        className,
      ].join(' ')}
    >
      {/* Image placeholder */}
      <div className="h-52 shimmer-bg" />

      {/* Content placeholders */}
      <div className="p-5 space-y-3">
        <SkeletonLine className="h-3 w-16" />
        <SkeletonLine className="h-5 w-3/4" />
        <SkeletonLine className="h-4 w-full" />
        <SkeletonLine className="h-4 w-5/6" />
        <div className="flex gap-2 pt-1">
          <SkeletonLine className="h-6 w-20 rounded-full" />
          <SkeletonLine className="h-6 w-20 rounded-full" />
        </div>
        <SkeletonLine className="h-8 w-full rounded-lg mt-2" />
      </div>
    </div>
  )
}

/* ── Default: full Loader ── */
export default function Loader({ message = 'Loading…', className = '' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className={[
        'flex flex-col items-center justify-center gap-4 py-20',
        className,
      ].join(' ')}
    >
      <Spinner size="lg" />
      {message && (
        <p className="text-sm text-gray-400 dark:text-gray-500 animate-pulse select-none">
          {message}
        </p>
      )}
    </div>
  )
}
