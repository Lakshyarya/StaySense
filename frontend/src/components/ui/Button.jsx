/* ─────────────────────────────────────────────
   Button
   Props:
     variant  — 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
     size     — 'sm' | 'md' | 'lg'
     disabled — boolean
     loading  — boolean (shows spinner, blocks clicks)
     fullWidth— boolean
     onClick  — handler
     type     — 'button' | 'submit' | 'reset'
───────────────────────────────────────────── */

const VARIANTS = {
  primary: `
    bg-primary-500 text-white
    hover:bg-primary-600 active:bg-primary-700
    focus-visible:ring-primary-500
    shadow-sm hover:shadow-md hover:shadow-primary-500/20
    hover:-translate-y-px
  `,
  secondary: `
    bg-sage text-primary-900
    hover:bg-primary-300 active:bg-primary-400
    focus-visible:ring-sage
  `,
  outline: `
    border-2 border-primary-500
    text-primary-600 dark:text-sage
    hover:bg-primary-50 dark:hover:bg-primary-900/30
    active:bg-primary-100 dark:active:bg-primary-900/50
    focus-visible:ring-primary-500
  `,
  ghost: `
    text-primary-600 dark:text-sage
    hover:bg-primary-50 dark:hover:bg-primary-900/30
    active:bg-primary-100
    focus-visible:ring-primary-500
  `,
  danger: `
    bg-red-500 text-white
    hover:bg-red-600 active:bg-red-700
    focus-visible:ring-red-500
    shadow-sm hover:shadow-md
  `,
}

const SIZES = {
  sm: 'text-xs  px-3   py-1.5 rounded-lg  gap-1.5',
  md: 'text-sm  px-5   py-2.5 rounded-xl  gap-2',
  lg: 'text-base px-7  py-3.5 rounded-xl  gap-2.5',
}

export default function Button({
  variant   = 'primary',
  size      = 'md',
  disabled  = false,
  loading   = false,
  fullWidth = false,
  children,
  onClick,
  type      = 'button',
  className = '',
  ...rest
}) {
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={loading}
      className={[
        'inline-flex items-center justify-center font-semibold select-none',
        'transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:shadow-none disabled:translate-y-0',
        VARIANTS[variant] ?? VARIANTS.primary,
        SIZES[size]       ?? SIZES.md,
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {loading && (
        <svg
          className="animate-spin flex-shrink-0 w-4 h-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
