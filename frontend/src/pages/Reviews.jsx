import { useState, useEffect } from 'react'
import { CheckCircle2, Filter, Star, RefreshCw } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { FEATURED_REVIEWS, REVIEW_THEMES } from '../data/reviews'
import { Loader, SkeletonCard, toast } from '../components/ui'
import { reviewsApi } from '../services/api'

/* Fallback: staff-added reviews from localStorage */
function getLocalReviews() {
  try {
    return JSON.parse(localStorage.getItem('staySenseFeaturedReviews') || '[]')
  } catch {
    return []
  }
}

/* Skeleton placeholder card while loading */
function ReviewSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="space-y-2 flex-1">
          <div className="h-3 w-20 shimmer-bg rounded" />
          <div className="h-4 w-32 shimmer-bg rounded" />
          <div className="h-3 w-24 shimmer-bg rounded" />
        </div>
        <div className="h-6 w-20 shimmer-bg rounded-full" />
      </div>
      <div className="space-y-2 mb-5">
        <div className="h-3 w-full  shimmer-bg rounded" />
        <div className="h-3 w-5/6  shimmer-bg rounded" />
        <div className="h-3 w-4/6  shimmer-bg rounded" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-16 shimmer-bg rounded-full" />
        <div className="h-6 w-16 shimmer-bg rounded-full" />
      </div>
    </div>
  )
}

export default function Reviews() {
  const [activeTheme, setActiveTheme] = useState('all')
  const [reviews,     setReviews]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)

  const fetchReviews = async (theme) => {
    setLoading(true)
    setError(null)
    try {
      /* API returns reviews filtered by theme when provided */
      const apiReviews = await reviewsApi.list(theme !== 'all' ? theme : undefined)

      /* Merge API reviews with any staff-added localStorage reviews
         (de-dup by id so staff-added ones that are also in the API
         don't appear twice after a page refresh)                     */
      const localReviews  = getLocalReviews()
      const apiIds        = new Set(apiReviews.map(r => r.id))
      const uniqueLocals  = localReviews.filter(r => !apiIds.has(r.id))

      /* Apply client-side theme filter for localStorage reviews */
      const filteredLocals = theme === 'all'
        ? uniqueLocals
        : uniqueLocals.filter(r => r.themes?.includes(theme))

      setReviews([...filteredLocals, ...apiReviews])
    } catch (err) {
      setError(err.message)
      /* Graceful fallback: seed data + localStorage */
      toast.error('Could not reach the server — showing cached reviews.')
      const localReviews = getLocalReviews()
      const allFallback  = [...localReviews, ...FEATURED_REVIEWS]
      const filtered     = theme === 'all'
        ? allFallback
        : allFallback.filter(r => r.themes?.includes(theme))
      setReviews(filtered)
    } finally {
      setLoading(false)
    }
  }

  /* Fetch on mount and whenever the active theme tab changes */
  useEffect(() => {
    fetchReviews(activeTheme)
  }, [activeTheme])

  const handleTheme = (themeId) => {
    setActiveTheme(themeId)
  }

  return (
    <div className="min-h-screen bg-mist dark:bg-forest-dark flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* ── Header ── */}
        <section className="pt-28 pb-12 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-teak text-xs font-semibold uppercase tracking-widest mb-4">
                Verified Guest Reviews
              </p>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-5">
                Real stays, sorted by what matters to you.
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed">
                Every review shown here is sourced from a public booking platform and marked
                with its origin. Filter by theme to find what matters most to you.
              </p>
            </div>
          </div>
        </section>

        {/* ── Reviews ── */}
        <section className="py-10 sm:py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Theme filter tabs */}
            <div className="flex items-center gap-2 flex-wrap mb-8">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              {[{ id: 'all', label: 'All' }, ...REVIEW_THEMES].map(theme => (
                <button
                  key={theme.id}
                  onClick={() => handleTheme(theme.id)}
                  className={`text-sm font-semibold px-4 py-2 rounded-full border transition-colors duration-150
                              ${activeTheme === theme.id
                                ? 'bg-primary-500 border-primary-500 text-white'
                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary-300 dark:hover:border-primary-700'}`}
                >
                  {theme.label}
                </button>
              ))}

              {/* Error retry */}
              {error && !loading && (
                <button
                  onClick={() => fetchReviews(activeTheme)}
                  className="ml-auto flex items-center gap-1.5 text-xs text-gray-400
                             hover:text-primary-500 dark:hover:text-sage transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retry
                </button>
              )}
            </div>

            {/* Loading skeletons */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <ReviewSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Review cards */}
            {!loading && reviews.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {reviews.map(review => (
                  <article
                    key={review.id}
                    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                               dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        {/* Stars */}
                        <div className="flex gap-0.5 mb-2.5" aria-label={`${review.rating} out of 5 stars`}>
                          {Array.from({ length: review.rating ?? 5 }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-teak text-teak" />
                          ))}
                        </div>
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                          {review.guest}
                        </h2>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          {review.location && `${review.location} · `}Source: {review.source}
                        </p>
                      </div>
                      {review.verified && (
                        <span className="inline-flex items-center gap-1.5 flex-shrink-0
                                         text-[11px] font-semibold px-2.5 py-1 rounded-full
                                         bg-emerald-50 dark:bg-emerald-900/30
                                         text-emerald-700 dark:text-emerald-400
                                         border border-emerald-100 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>

                    <blockquote className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-5">
                      "{review.text}"
                    </blockquote>

                    <div className="flex flex-wrap gap-2">
                      {(review.themes ?? []).map(themeId => {
                        const theme = REVIEW_THEMES.find(t => t.id === themeId)
                        return (
                          <button
                            key={themeId}
                            onClick={() => handleTheme(themeId)}
                            className="text-[11px] font-medium px-2.5 py-1 rounded-full
                                       bg-primary-50 dark:bg-primary-900/30
                                       text-primary-700 dark:text-primary-300
                                       border border-primary-100 dark:border-primary-800/50
                                       hover:bg-primary-100 dark:hover:bg-primary-900/50
                                       transition-colors duration-150"
                          >
                            {theme?.label ?? themeId}
                          </button>
                        )
                      })}
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && reviews.length === 0 && (
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800
                              rounded-2xl p-10 text-center">
                <p className="font-semibold text-gray-900 dark:text-white mb-1">
                  No reviews for this theme yet
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Choose another theme to keep browsing verified guest feedback.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
