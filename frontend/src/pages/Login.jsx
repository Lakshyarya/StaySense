import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Leaf, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button, Input, toast } from '../components/ui'

export default function Login() {
  const navigate  = useNavigate()
  const { login } = useAuth()

  const [form,      setForm]      = useState({ username: '', password: '' })
  const [showPwd,   setShowPwd]   = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [errors,    setErrors]    = useState({})

  const set = field => e => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors(er => ({ ...er, [field]: '' }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = {}
    if (!form.username.trim()) errs.username = 'Username is required.'
    if (!form.password)        errs.password = 'Password is required.'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    await new Promise(r => setTimeout(r, 600)) // simulate latency
    const result = login(form.username.trim(), form.password)
    setLoading(false)

    if (result.ok) {
      toast.success('Welcome back!')
      navigate('/staff/dashboard', { replace: true })
    } else {
      toast.error(result.error)
      setErrors({ password: result.error })
    }
  }

  return (
    <div className="min-h-screen flex bg-mist dark:bg-void">

      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] flex-shrink-0 flex-col
                      bg-gray-950 dark:bg-void-surface relative overflow-hidden">
        {/* Background */}
        <img
          src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=900&q=80&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-12 py-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-500 dark:bg-cyan rounded-full flex items-center justify-center">
              <Leaf className="w-4.5 h-4.5 text-white dark:text-void" />
            </div>
            <span className="font-display font-bold text-xl text-white">Stay Sense</span>
          </div>

          {/* Copy */}
          <div className="mt-auto pb-4">
            <h2 className="font-display font-bold text-4xl text-white leading-tight mb-4">
              Staff portal for<br />
              <span className="text-sage italic">Trishul Eco-Homestays</span>
            </h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Manage reviews, classify guest feedback, and update accommodation listings —
              all in one place.
            </p>
          </div>
        </div>
      </div>

      {/* ── Right auth card ── */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-gray-900 dark:text-white">Stay Sense</span>
          </div>

          <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-1">
            Staff sign-in
          </h1>
          <p className="text-sm text-gray-500 dark:text-void-muted mb-8">
            Access the staff dashboard and tools.
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              label="Username"
              id="username"
              type="text"
              placeholder="staff"
              value={form.username}
              onChange={set('username')}
              error={errors.username}
              required
              autoComplete="username"
              autoFocus
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full rounded-xl border px-4 py-3 pr-11 text-sm
                              bg-white dark:bg-void-surface
                              text-gray-900 dark:text-white
                              placeholder:text-gray-400 dark:placeholder:text-gray-600
                              transition-all duration-200
                              focus:outline-none focus:ring-2 focus:ring-offset-0
                              ${errors.password
                                ? 'border-red-400 focus:ring-red-400/25'
                                : 'border-gray-200 dark:border-void-border focus:ring-primary-500/25 focus:border-primary-400'}`}
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1.5">{errors.password}</p>}
            </div>

            {/* Demo hint */}
            <div className="text-xs text-gray-400 dark:text-void-muted bg-gray-50 dark:bg-void-card
                            rounded-xl px-4 py-3 border border-gray-100 dark:border-void-border">
              Demo: <code className="text-primary-500 dark:text-cyan">staff</code> / <code className="text-primary-500 dark:text-cyan">staySense2026</code>
            </div>

            <Button type="submit" variant="primary" fullWidth loading={loading} className="!rounded-xl !py-3 mt-2">
              Sign In
            </Button>
          </form>

          <p className="text-center text-xs text-gray-400 dark:text-void-muted mt-6">
            <Link to="/" className="hover:text-primary-500 dark:hover:text-cyan transition-colors">
              ← Back to site
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
