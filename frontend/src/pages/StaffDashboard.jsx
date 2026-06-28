import { useState, useRef } from 'react'
import {
  Sparkles, Download, Copy, CheckCheck,
  AlertTriangle, BarChart3, RefreshCw,
  ChevronDown, ChevronUp, FileText, PlusCircle,
} from 'lucide-react'
import StaffLayout from '../components/staff/StaffLayout'
import { Button, Spinner, toast } from '../components/ui'
import { analysisApi, reviewsApi } from '../services/api'

const SENTIMENT_STYLE = {
  positive: { label: 'Positive', cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
  neutral:  { label: 'Neutral',  cls: 'bg-amber-50  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400  border-amber-200  dark:border-amber-800'  },
  negative: { label: 'Negative', cls: 'bg-red-50    text-red-700    dark:bg-red-900/30    dark:text-red-400    border-red-200    dark:border-red-800'    },
  mixed:    { label: 'Mixed',    cls: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 border-violet-200 dark:border-violet-800' },
}

const THEME_LABELS = {
  food: 'Food', host: 'Host', location: 'Location',
  cleanliness: 'Cleanliness', value: 'Value', experience: 'Experience',
}

const SOURCES = ['Google', 'TripAdvisor', 'Booking.com', 'MakeMyTrip', 'Airbnb', 'Other']

const SAMPLES = [
  "The food was absolutely incredible — every meal felt like a celebration. Sunita ji's Kumaoni dal is something I will dream about. The views from our balcony were breathtaking. Highly recommend!",
  'Decent stay overall. The room was okay, nothing extraordinary. Location was good but connectivity was an issue. Food was average. Would not go out of my way to recommend.',
  'Terrible experience. The room was dirty and the staff were rude and unhelpful. Hot water did not work for two days. Worst stay I have had in years.',
]

/* ── Single result row ── */
function ResultRow({ idx, item, onCopy, onAddReview }) {
  const [expanded, setExpanded] = useState(false)
  const [copied,   setCopied]   = useState(false)
  const [added,    setAdded]    = useState(false)
  const [adding,   setAdding]   = useState(false)
  const [response, setResponse] = useState(item.suggested_response ?? '')
  const s = SENTIMENT_STYLE[item.sentiment] ?? SENTIMENT_STYLE.neutral

  const handleCopy = () => {
    navigator.clipboard.writeText(response)
    setCopied(true); onCopy()
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAdd = async () => {
    setAdding(true)
    try { await onAddReview(item); setAdded(true) }
    catch { /* toasted inside onAddReview */ }
    finally { setAdding(false) }
  }

  return (
    <div className="bg-white dark:bg-void-surface rounded-xl border border-gray-100 dark:border-void-border
                    hover:border-gray-200 dark:hover:border-void-border/80 transition-colors">
      <div className="flex items-start gap-3 p-4">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-void-card
                         text-gray-400 text-xs font-semibold flex items-center justify-center mt-0.5">
          {idx + 1}
        </span>
        <div className="flex-1 min-w-0 space-y-2">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-2">{item.text}</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${s.cls}`}>
              {s.label}<span className="ml-1.5 opacity-60">{item.confidence}%</span>
            </span>
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full
                             bg-primary-50 dark:bg-cyan/10 text-primary-700 dark:text-cyan
                             border border-primary-100 dark:border-cyan/20">
              {THEME_LABELS[item.primary_theme] ?? item.primary_theme}
            </span>
            {(item.secondary_themes ?? []).map(t => (
              <span key={t} className="text-[11px] px-2 py-0.5 rounded-full
                                       bg-gray-100 dark:bg-void-card text-gray-500 dark:text-void-muted
                                       border border-gray-200 dark:border-void-border">
                {THEME_LABELS[t] ?? t}
              </span>
            ))}
            {item.source && <span className="text-[11px] text-gray-400 ml-auto">{item.source}</span>}
          </div>
        </div>
        <button onClick={() => setExpanded(v => !v)}
          className="flex-shrink-0 p-1.5 rounded-lg text-gray-400
                     hover:text-gray-600 dark:hover:text-gray-200
                     hover:bg-gray-100 dark:hover:bg-void-card transition-colors">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 dark:border-void-border p-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-void-muted uppercase tracking-wide mb-2">Full Review</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed
                          bg-gray-50 dark:bg-void-card rounded-lg p-3">{item.text}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-void-muted uppercase tracking-wide mb-2">
              Suggested Response <span className="normal-case font-normal">(editable)</span>
            </p>
            <textarea value={response} onChange={e => setResponse(e.target.value)} rows={3}
              className="w-full rounded-lg border border-gray-200 dark:border-void-border
                         bg-white dark:bg-void-card text-sm text-gray-700 dark:text-gray-300
                         px-3 py-2.5 resize-none
                         focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400
                         transition-all duration-200" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button size="sm" variant={copied ? 'secondary' : 'outline'} onClick={handleCopy} className="!rounded-lg">
              {copied ? <><CheckCheck className="w-3.5 h-3.5" />Copied!</> : <><Copy className="w-3.5 h-3.5" />Copy Response</>}
            </Button>
            {item.sentiment !== 'negative' && (
              <Button size="sm" variant={added ? 'secondary' : 'ghost'} loading={adding}
                onClick={handleAdd} disabled={added} className="!rounded-lg">
                {added
                  ? <><CheckCheck className="w-3.5 h-3.5" />Added to Reviews</>
                  : <><PlusCircle className="w-3.5 h-3.5" />Add to Reviews Page</>}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Page ── */
export default function StaffDashboard() {
  const [mode,       setMode]       = useState('single')
  const [inputText,  setInputText]  = useState('')
  const [source,     setSource]     = useState('')
  const [results,    setResults]    = useState([])
  const [processing, setProcessing] = useState(false)
  const [progress,   setProgress]   = useState({ done: 0, total: 0 })
  const textareaRef = useRef(null)

  const splitBatch = text =>
    text.split(/\n{2,}/).map(t => t.trim()).filter(t => t.length >= 10)

  const analyse = async () => {
    const raw = inputText.trim()
    if (!raw) { toast.error('Please paste at least one review.'); return }
    const reviews = mode === 'batch' ? splitBatch(raw) : [raw]
    if (!reviews.length)   { toast.error('No valid reviews detected (min 10 characters).'); return }
    if (reviews.length > 50) { toast.error('Maximum 50 reviews per batch.'); return }

    setResults([]); setProcessing(true); setProgress({ done: 0, total: reviews.length })
    const collected = []

    for (let i = 0; i < reviews.length; i++) {
      try {
        const result = await analysisApi.analyse(reviews[i], source || null)
        collected.push({ text: reviews[i], source, ...result })
      } catch (err) {
        collected.push({ text: reviews[i], source, sentiment: 'neutral', confidence: 0,
          primary_theme: 'experience', secondary_themes: [], suggested_response: '', error: err.message })
        toast.error(`Review ${i + 1}: ${err.message}`)
      }
      setProgress({ done: i + 1, total: reviews.length })
      setResults([...collected])
    }

    setProcessing(false)
    const failed = collected.filter(r => r.error).length
    if (!failed) toast.success(`${reviews.length} review${reviews.length > 1 ? 's' : ''} analysed.`)
    else toast.info(`${reviews.length - failed} analysed, ${failed} failed.`)
  }

  const addReviewToPlatform = async (item) => {
    const rating = item.sentiment === 'positive' ? 5 : item.sentiment === 'neutral' ? 3 : 2
    const payload = {
      guest:    'Verified Guest',
      location: item.source || 'Verified',
      source:   item.source || 'Direct',
      rating, verified: true,
      themes: [item.primary_theme, ...(item.secondary_themes ?? [])].filter(Boolean),
      text:   item.text,
    }
    try {
      const saved = await reviewsApi.add(payload)
      const existing = JSON.parse(localStorage.getItem('staySenseFeaturedReviews') || '[]')
      localStorage.setItem('staySenseFeaturedReviews', JSON.stringify([{ ...saved }, ...existing]))
      toast.success('Review published to the Reviews page.')
    } catch (err) {
      toast.error(`Could not publish: ${err.message}`); throw err
    }
  }

  const exportCSV = () => {
    const headers = ['#','Review','Source','Sentiment','Confidence','Primary Theme','Secondary Themes','Suggested Response']
    const rows = results.map((r, i) => [
      i + 1, `"${r.text.replace(/"/g,'""')}"`, r.source || '',
      r.sentiment, `${r.confidence}%`,
      THEME_LABELS[r.primary_theme] ?? r.primary_theme,
      (r.secondary_themes ?? []).map(t => THEME_LABELS[t] ?? t).join('; '),
      `"${(r.suggested_response || '').replace(/"/g,'""')}"`,
    ])
    const csv  = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    Object.assign(document.createElement('a'), {
      href: url, download: `StaySense_Reviews_${new Date().toISOString().slice(0,10)}.csv`,
    }).click()
    URL.revokeObjectURL(url)
    toast.success('CSV downloaded.')
  }

  const counts = results.reduce((acc, r) => { acc[r.sentiment] = (acc[r.sentiment] || 0) + 1; return acc }, {})

  return (
    <StaffLayout title="Classifier">
      <div className="p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Input panel ── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-void-surface rounded-2xl border border-gray-100 dark:border-void-border p-5">
              {/* Mode toggle */}
              <div className="flex rounded-xl bg-gray-100 dark:bg-void-card p-1 mb-4 gap-1">
                {['single','batch'].map(m => (
                  <button key={m} onClick={() => { setMode(m); setInputText(''); setResults([]) }}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize transition-all
                                ${mode === m
                                  ? 'bg-white dark:bg-void-surface text-gray-900 dark:text-white shadow-sm'
                                  : 'text-gray-500 dark:text-void-muted hover:text-gray-700 dark:hover:text-gray-200'}`}>
                    {m === 'single' ? 'Single Review' : 'Batch Mode'}
                  </button>
                ))}
              </div>

              {/* Source */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 dark:text-void-muted uppercase tracking-wide mb-1.5">
                  Review Source
                </label>
                <select value={source} onChange={e => setSource(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-void-border
                             bg-white dark:bg-void-card text-gray-900 dark:text-white
                             px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400">
                  <option value="">Select source (optional)</option>
                  {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Textarea */}
              <div className="mb-1">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-void-muted uppercase tracking-wide">
                    {mode === 'single' ? 'Review Text' : 'Reviews (blank line between each)'}
                  </label>
                  <span className="text-xs text-gray-400 dark:text-void-muted">
                    {inputText.length}{mode === 'single' ? '/2000' : ''}
                  </span>
                </div>
                <textarea ref={textareaRef} value={inputText} onChange={e => setInputText(e.target.value)}
                  maxLength={mode === 'single' ? 2000 : undefined}
                  rows={mode === 'batch' ? 12 : 8}
                  placeholder={mode === 'single' ? 'Paste a guest review here…' : 'Paste multiple reviews here.\n\nSeparate each review with a blank line.\n\nMax 50 reviews per batch.'}
                  className="w-full rounded-xl border border-gray-200 dark:border-void-border
                             bg-white dark:bg-void-card text-gray-900 dark:text-white
                             px-4 py-3 text-sm resize-none
                             placeholder:text-gray-400 dark:placeholder:text-gray-600
                             focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400
                             transition-all duration-200" />
              </div>

              {/* Samples + Clear */}
              <div className="flex gap-1.5 mb-4 flex-wrap">
                <span className="text-[11px] text-gray-400 dark:text-void-muted self-center">Load:</span>
                {['Positive','Neutral','Negative'].map((label, i) => (
                  <button key={label} onClick={() => setInputText(SAMPLES[i])}
                    className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-void-card
                               text-gray-500 dark:text-void-muted
                               hover:bg-primary-50 dark:hover:bg-cyan/10
                               hover:text-primary-600 dark:hover:text-cyan transition-colors">
                    {label}
                  </button>
                ))}
                {inputText && (
                  <button onClick={() => { setInputText(''); setResults([]) }}
                    className="text-[11px] px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-400 ml-auto">
                    Clear
                  </button>
                )}
              </div>

              <Button variant="primary" fullWidth onClick={analyse} loading={processing} className="!rounded-xl">
                <Sparkles className="w-4 h-4" />
                {processing ? 'Analysing…' : 'Analyse'}
              </Button>
            </div>

            {/* Key */}
            <div className="bg-white dark:bg-void-surface rounded-2xl border border-gray-100 dark:border-void-border p-5">
              <p className="text-xs font-semibold text-gray-500 dark:text-void-muted uppercase tracking-wide mb-3">Sentiment Key</p>
              <div className="space-y-2">
                {Object.entries(SENTIMENT_STYLE).map(([key, { label, cls }]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${cls}`}>{label}</span>
                    <span className="text-xs text-gray-400 dark:text-void-muted capitalize">{key}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 dark:text-void-muted mt-3 leading-relaxed">
                Negative reviews cannot be published to the public Reviews page.
              </p>
            </div>
          </div>

          {/* ── Results panel ── */}
          <div className="lg:col-span-3 space-y-4">
            {/* Export controls */}
            {results.length > 0 && !processing && (
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={() => {
                  const text = results.map((r,i) => `${i+1}. ${r.suggested_response}`).join('\n\n')
                  navigator.clipboard.writeText(text)
                  toast.success('All responses copied.')
                }}>
                  <Copy className="w-3.5 h-3.5" /> Copy All
                </Button>
                <Button size="sm" variant="primary" onClick={exportCSV}>
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </Button>
              </div>
            )}

            {/* Progress */}
            {processing && (
              <div className="bg-white dark:bg-void-surface rounded-2xl border border-gray-100 dark:border-void-border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Spinner size="sm" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Analysing {progress.done} of {progress.total}…
                  </span>
                </div>
                {progress.total > 1 && (
                  <div className="w-full bg-gray-100 dark:bg-void-card rounded-full h-1.5 overflow-hidden">
                    <div className="bg-primary-500 dark:bg-cyan h-1.5 rounded-full transition-all duration-500"
                         style={{ width: `${(progress.done / progress.total) * 100}%` }} />
                  </div>
                )}
              </div>
            )}

            {/* Summary bar */}
            {results.length > 0 && (
              <div className="bg-white dark:bg-void-surface rounded-2xl border border-gray-100 dark:border-void-border p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <BarChart3 className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {results.length} review{results.length > 1 ? 's' : ''}
                    </span>
                    <span className="text-gray-300 dark:text-void-border">·</span>
                    {Object.entries(counts).map(([s, c]) => (
                      <span key={s} className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${SENTIMENT_STYLE[s]?.cls}`}>
                        {c} {SENTIMENT_STYLE[s]?.label}
                      </span>
                    ))}
                  </div>
                  <button onClick={() => { setResults([]); setInputText('') }}
                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> Reset
                  </button>
                </div>
                {counts.negative > 0 && (
                  <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20
                                  border border-red-200 dark:border-red-800/50 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700 dark:text-red-400">
                      <strong>{counts.negative} negative</strong> review{counts.negative > 1 ? 's' : ''} detected — respond quickly to protect your rating.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Result rows */}
            {results.length > 0 && (
              <div className="space-y-3">
                {results.map((item, i) => (
                  <ResultRow key={i} idx={i} item={item}
                    onCopy={() => toast.success('Copied!')}
                    onAddReview={addReviewToPlatform} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!processing && results.length === 0 && (
              <div className="bg-white dark:bg-void-surface rounded-2xl border border-gray-100 dark:border-void-border
                              flex flex-col items-center justify-center py-20 px-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-cyan/10
                                flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-primary-400 dark:text-cyan" />
                </div>
                <p className="font-display font-semibold text-gray-900 dark:text-white text-lg mb-2">
                  Paste a review to begin
                </p>
                <p className="text-gray-500 dark:text-void-muted text-sm max-w-xs leading-relaxed">
                  Use the panel on the left to paste a review or load a sample.
                  Good reviews can be published directly to the public Reviews page.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </StaffLayout>
  )
}
