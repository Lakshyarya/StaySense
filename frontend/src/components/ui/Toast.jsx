/**
 * Toast — thin wrapper around react-hot-toast
 *
 * Import and use anywhere in the app:
 *   import { toast } from '@/components/ui'
 *
 *   toast.success('Booking inquiry sent!')
 *   toast.error('Something went wrong.')
 *   toast.info('Availability updated.')
 *   toast.loading('Analyzing reviews...')
 *   toast.promise(asyncFn(), { loading: '…', success: '…', error: '…' })
 *   toast.dismiss()        // dismiss all
 *   toast.dismiss(id)      // dismiss specific
 *
 * The <Toaster /> is rendered once in App.jsx, so no need to add it here.
 */
import _toast from 'react-hot-toast'

export const toast = {
  success: (msg, opts) => _toast.success(msg, opts),
  error:   (msg, opts) => _toast.error(msg, opts),
  loading: (msg, opts) => _toast.loading(msg, opts),
  info:    (msg, opts) => _toast(msg, { icon: 'ℹ️', ...opts }),
  promise: (promise, msgs, opts) => _toast.promise(promise, msgs, opts),
  dismiss: (id) => (id ? _toast.dismiss(id) : _toast.dismiss()),
}

// Also export the raw library for advanced usage
export { default as rawToast } from 'react-hot-toast'
