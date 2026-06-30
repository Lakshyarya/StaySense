import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Sparkles, Star, BedDouble,
  LogOut, Leaf, Menu, X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  { path: '/staff/dashboard',     label: 'Dashboard',     Icon: LayoutDashboard },
  { path: '/staff/classifier',    label: 'Classifier',    Icon: Sparkles },
  { path: '/staff/reviews',       label: 'Reviews',       Icon: Star },
  { path: '/staff/accommodation', label: 'Accommodation', Icon: BedDouble },
]

export default function StaffLayout({ children, title }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  /* Close mobile drawer on route change */
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  /* Lock body scroll while drawer open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const SidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between gap-2.5 px-5 py-5
                      border-b border-gray-100 dark:border-void-border flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 bg-primary-500 dark:bg-cyan rounded-full flex items-center justify-center flex-shrink-0">
            <Leaf className="w-4 h-4 text-white dark:text-void" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-900 dark:text-white leading-none">Staff Tools</p>
            <p className="text-[10px] text-gray-400 dark:text-void-muted mt-0.5 truncate">{user?.username}</p>
          </div>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-void-card flex-shrink-0"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ path, label, Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
               ${isActive
                 ? 'bg-primary-50 dark:bg-cyan/10 text-primary-600 dark:text-cyan'
                 : 'text-gray-600 dark:text-void-muted hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'}`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-gray-100 dark:border-void-border flex-shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                     text-gray-500 dark:text-void-muted
                     hover:text-red-500 dark:hover:text-red-400
                     hover:bg-red-50 dark:hover:bg-red-500/10
                     transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-void">

      {/* ── Desktop sidebar — always visible ≥ lg ── */}
      <aside className="hidden lg:flex w-60 flex-shrink-0 flex-col
                        bg-white dark:bg-void-surface
                        border-r border-gray-200 dark:border-void-border">
        {SidebarContent}
      </aside>

      {/* ── Mobile sidebar — slide-in drawer ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside className="relative w-72 max-w-[80vw] flex flex-col
                            bg-white dark:bg-void-surface
                            border-r border-gray-200 dark:border-void-border
                            animate-slide-up h-full">
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="flex-shrink-0 flex items-center gap-3 px-4 sm:px-8 py-4 sm:py-5
                           border-b border-gray-200 dark:border-void-border
                           bg-white dark:bg-void-surface">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg text-gray-500 dark:text-void-muted
                       hover:bg-gray-100 dark:hover:bg-void-card transition-colors flex-shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          {title && (
            <h1 className="font-display font-bold text-xl sm:text-2xl text-gray-900 dark:text-white truncate">
              {title}
            </h1>
          )}
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-void">
          {children}
        </main>
      </div>
    </div>
  )
}
