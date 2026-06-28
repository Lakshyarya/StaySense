import { TreePine, Users, Heart, MapPin } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Card   from '../components/Card'
import { Button } from '../components/ui'

const MILESTONES = [
  { year: '1987', event: 'Ramesh and Sunita Pant purchase 2 acres of oak forest near Munsiyari to build their family home.' },
  { year: '1992', event: '400 native trees planted across the property. The forest canopy begins to close.' },
  { year: '2010', event: 'Wild Himalayan Monals nest in the garden for the first time. The forest is declared a private bird sanctuary.' },
  { year: '2018', event: 'Daughter Prerna opens three rooms to guests. Stay Sense is born as a direct-booking platform.' },
  { year: '2021', event: 'Full solar installation completed. The property becomes 100% off-grid.' },
  { year: '2022', event: 'Carbon-neutral certification achieved. 10% of all bookings directed to the Munsiyari Forest Trust.' },
]

const TEAM = [
  {
    title:       'Prerna Pant',
    description: 'Host & founder. Former UX designer turned farmer. Prerna manages everything from the kitchen garden to the guest experience — often simultaneously.',
    source:      'Host & Founder',
    variant:     'review',
  },
  {
    title:       'Ramesh Pant',
    description: 'Prerna\'s father, the original planter of the forest. He leads the morning bird walks and knows every tree on the property by name.',
    source:      'Head Naturalist',
    variant:     'review',
  },
  {
    title:       'Sunita Pant',
    description: "The heart of the kitchen. Sunita's recipes are 40 years of Kumaoni home cooking — the kind you can't find in a restaurant.",
    source:      'Head Chef & Host',
    variant:     'review',
  },
]

export default function About() {
  return (
    <div className="min-h-screen bg-mist dark:bg-forest-dark">
      <Navbar />

      {/* ── Page Header ── */}
      <section className="relative pt-32 pb-20 bg-primary-900 dark:bg-forest-deeper overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=60&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sage text-xs font-semibold uppercase tracking-widest mb-4">
            About Trishul Eco-Homestays
          </p>
          <h1 className="font-display font-bold text-5xl sm:text-6xl text-white mb-6 leading-tight">
            A forest grown with<br />
            <span className="italic text-sage">intention.</span>
          </h1>
          <p className="text-primary-200/80 text-lg max-w-2xl mx-auto leading-relaxed">
            We are a family home in the Kumaon Himalayas that opens its doors to
            travellers who want something more than a hotel — a real experience of the
            mountain forest.
          </p>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { icon: <TreePine className="w-5 h-5" />, value: '400+', label: 'Trees Planted' },
              { icon: <Users    className="w-5 h-5" />, value: '1,200+', label: 'Guests Hosted' },
              { icon: <Heart    className="w-5 h-5" />, value: '35+',   label: 'Years of Family' },
              { icon: <MapPin   className="w-5 h-5" />, value: '7,200', label: 'Feet Elevation' },
            ].map(({ icon, value, label }) => (
              <div key={label} className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl
                                bg-primary-50 dark:bg-primary-900/30 text-primary-500 dark:text-sage mb-3">
                  {icon}
                </div>
                <div className="font-display font-bold text-3xl text-gray-900 dark:text-white leading-none mb-1">
                  {value}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Timeline ── */}
      <section className="py-20 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-teak text-xs font-semibold uppercase tracking-widest mb-3">History</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
              How the forest grew.
            </h2>
          </div>

          {/* Timeline list */}
          <ol className="relative border-l-2 border-primary-200 dark:border-primary-800 space-y-10 pl-8">
            {MILESTONES.map(({ year, event }) => (
              <li key={year} className="relative">
                {/* Dot */}
                <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-white dark:bg-gray-900
                                border-2 border-primary-500 dark:border-sage" aria-hidden="true" />
                <span className="inline-block text-xs font-bold text-primary-600 dark:text-sage
                                 uppercase tracking-widest bg-primary-50 dark:bg-primary-900/30
                                 px-2.5 py-1 rounded-full mb-2">
                  {year}
                </span>
                <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">{event}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Meet the Team ── */}
      <section className="py-20 sm:py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14">
            <p className="text-teak text-xs font-semibold uppercase tracking-widest mb-3">The Family</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              The people behind the stay.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEAM.map(member => (
              <Card key={member.title} variant="review" {...member} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Location ── */}
      <section id="location" className="py-20 sm:py-24 bg-mist dark:bg-forest-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-teak text-xs font-semibold uppercase tracking-widest mb-4">Find Us</p>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Getting here is<br />
                <span className="text-primary-500 dark:text-sage italic">half the adventure.</span>
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-8">
                <p><strong className="text-gray-900 dark:text-white">By road:</strong> 5.5 hours from Kathgodam (the nearest railhead) via NH09 and the Pithoragarh road. We recommend leaving by 6 am to arrive before dark.</p>
                <p><strong className="text-gray-900 dark:text-white">Nearest town:</strong> Munsiyari, 12 km. Full provisions available.</p>
                <p><strong className="text-gray-900 dark:text-white">Airport:</strong> Pantnagar, 280 km. Taxis available; we can arrange pickup on request.</p>
              </div>
              <Button variant="outline" onClick={() => window.open('https://maps.google.com', '_blank')}>
                <MapPin className="w-4 h-4" />
                Open in Google Maps
              </Button>
            </div>

            {/* Static map placeholder */}
            <div className="bg-gray-200 dark:bg-gray-800 rounded-2xl h-80 flex items-center justify-center overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80&auto=format&fit=crop"
                alt="Map view of Munsiyari region"
                className="w-full h-full object-cover rounded-2xl"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
