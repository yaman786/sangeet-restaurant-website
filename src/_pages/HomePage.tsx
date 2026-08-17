"use client";
import React, { useState, useEffect } from 'react';
import { useNavigate } from '@/utils/router-mock';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';

import logo from '../assets/images/logo.png';
import ReviewsSection from '../components/ReviewsSection';
import { sanitizePhoneNumber } from '../utils/sanitizePhone';

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

const HomePage = ({ menuItems, reviews, events, cmsConfig }: any) => {
  const navigate = useNavigate();
  const [currentEventsSlide, setCurrentEventsSlide] = useState(0);

  // Parse CMS dynamic config
  const heroData = cmsConfig?.hero || {
    title: "South Asian Fine Dining in Wan Chai",
    subtitle: "Tandoori grills, regional curries, and craft cocktails. Now open in Hong Kong.",
    image_url: "/images/hero-interior.jpg",
    primary_cta_text: "Reserve a Table",
    primary_cta_link: "/reservations",
    secondary_cta_text: "View Menu",
    secondary_cta_link: "/menu"
  };

  // Scroll-driven parallax for hero
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  // ── Data ──────────────────────────────────────────────────
  const UPCOMING_EVENTS = events || [];

  const JOURNEY_PILLARS = [
    {
      title: "Tandoori Grills & Fresh Breads",
      description: "Marinated meats, seafood, and vegetables cooked at high heat. Naans and rotis baked fresh to order.",
      stat: "Fresh",
      statLabel: "Baked to Order",
    },
    {
      title: "Slow-Cooked Regional Curries",
      description: "Time-honoured recipes from across South Asia. Whole spices roasted in-house. Rich gravies simmered for depth.",
      stat: "60+",
      statLabel: "Dishes on Menu",
    },
    {
      title: "A Warm, Considered Setting",
      description: "Private dining available. Cocktail bar. Designed for dinners, celebrations, and corporate events.",
      stat: "Wan Chai",
      statLabel: "Hong Kong",
    },
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activeEvents = (events || []).filter((event: any) => {
    const eventDate = new Date(event.date || event.event_date);
    return !isNaN(eventDate.getTime()) && eventDate >= today;
  });

  // Events carousel
  const paginateEvents = (direction: any) => {
    setCurrentEventsSlide(prev => {
      if (direction === 1) return prev === activeEvents.length - 1 ? 0 : prev + 1;
      return prev === 0 ? activeEvents.length - 1 : prev - 1;
    });
  };

  // ── Smooth fade-in animation config ──
  const fadeUp = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as any},
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
        {/* Background Image or Video with Parallax */}
        <motion.div className="absolute inset-0" style={{ y: heroY }}>
          {heroData.image_url && heroData.image_url.match(/\.(mp4|webm)$/i) ? (
            <video
              src={heroData.image_url}
              autoPlay
              loop
              muted
              playsInline
              className="object-cover scale-105 w-full h-full"
            />
          ) : (
            <Image
              src={heroData.image_url || "/images/hero-interior.jpg"}
              alt="Sangeet Restaurant dining ambiance"
              fill
              priority
              unoptimized
              className="object-cover scale-105"
            />
          )}
        </motion.div>

        {/* Cinematic Overlay — warm fine-dining vignette */}
        <div className="absolute inset-0 bg-linear-to-b from-sangeet-neutral-950/60 via-sangeet-neutral-950/25 to-sangeet-neutral-950/85 z-10" />

        {/* Hero Content */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-20 text-center px-5 max-w-4xl mx-auto"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as any}}
            className="mb-8"
          >
            <Image
              src={logo}
              alt="Sangeet Restaurant"
              className="h-24 sm:h-32 md:h-36 w-auto mx-auto logo-navbar-dark drop-shadow-2xl"
            />
          </motion.div>

          {/* Headline — Playfair Display via CSS base layer */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] as any}}
            className="text-display-sm sm:text-display-md md:text-display-lg text-white mb-6"
          >
            {heroData.title || "South Asian Fine Dining in Wan Chai"}
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] as any}}
            className="text-body-lg sm:text-heading-sm text-sangeet-neutral-300 mb-10 max-w-2xl mx-auto font-sans"
          >
            {heroData.subtitle || "Tandoori grills, regional curries, and craft cocktails. Now open in Hong Kong."}
          </motion.p>

          {/* Single Primary CTA + Ghost Secondary */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] as any}}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              onClick={() => navigate(heroData.primary_cta_link || '/reservations')}
              className="btn-primary text-heading-sm px-10 py-4"
            >
              {heroData.primary_cta_text || "Reserve a Table"}
            </button>
            <button
              onClick={() => navigate(heroData.secondary_cta_link || '/menu')}
              className="btn-secondary px-8 py-4"
            >
              {heroData.secondary_cta_text || "View Menu"}
            </button>
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
          OUR STORY / THE THREE PILLARS — Elegant 3-column grid
          Benchmarked: Stripe features section, Gymkhana & Semma
      ─────────────────────────────────────────────────────── */}
      <section className="section-padding bg-sangeet-neutral-950">
        <div className="max-w-6xl mx-auto container-padding">
          {/* Section Header */}
          <motion.div {...fadeUp} className="text-center mb-16 md:mb-20">
            <span className="section-badge mb-4">What We Do</span>
            <h2 className="section-title">
              Authentic Cooking.{' '}
              <span className="text-gradient-gold italic">Refined Setting.</span>
            </h2>
            <p className="section-subtitle">
              Three elements define dining at Sangeet — the tandoor, the spice work, and the room.
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
                transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] as any}}
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
            <Link href="/about"
              className="btn-ghost inline-flex items-center gap-2 text-sangeet-400 hover:text-sangeet-300"
            >
              Learn More About Us
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>


      {/* ───────────────────────────────────────────────────────
          DINING EXPERIENCE / THE SPACE — Split image + text
          Benchmarked: Gymkhana & Benares dining room showcases
      ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px] lg:min-h-[600px]">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden min-h-[350px] lg:min-h-full"
          >
            <Image
              src="/images/hero-interior.jpg"
              alt="Sangeet Restaurant interior dining room"
              fill
              unoptimized
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-r from-transparent to-sangeet-neutral-950/30 hidden lg:block" />
          </motion.div>

          {/* Content Side */}
          <div className="flex items-center bg-sangeet-neutral-900 p-8 md:p-14 lg:p-18">
            <motion.div {...fadeUp} className="max-w-lg">
              <span className="section-badge mb-6">The Space</span>
              <h2 className="font-display text-display-sm md:text-display-md text-sangeet-neutral-100 mb-6">
                A Setting Designed for{' '}
                <span className="text-gradient-gold italic">Every Occasion</span>
              </h2>
              <p className="text-body-md text-sangeet-neutral-400 mb-8 leading-relaxed">
                From quiet dinners to family celebrations and corporate events. Sangeet features a main dining room with comfortable table and booth seating, a full cocktail bar, and a private room for group bookings.
              </p>

              {/* 3 Feature cards */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
                {[
                  { title: "Main Dining", subtitle: "Table & booths" },
                  { title: "Cocktail Bar", subtitle: "Craft drinks" },
                  { title: "Private Events", subtitle: "Group dining" },
                ].map((item, i) => (
                  <div key={i} className="text-center p-3 sm:p-4 rounded-xl bg-sangeet-neutral-800/50 border border-sangeet-neutral-700/30">
                    <div className="text-heading-sm sm:text-heading-md text-sangeet-400 font-sans font-semibold mb-1">{item.title}</div>
                    <div className="text-caption text-sangeet-neutral-400">{item.subtitle}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/reservations')}
                className="btn-primary"
              >
                Reserve a Table
              </button>
            </motion.div>
          </div>
        </div>
      </section>


      {/* ───────────────────────────────────────────────────────
          EVENTS — Clean carousel
          Benchmarked: Linear feature showcase
      ─────────────────────────────────────────────────────── */}
      {/* ───────────────────────────────────────────────────────
          EVENTS — Luxury Cinematic Showcase & Strategic Controls
          Benchmarked: Michelin Guide, Oberoi Luxury Resorts
      ─────────────────────────────────────────────────────── */}
      <section className="section-padding bg-sangeet-neutral-950 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-sangeet-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto container-padding relative z-10">
          {/* Section Header with Strategic Control Bar */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <motion.div {...fadeUp} className="max-w-2xl">
              <span className="section-badge mb-3 inline-block">Curated Celebrations</span>
              <h2 className="section-title text-left mb-3">
                Upcoming{' '}
                <span className="text-gradient-gold italic">Festivals & Soirées</span>
              </h2>
              <p className="text-body-md text-sangeet-neutral-400 leading-relaxed">
                Immerse yourself in authentic South Asian festivities, classical musical evenings, and exclusive culinary banquets crafted by our master chefs.
              </p>
            </motion.div>

            {/* Strategic Header Navigation Controls (Desktop) */}
            {activeEvents.length > 1 && (
              <motion.div {...fadeUp} className="hidden md:flex items-center gap-3 self-start md:self-end">
                <span className="text-xs text-sangeet-neutral-500 font-mono tracking-widest mr-2">
                  0{currentEventsSlide + 1} / 0{activeEvents.length}
                </span>
                <button
                  onClick={() => paginateEvents(-1)}
                  className="w-12 h-12 rounded-full bg-sangeet-neutral-900 border border-sangeet-neutral-700/60 text-sangeet-neutral-300 hover:text-sangeet-950 hover:bg-sangeet-400 hover:border-sangeet-400 transition-all duration-300 flex items-center justify-center shadow-lg active:scale-95 cursor-pointer"
                  aria-label="Previous event"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => paginateEvents(1)}
                  className="w-12 h-12 rounded-full bg-sangeet-neutral-900 border border-sangeet-neutral-700/60 text-sangeet-neutral-300 hover:text-sangeet-950 hover:bg-sangeet-400 hover:border-sangeet-400 transition-all duration-300 flex items-center justify-center shadow-lg active:scale-95 cursor-pointer"
                  aria-label="Next event"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </motion.div>
            )}
          </div>

          {(() => {
            if (activeEvents.length === 0) {
              return (
                <div className="bg-sangeet-neutral-900 border border-sangeet-neutral-800 rounded-3xl p-8 md:p-12 text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-r from-sangeet-400/5 via-transparent to-sangeet-red-500/5" />
                  <div className="relative z-10">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-sangeet-400/20 text-sangeet-400 text-xs font-semibold uppercase tracking-wider mb-4 border border-sangeet-400/30">
                      Private Dining & Events
                    </span>
                    <h3 className="font-display text-2xl md:text-3xl text-sangeet-neutral-100 font-bold mb-4">
                      Host Your Celebration With Us
                    </h3>
                    <p className="text-sangeet-neutral-400 text-base md:text-lg max-w-2xl mx-auto mb-8">
                      Looking for a private venue for birthdays, corporate dinners, or family celebrations? Reserve our dining room with customized South Asian menus and dedicated service.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link href="/contact" className="btn-primary px-8 py-3 text-sm">
                        Inquire for Private Events
                      </Link>
                      <Link href="/reservations" className="btn-ghost px-8 py-3 text-sm border border-sangeet-neutral-700">
                        Reserve a Table
                      </Link>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <>
                {/* Desktop Events Showcase Card */}
                <div className="hidden md:block">
                  <div className="relative">
                    <div className="overflow-hidden rounded-3xl border border-sangeet-neutral-800/80 shadow-2xl bg-sangeet-neutral-950">
                      <div
                        className="flex transition-transform duration-500 ease-out"
                        style={{ transform: `translateX(-${currentEventsSlide * 100}%)` }}
                      >
                        {activeEvents.map((event: any, index: number) => (
                          <div key={event.id || index} className="w-full flex-shrink-0">
                            <div className="relative h-[520px] group overflow-hidden">
                              <Image
                                src={event.image_url}
                                alt={event.title}
                                fill
                                sizes="(max-width: 1200px) 100vw, 1200px"
                                priority={index === 0}
                                className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out-expo"
                              />

                              {/* Multi-Layer Cinematic Contrast Gradients */}
                              <div className="absolute inset-0 bg-linear-to-t from-sangeet-neutral-950 via-sangeet-neutral-950/75 to-transparent opacity-95" />
                              <div className="absolute inset-0 bg-linear-to-r from-sangeet-neutral-950/95 via-sangeet-neutral-950/60 to-transparent" />

                              {/* Content Overlay */}
                              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-20 flex flex-col justify-end">
                                {/* Top Badges Row: Category + Price with Clear High-Contrast Luxury Badges */}
                                <div className="flex flex-wrap items-center gap-3 mb-5">
                                  {event.category && (
                                    <span className="px-3.5 py-1.5 rounded-full bg-sangeet-400/20 text-sangeet-300 text-xs font-semibold uppercase tracking-wider border border-sangeet-400/40 backdrop-blur-md shadow-md">
                                      {event.category}
                                    </span>
                                  )}
                                  {event.price && (
                                    <span className="px-4 py-1.5 rounded-full bg-sangeet-neutral-900/90 text-sangeet-400 font-bold text-sm border border-sangeet-400/50 shadow-xl backdrop-blur-md flex items-center gap-1.5">
                                      <span>💎</span>
                                      <span>{event.price}</span>
                                    </span>
                                  )}
                                  {event.is_featured && (
                                    <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-medium border border-red-500/30 backdrop-blur-md">
                                      ★ Featured
                                    </span>
                                  )}
                                </div>

                                {/* Event Title */}
                                <h3 className="font-display text-display-sm lg:text-display-md text-white mb-3 max-w-3xl drop-shadow-md leading-tight">
                                  {event.title}
                                </h3>

                                {/* Event Description */}
                                <p className="text-body-md text-sangeet-neutral-200 mb-6 max-w-2xl leading-relaxed drop-shadow-sm font-sans">
                                  {event.description}
                                </p>

                                {/* Date, Time & Direct Booking CTA Row */}
                                <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-t border-sangeet-neutral-700/40">
                                  <div className="flex flex-wrap items-center gap-5 text-sm text-sangeet-neutral-300 font-medium">
                                    <div className="flex items-center gap-2 bg-sangeet-neutral-900/60 px-3.5 py-2 rounded-lg border border-sangeet-neutral-800 backdrop-blur-md">
                                      <svg className="w-4 h-4 text-sangeet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                      <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                    </div>

                                    {event.time && (
                                      <div className="flex items-center gap-2 bg-sangeet-neutral-900/60 px-3.5 py-2 rounded-lg border border-sangeet-neutral-800 backdrop-blur-md">
                                        <svg className="w-4 h-4 text-sangeet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{event.time}</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Direct Action Button */}
                                  <button
                                    onClick={() => navigate('/reservations')}
                                    className="btn-primary px-8 py-3 text-sm font-semibold shadow-xl flex items-center gap-2 group-hover:shadow-sangeet-400/20"
                                  >
                                    <span>Reserve For This Event</span>
                                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Progress Indicator Dots */}
                    {activeEvents.length > 1 && (
                      <div className="flex justify-center items-center gap-2.5 mt-6">
                        {activeEvents.map((_: any, index: number) => (
                          <button
                            key={index}
                            onClick={() => setCurrentEventsSlide(index)}
                            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                              index === currentEventsSlide
                                ? 'w-10 bg-sangeet-400 shadow-md shadow-sangeet-400/40'
                                : 'w-2.5 bg-sangeet-neutral-700 hover:bg-sangeet-neutral-500'
                            }`}
                            aria-label={`Go to event ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Events — Horizontal scroll */}
                <div className="md:hidden">
                  <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide -mx-5 px-5 snap-x snap-mandatory">
                    {activeEvents.map((event: any, index: number) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex-shrink-0 w-[300px] snap-center rounded-2xl overflow-hidden bg-sangeet-neutral-900 border border-sangeet-neutral-800 shadow-xl flex flex-col justify-between"
                      >
                        <div className="relative h-48 w-full">
                          <Image src={event.image_url} alt={event.title} fill sizes="300px" className="object-cover" />
                          <div className="absolute inset-0 bg-linear-to-t from-sangeet-neutral-900 via-sangeet-neutral-900/40 to-transparent" />
                          
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                            {event.category && (
                              <span className="px-2.5 py-1 rounded-full bg-sangeet-950/80 text-sangeet-300 text-xs font-semibold uppercase tracking-wider border border-sangeet-400/40 backdrop-blur-md">
                                {event.category}
                              </span>
                            )}
                            {event.price && (
                              <span className="px-2.5 py-1 rounded-full bg-sangeet-950/90 text-sangeet-400 text-xs font-bold border border-sangeet-400/50 backdrop-blur-md shadow-md">
                                {event.price}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-display text-heading-sm text-sangeet-neutral-100 mb-2 line-clamp-1">{event.title}</h3>
                            <p className="text-caption text-sangeet-neutral-400 mb-4 line-clamp-2 leading-relaxed">{event.description}</p>
                          </div>
                          <div className="pt-3 border-t border-sangeet-neutral-800/80 flex items-center justify-between">
                            <span className="text-xs text-sangeet-neutral-400 font-medium">
                              {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} {event.time && `• ${event.time.split('–')[0].trim()}`}
                            </span>
                            <button
                              onClick={() => navigate('/reservations')}
                              className="text-xs font-bold text-sangeet-400 hover:text-sangeet-300 flex items-center gap-1"
                            >
                              <span>Reserve</span>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </>
            );
          })()}
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
              <span className="text-gradient-gold italic">A Symphony of Flavors</span>?
            </h2>
            <p className="text-body-lg text-sangeet-neutral-400 mb-10 max-w-xl mx-auto">
              Reserve your table for our Grand Opening in Wan Chai and enjoy an unforgettable evening of culinary excellence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/reservations"
                className="btn-primary text-heading-sm px-10 py-4"
              >
                Reserve Your Table
              </Link>
              {(() => {
                const phone = sanitizePhoneNumber('+852 2345 6789');
                return (
                  <a
                    href={phone.telHref}
                    className="btn-ghost text-sangeet-neutral-300 hover:text-sangeet-400"
                  >
                    Or call us: {phone.raw}
                  </a>
                );
              })()}
            </div>

            {/* Trust bar */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-10 mt-14">
              {[
                { label: "Premium Sourced", sub: "Finest Fresh Ingredients" },
                { label: "Clay Tandoor Oven", sub: "Live Charcoal Cooking" },
                { label: "Lunch & Dinner", sub: "Open Daily in Wan Chai" },
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