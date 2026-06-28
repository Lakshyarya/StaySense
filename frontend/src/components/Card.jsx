import { ArrowRight, Users, Bed } from 'lucide-react'

/* ─────────────────────────────────────────────
   Card — three variants:
   • "room"    — room listing card (default)
   • "review"  — guest testimonial card
   • "feature" — icon + text feature callout
───────────────────────────────────────────── */
export default function Card({
  /* shared */
  variant    = 'room',
  title      = '',
  description= '',
  badge      = '',
  className  = '',
  /* room */
  image      = '',
  capacity   = '',
  bedConfig  = '',
  price      = null,
  amenities  = [],
  status     = 'available',
  ctaLabel   = 'View Details',
  onCtaClick = undefined,
  /* review */
  reviewer   = '',
  source     = '',
  /* feature */
  icon       = null,
}) {

  /* ── REVIEW variant ── */
  if (variant === 'review') {
    return (
      <article
        className={`bg-white dark:bg-gray-900/80 rounded-2xl p-6
                    border border-gray-100 dark:border-gray-800
                    shadow-sm hover:shadow-md transition-shadow duration-200
                    ${className}`}
      >
        {/* Stars */}
        <div className="flex gap-0.5 mb-4" aria-label="5 out of 5 stars">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} className="w-4 h-4 fill-teak text-teak" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>

        <blockquote className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed italic mb-5">
          "{description}"
        </blockquote>

        <footer className="flex items-center gap-3">
          {/* Avatar initial */}
          <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/50
                          flex items-center justify-center
                          text-primary-700 dark:text-sage font-semibold text-sm flex-shrink-0">
            {(title || reviewer)[0]?.toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white leading-none mb-0.5">
              {title || reviewer}
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500">
              {source || capacity}
            </div>
          </div>
        </footer>
      </article>
    )
  }

  /* ── FEATURE variant ── */
  if (variant === 'feature') {
    return (
      <div
        className={`flex items-start gap-4 p-5 rounded-2xl
                    bg-white dark:bg-gray-900/80
                    border border-gray-100 dark:border-gray-800
                    hover:border-primary-200 dark:hover:border-primary-800/60
                    transition-all duration-200 group
                    ${className}`}
      >
        {icon && (
          <div className="w-11 h-11 flex-shrink-0 rounded-xl
                          bg-primary-50 dark:bg-primary-900/40
                          flex items-center justify-center
                          text-primary-500 dark:text-sage
                          group-hover:bg-primary-100 dark:group-hover:bg-primary-900/60
                          transition-colors duration-200">
            {icon}
          </div>
        )}
        <div>
          <h3 className="font-display font-semibold text-gray-900 dark:text-white text-base mb-1 leading-snug">
            {title}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    )
  }

  /* ── ROOM variant (default) ── */
  const statusConfig = {
    available: {
      label: 'Available',
      cls:   'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
    limited: {
      label: 'Limited Availability',
      cls:   'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    },
    booked: {
      label: 'Fully Booked',
      cls:   'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    },
  }
  const s = statusConfig[status] ?? statusConfig.available

  return (
    <article
      className={`bg-white dark:bg-gray-900/80 rounded-2xl overflow-hidden
                  border border-gray-100 dark:border-gray-800
                  shadow-sm hover:shadow-xl hover:-translate-y-1.5
                  transition-all duration-300 group
                  ${className}`}
    >
      {/* Image */}
      <div className="relative h-52 sm:h-56 overflow-hidden bg-gray-100 dark:bg-gray-800">
        {image ? (
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Bed className="w-12 h-12 text-gray-300 dark:text-gray-600" />
          </div>
        )}
        {/* Status badge */}
        <span className={`absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-full ${s.cls}`}>
          {s.label}
        </span>
        {/* Price badge */}
        {price != null && (
          <span className="absolute top-3 right-3
                           bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm
                           text-gray-900 dark:text-white
                           text-sm font-bold px-3 py-1 rounded-full">
            ₹{price.toLocaleString('en-IN')}
            <span className="text-[11px] font-normal text-gray-400"> /night</span>
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        {badge && (
          <span className="inline-block text-[11px] font-semibold text-teak uppercase tracking-wider mb-2">
            {badge}
          </span>
        )}

        <h3 className="font-display font-semibold text-gray-900 dark:text-white text-lg leading-snug mb-2">
          {title}
        </h3>

        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed line-clamp-2 mb-4">
          {description}
        </p>

        {/* Specs row */}
        {(capacity || bedConfig) && (
          <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500 mb-4">
            {capacity && (
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {capacity}
              </span>
            )}
            {bedConfig && (
              <span className="flex items-center gap-1.5">
                <Bed className="w-3.5 h-3.5" />
                {bedConfig}
              </span>
            )}
          </div>
        )}

        {/* Amenity chips */}
        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {amenities.slice(0, 3).map(a => (
              <span
                key={a}
                className="text-[11px] px-2.5 py-0.5 rounded-full
                           bg-primary-50 dark:bg-primary-900/30
                           text-primary-700 dark:text-primary-300"
              >
                {a}
              </span>
            ))}
            {amenities.length > 3 && (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full
                               bg-gray-100 dark:bg-gray-800
                               text-gray-400 dark:text-gray-500">
                +{amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={status !== 'booked' ? onCtaClick : undefined}
          disabled={status === 'booked'}
          aria-label={`${ctaLabel} — ${title}`}
          className="w-full flex items-center justify-center gap-1.5 text-sm font-semibold
                     text-primary-600 dark:text-sage
                     hover:text-primary-700 dark:hover:text-green-300
                     disabled:text-gray-300 dark:disabled:text-gray-600
                     disabled:cursor-not-allowed
                     transition-colors duration-200 group/cta py-1"
        >
          {status === 'booked' ? 'Currently Unavailable' : ctaLabel}
          {status !== 'booked' && (
            <ArrowRight className="w-4 h-4 group-hover/cta:translate-x-1 transition-transform duration-200" />
          )}
        </button>
      </div>
    </article>
  )
}
