import { useState, useEffect, useMemo } from 'react'
import { Star, CheckCircle2, RefreshCw, Filter, Search } from 'lucide-react'
import StaffLayout from '../../components/staff/StaffLayout'
import { Loader, toast } from '../../components/ui'
import { reviewsApi } from '../../services/api'
import { REVIEW_THEMES, FEATURED_REVIEWS } from '../../data/reviews'

/* Single review card — read-only display */
function ReviewItem({ review }) {
  return (
    <div className="bg-white dark:bg-void-surface rounded-2xl border border-gray-100 dark:border-void-border p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-primary-50 dark:bg-cyan/10
                          flex items-center justify-center flex-shrink-0
                          text-primary-600 dark:text-cyan font-semibold text-sm">
            {review.guest?.[0] ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{review.guest}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="flex gap-0.5">
                {Array.from({ length: review.rating ?? 5 }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </span>
              <span className="text-xs text-gray-400 dark:text-void-muted">{review.source}</span>
              {review.verified && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold
                                 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Theme chips */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {(review.themes ?? []).map(t => {
          const theme = REVIEW_THEMES.find(rt => rt.id === t)
          return (
            <span key={t} className="text-[11px] px-2 py-0.5 rounded-full
                                     bg-primary-50 dark:bg-cyan/10 text-primary-700 dark:text-cyan
                                     border border-primary-100 dark:border-cyan/20">
              {theme?.label ?? t}
            </span>
          )
        })}
      </div>

      {/* Review text */}
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        "{review.text}"
      </p>
    </div>
  )
}

/* ── Page ── */
export default function StaffReviews() {
  const [reviews, setReviews]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error,   setError]     = useState(null)
  const [theme,   setTheme]     = useState('all')
  const [query,   setQuery]     = useState('')

  const fetchReviews = async () => {
    setLoading(true); setError(null)
    try {
      const data = await reviewsApi.list()
      /* Merge with any staff-published localStorage reviews (de-dup) */
      const local = JSON.parse(localStorage.getItem('staySenseFeaturedReviews') || '[]')
      const apiIds = new Set(data.map(r => r.id))
      const uniqueLocal = local.filter(r => !apiIds.has(r.id))
      setReviews([...uniqueLocal, ...data])
    } catch (err) {
      setError(err.message)
      toast.error('Could not reach server — showing cached reviews.')
      setReviews(FEATURED_REVIEWS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReviews() }, [])

  const filtered = useMemo(() => {
    let list = reviews
    if (theme !== 'all') list = list.filter(r => r.themes?.includes(theme))
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter(r =>
        r.text?.toLowerCase().includes(q) ||
        r.guest?.toLowerCase().includes(q) ||
        r.source?.toLowerCase().includes(q)
      )
    }
    return list
  }, [reviews, theme, query])

  return (
    <StaffLayout title="Reviews">
      <div className="p-6 sm:p-8 space-y-5">

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search reviews…"
              className="w-full rounded-xl border border-gray-200 dark:border-void-border
                         bg-white dark:bg-void-card text-gray-900 dark:text-white text-sm
                         pl-9 pr-3 py-2.5 placeholder:text-gray-400
                         focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400
                         transition-all duration-200"
            />
          </div>

          {/* Theme filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <button onClick={() => setTheme('all')}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors
                          ${theme === 'all'
                            ? 'bg-primary-500 dark:bg-cyan border-primary-500 dark:border-cyan text-white dark:text-void'
                            : 'border-gray-200 dark:border-void-border text-gray-500 dark:text-void-muted'}`}>
              All themes
            </button>
            {REVIEW_THEMES.map(t => (
              <button key={t.id} onClick={() => setTheme(t.id)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors
                            ${theme === t.id
                              ? 'bg-primary-500 dark:bg-cyan border-primary-500 dark:border-cyan text-white dark:text-void'
                              : 'border-gray-200 dark:border-void-border text-gray-500 dark:text-void-muted'}`}>
                {t.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-gray-400 dark:text-void-muted sm:ml-auto">
            {filtered.length} of {reviews.length} reviews
          </span>

          {error && (
            <button onClick={fetchReviews}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-500 dark:hover:text-cyan">
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          )}
        </div>

        {/* List */}
        {loading ? (
          <Loader message="Loading reviews…" />
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-void-surface rounded-2xl border border-gray-100 dark:border-void-border
                          p-12 text-center">
            <p className="font-semibold text-gray-900 dark:text-white mb-1">No reviews found</p>
            <p className="text-sm text-gray-500 dark:text-void-muted">Try a different filter or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map(review => (
              <ReviewItem key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </StaffLayout>
  )
}
