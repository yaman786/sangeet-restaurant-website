"use client";
import React, { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Phone, Mail, MapPin, UtensilsCrossed, Flame, Wine } from 'lucide-react';
import Image from 'next/image';
import logo from '../assets/images/logo.png';

/**
 * GrandOpeningLockScreen Component
 * 
 * Full-screen luxury lock screen for production launch.
 * - Bypasses automatically on localhost / 127.0.0.1 for development
 * - Bypasses on /admin, /kitchen, and /login for staff access
 * - Bypasses with ?unlock=sangeet2026 for authorized previewers
 * - 100% locked without dismiss button for public visitors on production
 */
export default function DigitalPreviewModal() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Default to locked; only unlock if explicitly allowed (localhost, admin, or token)
  const [isLocked, setIsLocked] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // 1. Staff & Admin Routes: Always open
    if (
      pathname?.startsWith('/admin') ||
      pathname?.startsWith('/kitchen') ||
      pathname?.startsWith('/login')
    ) {
      setIsLocked(false);
      return;
    }

    // 2. Localhost & Development: Always open for developers
    const hostname = window.location.hostname;
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.endsWith('.local')
    ) {
      setIsLocked(false);
      return;
    }

    // 3. Secret Developer/Client Bypass Token (?unlock=sangeet2026, ?preview=sangeet, or ?sangeet2026)
    const unlockParam = searchParams?.get('unlock') || searchParams?.get('preview');
    const hasDirectKey = searchParams?.has('sangeet2026') || searchParams?.has('sangeet') || searchParams?.has('preview');
    if (
      unlockParam === 'sangeet2026' ||
      unlockParam === 'sangeet' ||
      unlockParam === 'secret' ||
      hasDirectKey
    ) {
      localStorage.setItem('sangeet_dev_unlock', 'true');
      setIsLocked(false);
      return;
    }

    // 4. Check persistent unlock storage
    if (localStorage.getItem('sangeet_dev_unlock') === 'true') {
      setIsLocked(false);
      return;
    }

    // 5. Production Domain: 100% locked for public
    setIsLocked(true);
  }, [pathname, searchParams]);

  // If not mounted yet or if unlocked, don't show lock overlay
  if (!mounted || !isLocked) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-sangeet-neutral-950 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto select-none">
      {/* Background Architectural Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Image
          src="/images/hero-interior.jpg"
          alt="Sangeet Restaurant Ambience"
          fill
          priority
          unoptimized
          className="object-cover opacity-20 filter brightness-90 contrast-110 scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-b from-sangeet-neutral-950/90 via-sangeet-neutral-950/80 to-sangeet-neutral-950" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Luxury Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-xl bg-sangeet-neutral-900/95 backdrop-blur-2xl border border-amber-500/30 rounded-3xl p-6 sm:p-10 shadow-[0_0_80px_rgba(212,175,55,0.2)] z-10 text-center my-auto"
      >
        {/* Ambient Corner Accents */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-sangeet-red-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Golden Emblem Logo */}
        <div className="relative mb-6 flex flex-col items-center justify-center">
          <div className="relative mb-3">
            <div className="absolute -inset-4 bg-radial from-amber-400/30 via-amber-500/10 to-transparent blur-xl pointer-events-none" />
            <Image
              src={logo}
              alt="Sangeet Restaurant"
              priority
              className="relative h-20 sm:h-24 md:h-28 w-auto object-contain filter brightness-110 contrast-105 drop-shadow-[0_12px_28px_rgba(212,175,55,0.4)]"
            />
          </div>

          {/* Grand Opening Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-widest shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Grand Opening • Coming Soon</span>
          </div>
        </div>

        {/* Headline & Story */}
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
          A Symphony of <span className="text-gradient-gold italic">South Asian Gastronomy</span>
        </h1>

        <p className="text-sm sm:text-base text-sangeet-neutral-300 leading-relaxed max-w-md mx-auto mb-8 font-sans">
          We are putting the final touches on our luxury dining sanctuary in Wan Chai. Our doors and online table reservations will be officially opening soon.
        </p>

        {/* 3 Core Highlights */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="p-3 sm:p-4 rounded-2xl bg-sangeet-neutral-950/80 border border-sangeet-neutral-800/80">
            <Flame className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
            <span className="block text-xs font-bold text-sangeet-neutral-200">Clay Tandoor</span>
            <span className="block text-[10px] text-amber-400/80">Charcoal Fired</span>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-sangeet-neutral-950/80 border border-sangeet-neutral-800/80">
            <UtensilsCrossed className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
            <span className="block text-xs font-bold text-sangeet-neutral-200">Artisan Spices</span>
            <span className="block text-[10px] text-amber-400/80">Signature Curries</span>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-sangeet-neutral-950/80 border border-sangeet-neutral-800/80">
            <Wine className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
            <span className="block text-xs font-bold text-sangeet-neutral-200">Private Dining</span>
            <span className="block text-[10px] text-amber-400/80">Cocktail Lounge</span>
          </div>
        </div>

        {/* Contact & Private Event Inquiries */}
        <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 border border-amber-500/20 text-center">
          <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-3">
            Private Events & Advance Inquiries
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs text-sangeet-neutral-300">
            <a
              href="tel:+85223456789"
              className="inline-flex items-center gap-1.5 hover:text-amber-400 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono">+852 26568820</span>
            </a>

            <a
              href="mailto:info@sangeet.hk"
              className="inline-flex items-center gap-1.5 hover:text-amber-400 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>info@sangeet.hk</span>
            </a>

            <span className="inline-flex items-center gap-1.5 text-sangeet-neutral-400">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Wan Chai, Hong Kong</span>
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
