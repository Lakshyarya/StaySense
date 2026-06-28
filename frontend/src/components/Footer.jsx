import { Link } from 'react-router-dom'
import { Leaf, Phone, Mail, Instagram, Facebook } from 'lucide-react'

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
)

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-gray-950 dark:bg-void text-white border-t border-white/5" aria-label="Site footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-500 dark:bg-cyan rounded-full flex items-center justify-center flex-shrink-0">
              <Leaf className="w-4 h-4 text-white dark:text-void" />
            </div>
            <div>
              <p className="font-display font-bold text-base text-white leading-none">Stay Sense</p>
              <p className="text-xs text-white/40 mt-0.5">Trishul Eco-Homestays · Uttarakhand</p>
            </div>
          </div>

          {/* Quick links */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              { to: '/',        label: 'Home' },
              { to: '/reviews', label: 'Reviews' },
              { to: '/enquiry', label: 'Book Direct' },
              { to: '/about',   label: 'About' },
            ].map(({ to, label }) => (
              <Link key={label} to={to}
                className="text-xs text-white/50 hover:text-white transition-colors duration-150">
                {label}
              </Link>
            ))}
          </nav>

          {/* Contact & Social */}
          <div className="flex items-center gap-4">
            <a href="tel:+919876543210" className="text-white/50 hover:text-white transition-colors" aria-label="Phone">
              <Phone className="w-4 h-4" />
            </a>
            <a href="mailto:hello@trishulhomestay.in" className="text-white/50 hover:text-white transition-colors" aria-label="Email">
              <Mail className="w-4 h-4" />
            </a>
            <a href="#" className="text-white/50 hover:text-white transition-colors" aria-label="Instagram">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className="text-white/50 hover:text-white transition-colors" aria-label="Facebook">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="https://wa.me/919876543210" className="text-white/50 hover:text-white transition-colors" aria-label="WhatsApp">
              <WhatsAppIcon />
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-white/30">© {year} Trishul Eco-Homestays</p>
          <Link to="/login" className="text-[11px] text-white/20 hover:text-white/50 transition-colors">
            Staff Login
          </Link>
        </div>
      </div>
    </footer>
  )
}
