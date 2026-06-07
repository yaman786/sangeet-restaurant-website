import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import logo from '../assets/images/logo.png';
import ReviewsSection from '../components/ReviewsSection';

/**
 * HomePage Component — Premium Landing Page
 * Benchmarked against: Stripe, Vercel, Apple, Airbnb
 * 
 * Design principles:
 * - Radical simplification (reduce cognitive load)
 * - Single dominant CTA per section
 * - Generous whitespace (luxury = breathing room)
 * - Subtle, smooth animations (never jarring)
 * - Playfair Display for headings, Outfit for body
 */
const HomePage = ({ menuItems, reviews, events }) => {
  const navigate = useNavigate();
  const [currentEventsSlide, setCurrentEventsSlide] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Scroll-driven parallax for hero
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  const isOpen = currentTime.getHours() >= 18 && currentTime.getHours() < 23;

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // ── Data ──────────────────────────────────────────────────
  const UPCOMING_EVENTS = [
    {
      id: 1,
      title: "Diwali Festival Celebration",
      description: "A spectacular evening of traditional cuisine, live music, and cultural performances.",
      date: "2024-11-12",
      time: "6:00 PM – 11:00 PM",
      image_url: "https://images.unsplash.com/photo-1606220838315-056192d5e927?w=800&h=600&fit=crop",
      category: "Cultural Festival",
      price: "From $45",
    },
    {
      id: 2,
      title: "Bollywood Night",
      description: "Live Bollywood music, dance performances, and a curated menu inspired by Indian cinema.",
      date: "2024-11-25",
      time: "8:00 PM – 1:00 AM",
      image_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
      category: "Entertainment",
      price: "From $35",
    },
    {
      id: 3,
      title: "Corporate Lunch Special",
      description: "Tailored group menus and private dining for business meetings and corporate events.",
      date: "2024-12-02",
      time: "12:00 PM – 3:00 PM",
      image_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
      category: "Business",
      price: "From $25",
    },
  ];

  const JOURNEY_PILLARS = [
    {
      title: "Heritage Recipes",
      description: "Every dish draws from generations of family tradition, preserving the authentic flavors of South Asia.",
      stat: "100+",
      statLabel: "Family Recipes",
    },
    {
      title: "Artisan Craft",
      description: "Our chef brings decades of mastery in traditional techniques, from tandoor to tawa.",
      stat: "5,300",
      statLabel: "Sq Ft Space",
    },
    {
      title: "Vibrant Community",
      description: "Located in the heart of Wanchai, we bring the warmth of South Asian hospitality to Hong Kong.",
      stat: "150+",
      statLabel: "Seat Capacity",
    },
  ];

  // Events carousel
  const navigateEventsCarousel = (direction) => {
    setCurrentEventsSlide(prev => {
      if (direction === 1) return prev === UPCOMING_EVENTS.length - 1 ? 0 : prev + 1;
      return prev === 0 ? UPCOMING_EVENTS.length - 1 : prev - 1;
    });
  };

  // ── Smooth fade-in animation config ──
  const fadeUp = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  };

  // ════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen">

      {/* ───────────────────────────────────────────────────────
          HERO SECTION — Full-bleed cinematic, single CTA
          Benchmarked: Apple product pages, Airbnb homepage
      ─────────────────────────────────────────────────────── */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax */}
        <motion.div className="absolute inset-0" style={{ y: heroY }}>
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&h=1080&fit=crop"
            alt="Sangeet Restaurant dining ambiance"
            className="w-full h-full object-cover scale-110"
          />
        </motion.div>

        {/* Cinematic Overlay — deep vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-sangeet-neutral-950/70 via-sangeet-neutral-950/40 to-sangeet-neutral-950/90 z-10" />

        {/* Hero Content */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-20 text-center px-5 max-w-4xl mx-auto"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <img
              src={logo}
              alt="Sangeet Restaurant"
              className="h-24 sm:h-32 md:h-36 w-auto mx-auto logo-navbar-dark drop-shadow-2xl"
            />
          </motion.div>

          {/* Headline — Playfair Display via CSS base layer */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-display-sm sm:text-display-md md:text-display-lg text-white mb-6"
          >
            Experience{' '}
            <span className="text-gradient-gold italic">
              South Asian Elegance
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-body-lg sm:text-heading-sm text-sangeet-neutral-300 mb-10 max-w-2xl mx-auto font-sans"
          >
            Authentic cuisine rooted in tradition, crafted with passion, served in the heart of Hong Kong.
          </motion.p>

          {/* Single Primary CTA + Ghost Secondary */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              onClick={() => navigate('/reservations')}
              className="btn-primary text-heading-sm px-10 py-4"
            >
              Reserve Your Table
            </button>
            <button
              onClick={() => navigate('/menu')}
              className="btn-secondary px-8 py-4"
            >
              Explore the Menu
            </button>
          </motion.div>

          {/* Minimal Status Pill */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="mt-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sangeet-neutral-900/60 backdrop-blur-md border border-sangeet-neutral-700/30"
          >
            <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-caption text-sangeet-neutral-300">
              {isOpen ? 'Open Now · Closes at 11 PM' : 'Closed · Opens at 6 PM'}
            </span>
            <span className="text-caption text-sangeet-neutral-500">· Wanchai, HK</span>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="w-6 h-10 border border-sangeet-neutral-500/40 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [2, 14, 2] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-1 h-3 bg-sangeet-400/60 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>


      {/* ───────────────────────────────────────────────────────
          OUR STORY — Elegant 3-column grid
          Benchmarked: Stripe features section
      ─────────────────────────────────────────────────────── */}
      <section className="section-padding bg-sangeet-neutral-950">
        <div className="max-w-6xl mx-auto container-padding">
          {/* Section Header */}
          <motion.div {...fadeUp} className="text-center mb-16 md:mb-20">
            <span className="section-badge mb-4">Our Story</span>
            <h2 className="section-title">
              A Culinary Heritage,{' '}
              <span className="text-gradient-gold italic">Reimagined</span>
            </h2>
            <p className="section-subtitle">
              From humble family kitchens to the vibrant heart of Wanchai — every dish tells a story of tradition, passion, and artistry.
            </p>
          </motion.div>

          {/* 3-Column Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {JOURNEY_PILLARS.map((pillar, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="card group text-center p-8 md:p-10"
              >
                {/* Stat — the visual anchor */}
                <div className="text-display-md md:text-display-lg text-sangeet-400 font-display mb-2 transition-all duration-300 group-hover:text-sangeet-300">
                  {pillar.stat}
                </div>
                <div className="text-caption text-sangeet-neutral-500 uppercase tracking-widest mb-6">
                  {pillar.statLabel}
                </div>

                {/* Divider */}
                <div className="w-8 h-px bg-sangeet-400/30 mx-auto mb-6" />

                {/* Content */}
                <h3 className="text-heading-md text-sangeet-neutral-100 font-sans font-semibold mb-3">
                  {pillar.title}
                </h3>
                <p className="text-body-sm text-sangeet-neutral-400 leading-relaxed">
                  {pillar.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Story CTA */}
          <motion.div {...fadeUp} className="text-center mt-14">
            <Link
              to="/about"
              className="btn-ghost inline-flex items-center gap-2 text-sangeet-400 hover:text-sangeet-300"
            >
              Read Our Full Story
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>


      {/* ───────────────────────────────────────────────────────
          DINING EXPERIENCE — Full-bleed image + text
          Benchmarked: Airbnb experience pages
      ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px] lg:min-h-[600px]">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden"
          >
            <img
              src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop"
              alt="Chef preparing authentic South Asian dishes"
              loading="lazy"
              className="w-full h-full object-cover min-h-[350px] lg:min-h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-sangeet-neutral-950/30 hidden lg:block" />
          </motion.div>

          {/* Content Side */}
          <div className="flex items-center bg-sangeet-neutral-900 p-8 md:p-14 lg:p-18">
            <motion.div {...fadeUp} className="max-w-lg">
              <span className="section-badge mb-6">The Experience</span>
              <h2 className="font-display text-display-sm md:text-display-md text-sangeet-neutral-100 mb-6">
                Where Every Meal{' '}
                <span className="text-gradient-gold italic">Becomes a Memory</span>
              </h2>
              <p className="text-body-md text-sangeet-neutral-400 mb-8 leading-relaxed">
                Step into an atmosphere of warmth and sophistication. Our 5,300 sq ft space features three distinct dining areas — each designed to create the perfect setting for family celebrations, intimate dinners, and corporate gatherings.
              </p>

              {/* Mini stats row */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { value: "3", label: "Dining Areas" },
                  { value: "150+", label: "Seats" },
                  { value: "Private", label: "Dining Room" },
                ].map((item, i) => (
                  <div key={i} className="text-center p-3 rounded-xl bg-sangeet-neutral-800/50 border border-sangeet-neutral-700/30">
                    <div className="text-heading-lg text-sangeet-400 font-display">{item.value}</div>
                    <div className="text-caption text-sangeet-neutral-500">{item.label}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/reservations')}
                className="btn-primary"
              >
                Reserve Your Experience
              </button>
            </motion.div>
          </div>
        </div>
      </section>


      {/* ───────────────────────────────────────────────────────
          EVENTS — Clean carousel
          Benchmarked: Linear feature showcase
      ─────────────────────────────────────────────────────── */}
      <section className="section-padding bg-sangeet-neutral-950">
        <div className="max-w-6xl mx-auto container-padding">
          {/* Section Header */}
          <motion.div {...fadeUp} className="text-center mb-14">
            <span className="section-badge mb-4">Events</span>
            <h2 className="section-title">
              Upcoming{' '}
              <span className="text-gradient-gold italic">Celebrations</span>
            </h2>
            <p className="section-subtitle">
              Experience South Asian culture through curated festivals, performances, and exclusive dining events.
            </p>
          </motion.div>

          {/* Desktop Events Carousel */}
          <div className="hidden md:block">
            <div className="relative">
              <div className="overflow-hidden rounded-3xl">
                <div
                  className="flex transition-transform duration-700 ease-out-expo"
                  style={{ transform: `translateX(-${currentEventsSlide * 100}%)` }}
                >
                  {UPCOMING_EVENTS.map((event) => (
                    <div key={event.id} className="w-full flex-shrink-0">
                      <div className="relative h-[480px] group">
                        <img
                          src={event.image_url}
                          alt={event.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out-expo"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-sangeet-neutral-950/95 via-sangeet-neutral-950/30 to-transparent" />

                        {/* Content Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 rounded-full bg-sangeet-400/20 text-sangeet-400 text-caption font-semibold border border-sangeet-400/20">
                              {event.category}
                            </span>
                            <span className="text-sangeet-neutral-400 text-body-sm">{event.price}</span>
                          </div>
                          <h3 className="font-display text-display-sm text-white mb-3">{event.title}</h3>
                          <p className="text-body-md text-sangeet-neutral-300 mb-4 max-w-2xl">{event.description}</p>
                          <div className="flex items-center gap-4 text-body-sm text-sangeet-neutral-400">
                            <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            <span className="w-1 h-1 rounded-full bg-sangeet-neutral-600" />
                            <span>{event.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nav Arrows */}
              <button
                onClick={() => navigateEventsCarousel(-1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-sangeet-neutral-900/80 backdrop-blur-md border border-sangeet-neutral-700/30 text-sangeet-neutral-300 hover:text-sangeet-400 hover:border-sangeet-400/30 transition-all duration-200 flex items-center justify-center z-10"
                aria-label="Previous event"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => navigateEventsCarousel(1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-sangeet-neutral-900/80 backdrop-blur-md border border-sangeet-neutral-700/30 text-sangeet-neutral-300 hover:text-sangeet-400 hover:border-sangeet-400/30 transition-all duration-200 flex items-center justify-center z-10"
                aria-label="Next event"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Dots */}
              <div className="flex justify-center gap-2 mt-6">
                {UPCOMING_EVENTS.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentEventsSlide(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentEventsSlide
                        ? 'w-8 bg-sangeet-400'
                        : 'w-3 bg-sangeet-neutral-700 hover:bg-sangeet-neutral-600'
                    }`}
                    aria-label={`Go to event ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Events — Horizontal scroll */}
          <div className="md:hidden">
            <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide -mx-5 px-5">
              {UPCOMING_EVENTS.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex-shrink-0 w-[280px] rounded-2xl overflow-hidden bg-sangeet-neutral-900 border border-sangeet-neutral-800/50"
                >
                  <div className="relative h-44">
                    <img src={event.image_url} alt={event.title} loading="lazy" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-sangeet-neutral-900 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full bg-sangeet-400/20 text-sangeet-400 text-caption font-semibold border border-sangeet-400/20">
                        {event.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-heading-sm text-sangeet-neutral-100 mb-2 line-clamp-1">{event.title}</h3>
                    <p className="text-caption text-sangeet-neutral-400 mb-3 line-clamp-2">{event.description}</p>
                    <div className="flex items-center justify-between text-caption text-sangeet-neutral-500">
                      <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <span className="text-sangeet-400 font-semibold">{event.price}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ───────────────────────────────────────────────────────
          REVIEWS — Pulled from existing component
      ─────────────────────────────────────────────────────── */}
      <ReviewsSection />


      {/* ───────────────────────────────────────────────────────
          FINAL CTA — Clean, focused, premium
          Benchmarked: Stripe bottom CTA
      ─────────────────────────────────────────────────────── */}
      <section className="relative section-padding bg-sangeet-neutral-900 overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sangeet-400/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-3xl mx-auto container-padding text-center relative z-10">
          <motion.div {...fadeUp}>
            <h2 className="font-display text-display-md md:text-display-lg text-sangeet-neutral-100 mb-6">
              Ready to Experience{' '}
              <span className="text-gradient-gold italic">Authentic Flavors</span>?
            </h2>
            <p className="text-body-lg text-sangeet-neutral-400 mb-10 max-w-xl mx-auto">
              Book your table today and embark on a culinary journey through the rich traditions of South Asia.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/reservations"
                className="btn-primary text-heading-sm px-10 py-4"
              >
                Reserve Your Table
              </Link>
              <a
                href="tel:+85223456789"
                className="btn-ghost text-sangeet-neutral-300 hover:text-sangeet-400"
              >
                Or call us: +852 2345 6789
              </a>
            </div>

            {/* Trust bar */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-10 mt-14">
              {[
                { label: "Award Winning", sub: "Best South Asian 2024" },
                { label: "500+ Happy Guests", sub: "Customer Favorite" },
                { label: "Open Daily", sub: "6 PM – 11 PM" },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="text-body-sm text-sangeet-neutral-200 font-semibold">{item.label}</div>
                  <div className="text-caption text-sangeet-neutral-500">{item.sub}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;