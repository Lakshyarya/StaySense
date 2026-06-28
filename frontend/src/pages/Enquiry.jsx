import { useState } from 'react'
import { CheckCircle2, ChevronRight, MessageCircle, CalendarCheck } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Button, Input, toast } from '../components/ui'
import { enquiriesApi } from '../services/api'

const ROOMS = ['Deluxe Hill View Room', 'Forest Cottage', 'Meadow Room']

const INIT = {
  checkIn: '', checkOut: '',
  adults: '1', children: '0',
  room: '', name: '', phone: '', email: '',
  requests: '', terms: false,
}

export default function Enquiry() {
  const [form,      setForm]      = useState(INIT)
  const [errors,    setErrors]    = useState({})
  const [loading,   setLoading]   = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [bookingRef, setBookingRef] = useState('')

  const set = field => e => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [field]: val }))
    if (errors[field]) setErrors(er => ({ ...er, [field]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.checkIn)  e.checkIn  = 'Check-in date is required.'
    if (!form.checkOut) e.checkOut = 'Check-out date is required.'
    if (form.checkIn && form.checkOut && form.checkOut <= form.checkIn)
      e.checkOut = 'Check-out must be after check-in.'
    if (!form.name.trim())  e.name  = 'Your name is required.'
    if (!form.phone.trim()) e.phone = 'Phone number is required.'
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      e.email = 'A valid email address is required.'
    if (!form.terms) e.terms = 'Please accept the terms to continue.'
    return e
  }

  /* WhatsApp — stays client-side, no backend needed */
  const handleWhatsApp = () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    const nights = Math.round((new Date(form.checkOut) - new Date(form.checkIn)) / 86400000)
    const msg = encodeURIComponent(
      `*New Booking Inquiry - Stay Sense*\n\n` +
      `Check-in: ${form.checkIn}\nCheck-out: ${form.checkOut}\nNights: ${nights}\n` +
      `Room: ${form.room || 'No preference'}\nGuests: ${form.adults} adult(s), ${form.children} child(ren)\n\n` +
      `${form.name}\n${form.phone}\n${form.email}\n\n` +
      (form.requests ? `${form.requests}\n\n` : '') +
      `_Sent via Stay Sense Direct Booking_`
    )
    window.open(`https://wa.me/8002042546?text=${msg}`, '_blank')
    toast.success('Opening WhatsApp with your inquiry details.')
  }

  /* Form submit — real API call */
  const handleSubmit = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const result = await enquiriesApi.create({
        checkIn:   form.checkIn,
        checkOut:  form.checkOut,
        adults:    parseInt(form.adults,   10),
        children:  parseInt(form.children, 10),
        room:      form.room     || null,
        name:      form.name,
        phone:     form.phone,
        email:     form.email,
        requests:  form.requests || null,
      })
      setBookingRef(result.id)
      setSubmitted(true)
      toast.success(`Enquiry submitted! Reference: ${result.id}`)
    } catch (err) {
      toast.error(err.message || 'Failed to submit enquiry. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  /* ── Success screen ── */
  if (submitted) {
    return (
      <div className="min-h-screen bg-mist dark:bg-forest-dark flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-24">
          <div className="max-w-md w-full text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full
                            bg-primary-50 dark:bg-primary-900/30 mb-6">
              <CalendarCheck className="w-8 h-8 text-primary-500 dark:text-sage" />
            </div>
            <h1 className="font-display font-bold text-3xl text-gray-900 dark:text-white mb-3">
              Enquiry received!
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
              Thank you. Prerna will confirm availability and respond via WhatsApp
              within 2 hours.
            </p>
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800
                            rounded-2xl p-5 mb-8">
              <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                Your reference number
              </p>
              <p className="font-display font-bold text-2xl text-primary-600 dark:text-sage tracking-wider">
                {bookingRef}
              </p>
            </div>
            <Button variant="outline" onClick={() => { setSubmitted(false); setForm(INIT) }}>
              Submit another enquiry
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-mist dark:bg-forest-dark flex flex-col">
      <Navbar />

      <main className="flex-1 pt-28 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

            {/* Left: info */}
            <section>
              <p className="text-teak text-xs font-semibold uppercase tracking-widest mb-4">
                Direct Booking Enquiry
              </p>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
                Check availability<br />with the family.
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed mb-8">
                Send your preferred dates and room choice. This is an enquiry, not a
                payment page — the host will confirm availability directly.
              </p>
              <ul className="space-y-3">
                {[
                  'No payment required to send an enquiry',
                  'Personalised room recommendation on request',
                  'WhatsApp response within 2 hours',
                  'Direct rate — no OTA commission',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-gray-600 dark:text-gray-300 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary-500 dark:text-sage flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* Right: form */}
            <section className="bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8
                                border border-gray-100 dark:border-gray-800
                                shadow-xl shadow-gray-900/5">
              <h2 className="font-display font-semibold text-xl text-gray-900 dark:text-white mb-6">
                Enquiry Form
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Check-in"  type="date" value={form.checkIn}  onChange={set('checkIn')}  error={errors.checkIn}  required />
                  <Input label="Check-out" type="date" value={form.checkOut} onChange={set('checkOut')} error={errors.checkOut} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input label="Adults"   type="number" value={form.adults}   onChange={set('adults')}   min="1" max="10" />
                  <Input label="Children" type="number" value={form.children} onChange={set('children')} min="0" max="6" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Room Preference
                  </label>
                  <select
                    value={form.room}
                    onChange={set('room')}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700
                               bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                               px-4 py-3 text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary-500/25 focus:border-primary-400"
                  >
                    <option value="">No preference</option>
                    {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <Input label="Full Name" placeholder="Priya Sharma"        value={form.name}  onChange={set('name')}  error={errors.name}  required />

                <div className="grid grid-cols-2 gap-4">
                  <Input label="Phone" type="tel"   placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} error={errors.phone} required />
                  <Input label="Email" type="email" placeholder="you@email.com"   value={form.email} onChange={set('email')} error={errors.email} required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Special Requests <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={form.requests}
                    onChange={set('requests')}
                    placeholder="Dietary requirements, accessibility needs, anniversary surprises..."
                    rows={3}
                    maxLength={500}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700
                               bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                               px-4 py-3 text-sm resize-none
                               placeholder:text-gray-400 dark:placeholder:text-gray-500
                               focus:outline-none focus:ring-2 focus:ring-primary-500/25 focus:border-primary-400"
                  />
                  <p className="text-right text-xs text-gray-400 mt-1">{form.requests.length}/500</p>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.terms}
                    onChange={set('terms')}
                    className="mt-0.5 w-4 h-4 rounded text-primary-500 border-gray-300
                               dark:border-gray-600 focus:ring-primary-500/30 cursor-pointer flex-shrink-0"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    I understand this is an enquiry, not a confirmed booking. No payment is required now.
                  </span>
                </label>
                {errors.terms && <p className="text-xs text-red-500 dark:text-red-400">{errors.terms}</p>}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    onClick={handleWhatsApp}
                    variant="primary"
                    fullWidth
                    className="!bg-[#25D366] hover:!bg-[#1ebe5d] !rounded-xl gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Send via WhatsApp
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    loading={loading}
                    variant="outline"
                    fullWidth
                    className="!rounded-xl"
                  >
                    Submit Enquiry
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
