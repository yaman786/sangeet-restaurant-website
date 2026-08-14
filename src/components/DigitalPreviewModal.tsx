"use client";
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Phone, X, UtensilsCrossed, Calendar, Award } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import logo from '../assets/images/logo.png';

export default function DigitalPreviewModal() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Don't show on admin, kitchen, or auth routes
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/kitchen') || pathname?.startsWith('/login')) {
      return;
    }
    const hasSeenPreview = sessionStorage.getItem('sangeet_preview_seen');
    if (!hasSeenPreview) {
      setIsOpen(true);
    }
  }, [pathname]);

  const handleDismiss = () => {
    setIsOpen(false);
    sessionStorage.setItem('sangeet_preview_seen', 'true');
  };

  if (!mounted) return null;
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/kitchen') || pathname?.startsWith('/login')) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop with frosted glass effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md sm:max-w-lg bg-linear-to-b from-sangeet-neutral-900 via-sangeet-neutral-900/98 to-sangeet-neutral-950 border border-amber-500/40 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-[0_0_60px_rgba(212,175,55,0.25)] overflow-hidden z-10 my-auto max-h-[94vh] flex flex-col justify-between"
          >
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-44 h-44 bg-sangeet-red-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-2 text-sangeet-neutral-400 hover:text-white hover:bg-sangeet-neutral-800/80 rounded-full transition-colors cursor-pointer z-20"
              aria-label="Close preview"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div>
              {/* SANGEET LOGO WITH AMBIENT GOLD RADIANCE */}
              <div className="relative mb-3.5 sm:mb-5 flex flex-col items-center justify-center text-center">
                <div className="relative mb-2">
                  <div className="absolute -inset-3 bg-radial from-amber-400/30 via-amber-500/10 to-transparent blur-xl pointer-events-none" />
                  <Image
                    src={logo}
                    alt="Sangeet Restaurant Logo"
                    priority
                    className="relative h-14 sm:h-20 md:h-24 w-auto object-contain filter brightness-110 contrast-105 drop-shadow-[0_12px_24px_rgba(212,175,55,0.35)]"
                  />
                </div>

                {/* Exclusive Digital Preview Badge */}
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest shadow-sm">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 animate-pulse" />
                  <span>Exclusive Digital Preview</span>
                </div>
              </div>

              {/* Heading Content */}
              <div className="text-center mb-4 sm:mb-5">
                <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1.5 sm:mb-2 leading-tight">
                  A Taste of <span className="text-gradient-gold italic">What’s to Come</span>
                </h2>

                <p className="text-xs sm:text-sm text-sangeet-neutral-300 leading-relaxed max-w-md mx-auto">
                  We are putting the final touches on our luxury dining hall in Wan Chai and our online booking experience.
                </p>
              </div>

              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 mb-4 sm:mb-5 py-2.5 px-2 sm:py-3.5 sm:px-3 rounded-xl sm:rounded-2xl bg-sangeet-neutral-950/80 border border-sangeet-neutral-800/80 shadow-inner">
                <div className="text-center p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-sangeet-neutral-900/80 border border-sangeet-neutral-800/60">
                  <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 mx-auto mb-1" />
                  <span className="block text-[10px] sm:text-[11px] font-semibold text-sangeet-neutral-200 truncate">Menus</span>
                  <span className="block text-[8px] sm:text-[9px] text-amber-400/90 font-medium">Live Preview</span>
                </div>
                <div className="text-center p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-sangeet-neutral-900/80 border border-sangeet-neutral-800/60">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 mx-auto mb-1" />
                  <span className="block text-[10px] sm:text-[11px] font-semibold text-sangeet-neutral-200 truncate">Events</span>
                  <span className="block text-[8px] sm:text-[9px] text-amber-400/90 font-medium">Diwali Galas</span>
                </div>
                <div className="text-center p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-sangeet-neutral-900/80 border border-sangeet-neutral-800/60">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 mx-auto mb-1" />
                  <span className="block text-[10px] sm:text-[11px] font-semibold text-sangeet-neutral-200 truncate">5,300 Sq Ft</span>
                  <span className="block text-[8px] sm:text-[9px] text-amber-400/90 font-medium">Luxury Venue</span>
                </div>
              </div>

              <p className="text-[11px] sm:text-xs text-sangeet-neutral-400 text-center mb-4 sm:mb-5 leading-normal">
                Feel free to explore our authentic recipes, festive banquets, and venue atmosphere ahead of our grand launch.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-2.5 sm:space-y-3">
              <button
                onClick={handleDismiss}
                className="w-full py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl bg-linear-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-sangeet-neutral-950 font-bold text-xs sm:text-sm shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Explore Sangeet Experience</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-1 pt-1 text-center">
                <Link
                  href="/contact"
                  onClick={handleDismiss}
                  className="text-[11px] sm:text-xs text-sangeet-neutral-400 hover:text-amber-400 transition-colors underline-offset-4 hover:underline font-medium"
                >
                  Private Event Inquiries
                </Link>
                <span className="text-sangeet-neutral-700 text-xs hidden xs:inline">•</span>
                <a
                  href="tel:+85223456789"
                  className="text-[11px] sm:text-xs text-sangeet-neutral-400 hover:text-amber-400 transition-colors flex items-center gap-1 font-medium"
                >
                  <Phone className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="font-mono tracking-tight">+852 2345 6789</span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
