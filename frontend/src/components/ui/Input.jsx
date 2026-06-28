import { useState } from 'react'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

/* ─────────────────────────────────────────────
   Input
   Props:
     label        — string (optional)
     id           — string (auto-derived from label if omitted)
     type         — HTML input type (default 'text')
     placeholder  — string
     value        — controlled value
     onChange     — (e) => void
     error        — string | null (shown in red below input)
     hint         — string | null (shown in grey, hidden when error present)
     required     — boolean
     disabled     — boolean
     prefix       — ReactNode (left icon / text inside input)
     suffix       — ReactNode (right icon / text inside input)
     className    — wrapper class
     inputClassName — extra classes on the <input> itself
───────────────────────────────────────────── */
export default function Input({
  label,
  id,
  type         = 'text',
  placeholder,
  value,
  onChange,
  error,
  hint,
  required     = false,
  disabled     = false,
  prefix,
  suffix,
  className    = '',
  inputClassName = '',
  ...rest
}) {
  const [showPwd, setShowPwd] = useState(false)

  // Auto-generate id from label
  const inputId     = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  const resolvedType = type === 'password'
    ? (showPwd ? 'text' : 'password')
    : type

  const hasError = Boolean(error)
  const hasRight = type === 'password' || Boolean(suffix)

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          {label}
          {required && (
            <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
          )}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative">
        {/* Left prefix */}
        {prefix && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5
                          pointer-events-none text-gray-400 text-sm">
            {prefix}
          </div>
        )}

        <input
          id={inputId}
          type={resolvedType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          className={[
            'w-full rounded-xl border bg-white dark:bg-gray-900',
            'text-gray-900 dark:text-white text-sm',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'py-3',
            prefix    ? 'pl-10' : 'pl-4',
            hasRight  ? 'pr-11' : 'pr-4',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-gray-800/60',
            hasError
              ? 'border-red-400 dark:border-red-500 focus:ring-red-400/30 focus:border-red-400'
              : 'border-gray-200 dark:border-gray-700 focus:ring-primary-500/25 focus:border-primary-400 dark:focus:border-primary-500',
            inputClassName,
          ].join(' ')}
          {...rest}
        />

        {/* Password toggle */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPwd(v => !v)}
            tabIndex={-1}
            aria-label={showPwd ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5
                       text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
                       transition-colors duration-150"
          >
            {showPwd
              ? <EyeOff className="w-4 h-4" />
              : <Eye    className="w-4 h-4" />}
          </button>
        )}

        {/* Right suffix (non-password) */}
        {suffix && type !== 'password' && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5
                          pointer-events-none text-gray-400 text-sm">
            {suffix}
          </div>
        )}
      </div>

      {/* Error message */}
      {hasError && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="flex items-start gap-1.5 mt-1.5 text-xs text-red-600 dark:text-red-400"
        >
          <AlertCircle className="w-3.5 h-3.5 mt-px flex-shrink-0" />
          {error}
        </p>
      )}

      {/* Hint (hidden when error present) */}
      {hint && !hasError && (
        <p
          id={`${inputId}-hint`}
          className="mt-1.5 text-xs text-gray-500 dark:text-gray-400"
        >
          {hint}
        </p>
      )}
    </div>
  )
}
