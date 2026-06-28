import { useMemo } from 'react'
import { Star, MessageSquare, Eye, TrendingUp } from 'lucide-react'
import StaffLayout from '../../components/staff/StaffLayout'

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="bg-white dark:bg-void-surface rounded-2xl border border-gray-100 dark:border-void-border p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="font-display font-bold text-2xl text-gray-900 dark:text-white leading-none mb-1">{value}</p>
      <p className="text-sm text-gray-500 dark:text-void-muted">{label}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">{sub}</p>}
    </div>
  )
}

/* Minimal bar chart using divs */
function TrendChart({ data }) {
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div className="flex items-end gap-2 h-28">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full rounded-t-md bg-primary-100 dark:bg-cyan/10 relative overflow-hidden"
               style={{ height: `${(d.count / max) * 96}px`, minHeight: 4 }}>
            <div className="absolute bottom-0 inset-x-0 bg-primary-400 dark:bg-cyan rounded-t-md"
                 style={{ height: '100%' }} />
          </div>
          <span className="text-[9px] text-gray-400 dark:text-void-muted">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function StaffHome() {
  /* Derive stats from localStorage */
  const { reviews, enquiries } = useMemo(() => {
    try {
      const r = JSON.parse(localStorage.getItem('staySenseFeaturedReviews') || '[]')
      const e = JSON.parse(localStorage.getItem('stay-sense-enquiries-log') || '[]')
      return { reviews: r, enquiries: e }
    } catch { return { reviews: [], enquiries: [] } }
  }, [])

  const publicCount    = reviews.length
  const pendingReplies = reviews.filter(r => !r.replied).length
  const avgRating      = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating ?? 5), 0) / reviews.length).toFixed(1)
    : '4.9'

  /* Build a 6-month fake trend based on publicCount */
  const months  = ['Jan','Feb','Mar','Apr','May','Jun']
  const trend   = months.map((label, i) => ({
    label,
    count: Math.max(1, Math.round((publicCount + 6) * (0.5 + i * 0.1))),
  }))

  /* Recent activity = last 5 reviews */
  const recent = [...reviews].reverse().slice(0, 5)

  return (
    <StaffLayout title="Dashboard overview">
      <div className="p-6 sm:p-8 space-y-6">

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Star}          label="Avg rating"     value={avgRating}      sub="from all reviews"   accent="bg-amber-50 dark:bg-amber-900/20 text-amber-500" />
          <StatCard icon={MessageSquare} label="Pending replies" value={pendingReplies} sub="reviews waiting"    accent="bg-red-50 dark:bg-red-900/20 text-red-500" />
          <StatCard icon={Eye}           label="Public reviews"  value={publicCount}    sub="on reviews page"    accent="bg-primary-50 dark:bg-cyan/10 text-primary-500 dark:text-cyan" />
          <StatCard icon={TrendingUp}    label="Total reviews"   value={publicCount + 6} sub="all time"          accent="bg-violet-50 dark:bg-violet-900/20 text-violet-500" />
        </div>

        {/* Chart + activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Trend */}
          <div className="lg:col-span-2 bg-white dark:bg-void-surface rounded-2xl border border-gray-100 dark:border-void-border p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-5">Review trend</h3>
            <TrendChart data={trend} />
          </div>

          {/* Recent activity */}
          <div className="bg-white dark:bg-void-surface rounded-2xl border border-gray-100 dark:border-void-border p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Recent activity</h3>
            {recent.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-void-muted">No reviews published yet.</p>
            ) : (
              <ul className="space-y-3">
                {recent.map((r, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary-50 dark:bg-cyan/10
                                    flex items-center justify-center flex-shrink-0 text-xs font-semibold
                                    text-primary-600 dark:text-cyan">
                      {r.guest?.[0] ?? r.reviewer_name?.[0] ?? '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                        {r.guest ?? r.reviewer_name}
                      </p>
                      <p className="text-[11px] text-gray-400 dark:text-void-muted truncate">{r.source}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Review queue */}
        <div className="bg-white dark:bg-void-surface rounded-2xl border border-gray-100 dark:border-void-border p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Review queue</h3>
          {recent.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-void-muted">
              No reviews yet. Use the Classifier to analyse and publish reviews.
            </p>
          ) : (
            <div className="space-y-2">
              {recent.map((r, i) => (
                <div key={i}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl
                             bg-gray-50 dark:bg-void-card hover:bg-gray-100 dark:hover:bg-void-border/40
                             transition-colors">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 flex-1 truncate">
                    {r.guest ?? r.reviewer_name} · {r.source}
                  </span>
                  <span className="text-[11px] text-amber-500 flex-shrink-0">
                    {'★'.repeat(r.rating ?? 5)}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0
                                    ${r.verified ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-gray-100 dark:bg-void-border text-gray-400'}`}>
                    {r.verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </StaffLayout>
  )
}
