import { Calendar, Star, ArrowDown } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight: '100svh' }}>
      {/* Background */}
      <div className="absolute inset-0" aria-hidden="true">
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=85&auto=format&fit=crop"
          alt=""
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/75" />
        <div className="absolute inset-0 bg-primary-900/10" />
      </div>

      {/* Content — fixed min-height grid so stats never bleed into navbar */}
      <div className="relative z-10 flex flex-col justify-between w-full h-full"
           style={{ minHeight: '100svh' }}>

        {/* Top spacer — exactly the navbar height */}
        <div className="h-16 lg:h-18 flex-shrink-0" />

        {/* Main hero copy — fills the remaining space */}
        <div className="flex-1 flex items-center">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-2xl xl:max-w-3xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 mb-6
                              bg-white/10 backdrop-blur-sm border border-white/20
                              text-white/90 text-xs font-medium px-4 py-2 rounded-full">
                <Star className="w-3.5 h-3.5 fill-teak text-teak flex-shrink-0" />
                <span>Eco Homestay · Kumaon Himalayas · 7,200 ft</span>
              </div>

              {/* Headline */}
              <h1 className="font-display font-bold text-white leading-[1.1] mb-6
                             text-5xl sm:text-6xl lg:text-7xl">
                Where the{' '}
                <em className="not-italic text-sage">forest</em>
                {' '}is<br className="hidden sm:block" />
                your home.
              </h1>

              <p className="text-white/75 text-base sm:text-lg leading-relaxed mb-10 max-w-lg">
                Trishul Eco-Homestays is a family-run retreat surrounded by oak and rhododendron
                forests. Book directly with us — no OTA fees, no middlemen.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#rooms"
                   className="inline-flex items-center justify-center gap-2
                              bg-primary-500 hover:bg-primary-600
                              dark:bg-cyan dark:text-void dark:hover:bg-sage
                              text-white font-semibold text-sm
                              px-8 py-4 rounded-full
                              transition-all duration-200
                              hover:shadow-2xl hover:shadow-primary-500/30 hover:-translate-y-0.5">
                  <Calendar className="w-4 h-4" />
                  Check Availability
                </a>
                <a href="/enquiry"
                   className="inline-flex items-center justify-center
                              bg-white/10 hover:bg-white/20 backdrop-blur-sm
                              border border-white/30 hover:border-white/50
                              text-white font-semibold text-sm
                              px-8 py-4 rounded-full transition-all duration-200">
                  Book Direct
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Stats strip — always at the bottom, never floats up */}
        <div className="w-full border-t border-white/15 bg-black/20 backdrop-blur-sm flex-shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 sm:gap-x-12">
              {[
                { value: '7,200 ft', label: 'Elevation' },
                { value: '4.9 ★',   label: '120+ reviews' },
                { value: '₹0',      label: 'OTA commission' },
                { value: '18–25%',  label: 'You save' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div className="font-display font-bold text-white text-xl sm:text-2xl leading-none">
                    {value}
                  </div>
                  <div className="text-white/50 text-[10px] uppercase tracking-widest mt-0.5">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <a href="#story" aria-label="Scroll down"
           className="absolute bottom-20 left-1/2 -translate-x-1/2
                      flex flex-col items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors">
          <span className="text-[9px] uppercase tracking-[0.2em]">Scroll</span>
          <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
        </a>
      </div>
    </section>
  )
}
