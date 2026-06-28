import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Sun, Moon, Leaf } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

/* Accommodation scrolls to #rooms — works from any page */
function AccommodationLink({ className, onClick }) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const isHome    = location.pathname === '/'
  const isActive  = isHome && false /* never mark active via NavLink — handled below */

  const handle = (e) => {
    e.preventDefault()
    onClick?.()
    if (isHome) {
      document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/')
      /* after navigation the home page mounts; scroll on next tick */
      setTimeout(() => document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' }), 120)
    }
  }

  return (
    <a href="#rooms" onClick={handle} className={className}>
      Accommodation
    </a>
  )
}

const NAV_LINKS = [
  { path: '/',        label: 'Home',    end: true },
  { path: '/reviews', label: 'Reviews', end: false },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, toggleTheme }  = useTheme()
  const location                = useLocation()
  const isHome                  = location.pathname === '/'

  useEffect(() => { setMenuOpen(false) }, [location.pathname])
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const frosted = scrolled || !isHome

  const navBg = frosted
    ? 'bg-white/95 dark:bg-void/95 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-void-border'
    : 'bg-transparent'

  const linkColor = (isActive) => {
    if (isActive) return 'text-primary-500 dark:text-cyan'
    return frosted
      ? 'text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-cyan'
      : 'text-white/90 hover:text-white'
  }

  const accomColor = frosted
    ? 'text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-cyan'
    : 'text-white/90 hover:text-white'

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center
                            group-hover:bg-primary-600 transition-colors duration-200">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className={`font-display font-bold text-xl tracking-tight transition-colors duration-200
                              ${frosted ? 'text-primary-600 dark:text-cyan' : 'text-white'}`}>
              Stay Sense
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(({ path, label, end }) => (
              <NavLink key={path} to={path} end={end}
                className={({ isActive }) =>
                  `relative text-sm font-medium transition-colors duration-200 py-1 group ${linkColor(isActive)}`
                }
              >
                {({ isActive }) => (
                  <>
                    {label}
                    <span className={`absolute -bottom-0.5 left-0 right-0 h-[2px] rounded-full
                                      bg-primary-500 dark:bg-cyan transform transition-transform duration-200 origin-left
                                      ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                  </>
                )}
              </NavLink>
            ))}
            <AccommodationLink
              className={`relative text-sm font-medium transition-colors duration-200 py-1 group ${accomColor}`}
            />
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className={`p-2 rounded-full transition-all duration-200
                          ${frosted
                            ? 'text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-cyan hover:bg-gray-100 dark:hover:bg-white/10'
                            : 'text-white/80 hover:text-white hover:bg-white/10'}`}
            >
              {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>

            <Link
              to="/enquiry"
              className="hidden md:inline-flex items-center gap-1.5
                         bg-primary-500 hover:bg-primary-600 active:bg-primary-700
                         dark:bg-cyan dark:text-void dark:hover:bg-sage
                         text-white text-sm font-semibold
                         px-5 py-2 rounded-full
                         transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-px"
            >
              Book Direct
            </Link>

            <button
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              className={`md:hidden p-2 rounded-lg transition-colors duration-200
                          ${frosted
                            ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                            : 'text-white/80 hover:bg-white/10'}`}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden
                       ${menuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
        <div className="bg-white dark:bg-void-surface border-t border-gray-100 dark:border-void-border px-4 py-4 space-y-1">
          {NAV_LINKS.map(({ path, label, end }) => (
            <NavLink key={path} to={path} end={end}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-xl text-sm font-medium transition-colors
                 ${isActive
                   ? 'bg-primary-50 dark:bg-cyan/10 text-primary-600 dark:text-cyan'
                   : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`
              }
            >
              {label}
            </NavLink>
          ))}
          <AccommodationLink
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300
                       hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          />
          <div className="pt-3 border-t border-gray-100 dark:border-void-border">
            <Link
              to="/enquiry"
              onClick={() => setMenuOpen(false)}
              className="block w-full text-center bg-primary-500 dark:bg-cyan
                         text-white dark:text-void text-sm font-semibold
                         px-4 py-3 rounded-xl transition-colors hover:bg-primary-600"
            >
              Book Direct
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
