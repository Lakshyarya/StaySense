import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, X, Users, Bed, Leaf, Wind, Mountain, Bird, Flame, Telescope } from 'lucide-react'
import Navbar  from '../components/Navbar'
import Hero    from '../components/Hero'
import Card    from '../components/Card'
import Footer  from '../components/Footer'
import { Button } from '../components/ui'

/* ── Default rooms — also used as seed for localStorage ── */
export const DEFAULT_ROOMS = [
  {
    id:          'deluxe-hill-view',
    badge:       'Most Popular',
    title:       'Deluxe Hill View Room',
    description: 'Wake to panoramic views of Trishul and Nanda Devi from a private balcony. Handwoven throws, local art, and the hush of the forest.',
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=900&q=80&auto=format&fit=crop',
    ],
    capacity:  '2 Adults, 1 Child',
    bedConfig: '1 King Bed',
    price:     4500,
    amenities: ['Hill View', 'Private Balcony', 'Hot Water', 'Attached Bath'],
    status:    'available',
  },
  {
    id:          'forest-cottage',
    badge:       'Family Favourite',
    title:       'Forest Cottage',
    description: 'A freestanding stone-and-wood cottage embedded in the oak forest. Two rooms, a sitting area — perfect for families wanting real privacy.',
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=900&q=80&auto=format&fit=crop',
    ],
    capacity:  '4 Adults, 2 Children',
    bedConfig: '2 Double Beds',
    price:     7200,
    amenities: ['Forest View', 'Sitting Room', 'Kitchenette', 'Private Garden'],
    status:    'available',
  },
  {
    id:          'meadow-room',
    badge:       'Solo & Couples',
    title:       'Meadow Room',
    description: 'Simple, cozy, completely quiet. Opens onto a flower meadow — ideal for solo travellers who just want the forest, the stars, and good food.',
    images: [
      'https://images.unsplash.com/photo-1562438668-bcf0ca6578f0?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=900&q=80&auto=format&fit=crop',
    ],
    capacity:  '2 Adults',
    bedConfig: '1 Queen Bed',
    price:     2800,
    amenities: ['Meadow View', 'Reading Corner', 'Hot Water'],
    status:    'limited',
  },
]

const FEATURES = [
  { icon: <Leaf      className="w-5 h-5" />, title: '100% Solar-Powered',  description: 'Off-grid since 2021. Every kettle, light, and heater runs on clean mountain sun.' },
  { icon: <Mountain  className="w-5 h-5" />, title: '5 Trek Routes',       description: 'Guided day hikes to Trishul base camp, Khaliya Top, and three hidden meadows.' },
  { icon: <Telescope className="w-5 h-5" />, title: '140+ Bird Species',   description: 'Inside a protected birding zone. Scopes provided — Himalayan Monal guaranteed.' },
  { icon: <Flame     className="w-5 h-5" />, title: 'Evening Bonfire',     description: 'Every clear night, a fire under the stars. Masala chai, stories, and silence.' },
  { icon: <Wind      className="w-5 h-5" />, title: 'Zero Light Pollution',description: 'Milky Way visible to the naked eye, every cloudless night.' },
  { icon: <Bird      className="w-5 h-5" />, title: 'Farm-to-Table Meals', description: 'Everything on your plate came from within 5 km — mostly our own kitchen garden.' },
]

/* ── Image Carousel (used inside room modal) ── */
function Carousel({ images = [] }) {
  const [idx, setIdx] = useState(0)
  if (!images.length) return null

  const prev = e => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length) }
  const next = e => { e.stopPropagation(); setIdx(i => (i + 1) % images.length) }

  return (
    <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-void-card select-none">
      <img
        src={images[idx]}
        alt={`Room photo ${idx + 1}`}
        className="w-full h-52 sm:h-64 object-cover transition-opacity duration-300"
        draggable={false}
      />

      {/* Arrows — only if more than 1 image */}
      {images.length > 1 && (
        <>
          <button onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2
                       w-8 h-8 rounded-full bg-black/50 hover:bg-black/70
                       flex items-center justify-center text-white transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2
                       w-8 h-8 rounded-full bg-black/50 hover:bg-black/70
                       flex items-center justify-center text-white transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
          {/* Dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setIdx(i) }}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200
                            ${i === idx ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ── Room detail modal ── */
function RoomModal({ room, onClose, onBook }) {
  if (!room) return null
  const s = { available: { label: 'Available', cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' }, limited: { label: 'Limited', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' }, booked: { label: 'Booked', cls: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' } }
  const status = s[room.status] ?? s.available

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-lg bg-white dark:bg-void-surface
                      rounded-t-2xl sm:rounded-2xl shadow-2xl
                      max-h-[92vh] flex flex-col animate-slide-up overflow-hidden">
        {/* Close */}
        <button onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50
                     flex items-center justify-center text-white transition-colors">
          <X className="w-4 h-4" />
        </button>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 overscroll-contain">
          {/* Carousel */}
          <div className="p-3">
            <Carousel images={room.images ?? (room.image ? [room.image] : [])} />
          </div>

          <div className="px-5 pb-6 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                {room.badge && (
                  <span className="text-[11px] font-semibold text-teak uppercase tracking-wider">{room.badge}</span>
                )}
                <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white mt-0.5 leading-snug">
                  {room.title}
                </h2>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="font-bold text-lg text-gray-900 dark:text-white">
                  ₹{(room.price ?? room.price_per_night)?.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-gray-400 block">/night</span>
              </div>
            </div>

            <span className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${status.cls}`}>
              {status.label}
            </span>

            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {room.description}
            </p>

            {/* Specs */}
            <div className="flex items-center gap-5 text-xs text-gray-500 dark:text-gray-400">
              {(room.capacity ?? (room.capacity_adults && `${room.capacity_adults} Adults`)) && (
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {room.capacity ?? `${room.capacity_adults} Adults`}
                </span>
              )}
              {(room.bedConfig ?? room.bed_config) && (
                <span className="flex items-center gap-1.5">
                  <Bed className="w-3.5 h-3.5" />
                  {room.bedConfig ?? room.bed_config}
                </span>
              )}
            </div>

            {/* Amenities */}
            {(room.amenities ?? []).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {room.amenities.map(a => (
                  <span key={a}
                    className="text-[11px] px-2.5 py-1 rounded-full
                               bg-primary-50 dark:bg-primary-900/20
                               text-primary-700 dark:text-sage border border-primary-100 dark:border-primary-800/40">
                    {a}
                  </span>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="flex gap-3 pt-1">
              <Button variant="primary" fullWidth
                disabled={room.status === 'booked'}
                onClick={() => { onClose(); onBook() }}
                className="!rounded-xl">
                {room.status === 'booked' ? 'Unavailable' : 'Book This Room'}
              </Button>
              <Button variant="outline" onClick={onClose} className="!rounded-xl">Close</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Page ── */
export default function Home() {
  const navigate = useNavigate()
  const [modalRoom, setModalRoom] = useState(null)
  const [rooms, setRooms] = useState([])

  /* Load rooms: staff-managed localStorage first, then defaults */
  useEffect(() => {
    try {
      const stored = localStorage.getItem('stay-sense-rooms')
      const parsed = stored ? JSON.parse(stored) : null
      setRooms(parsed && parsed.length ? parsed : DEFAULT_ROOMS)
    } catch {
      setRooms(DEFAULT_ROOMS)
    }
  }, [])

  return (
    <div className="min-h-screen bg-mist dark:bg-void font-body">
      <Navbar />
      <Hero />

      {/* ── Story ── */}
      <section id="story" className="py-20 sm:py-24 bg-white dark:bg-void-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-center">
            <div>
              <p className="text-teak text-xs font-semibold uppercase tracking-widest mb-4">Our Story</p>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
                A family home,<br />
                <span className="text-primary-500 dark:text-sage italic">open to the world.</span>
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                <p>In 1987, Ramesh and Sunita Pant bought a small plot of oak forest near Munsiyari. They planted 400 trees in their first year. By 2010, wild Himalayan Monals nested in the garden.</p>
                <p>In 2018, their daughter Prerna opened three rooms to guests — not as a hotel, but as an extension of the family table: the same food, the same views, the same evening chai.</p>
                <p>We don't list on OTAs by choice. When you book directly, the full amount comes to the family — and 10% goes to the Munsiyari Forest Trust.</p>
              </div>
              <div className="flex flex-wrap gap-2.5 mt-8">
                {['🌱 Carbon-Neutral 2022','🏡 Family-Run Since 2018','🌍 10% to Forest Trust','☀️ 100% Solar'].map(l => (
                  <span key={l} className="text-xs font-medium px-3 py-1.5 rounded-full
                                           bg-primary-50 dark:bg-primary-900/20
                                           text-primary-700 dark:text-primary-300
                                           border border-primary-100 dark:border-primary-800/50">{l}</span>
                ))}
              </div>
            </div>
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=900&q=80&auto=format&fit=crop"
                alt="Forest path" className="w-full h-[420px] sm:h-[480px] object-cover rounded-3xl shadow-2xl" loading="lazy" />
              <div className="absolute -bottom-5 -left-5 bg-white dark:bg-void-card rounded-2xl shadow-xl p-4 border border-gray-100 dark:border-void-border">
                <div className="font-display font-bold text-3xl text-primary-500 dark:text-sage leading-none">400+</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">trees planted<br />by the family</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Rooms ── */}
      <section id="rooms" className="py-20 sm:py-24 bg-mist dark:bg-void">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14">
            <p className="text-teak text-xs font-semibold uppercase tracking-widest mb-3">Accommodation</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Three rooms. Three moods.
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed">
              Each room has a different view, feel, and pace. All include home-cooked breakfast.
            </p>
          </div>

          {rooms.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => <div key={i} className="h-80 rounded-2xl shimmer-bg" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
              {rooms.map(room => (
                <Card
                  key={room.id}
                  {...room}
                  image={room.images?.[0] ?? room.image}
                  ctaLabel="View Room"
                  onCtaClick={() => setModalRoom(room)}
                />
              ))}
            </div>
          )}
          <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-8">
            All rooms include: home-cooked breakfast · bonfire evenings · guided nature walks · free parking
          </p>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="amenities" className="py-20 sm:py-24 bg-white dark:bg-void-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14">
            <p className="text-teak text-xs font-semibold uppercase tracking-widest mb-3">Why Stay Sense</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Everything the forest offers.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(f => <Card key={f.title} variant="feature" {...f} />)}
          </div>
        </div>
      </section>

      {/* ── Room modal ── */}
      <RoomModal
        room={modalRoom}
        onClose={() => setModalRoom(null)}
        onBook={() => navigate('/enquiry')}
      />

      <Footer />
    </div>
  )
}
