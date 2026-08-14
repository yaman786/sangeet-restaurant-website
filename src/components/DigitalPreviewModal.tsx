"use client";
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Phone, X, UtensilsCrossed, Calendar, Award } from 'lucide-react';
import Link from 'next/link';

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
    console.log('[DigitalPreviewModal useEffect] pathname:', pathname, 'hasSeenPreview:', hasSeenPreview);
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop with frosted glass effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-linear-to-b from-sangeet-neutral-900 via-sangeet-neutral-900/95 to-sangeet-neutral-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(212,175,55,0.15)] overflow-hidden z-10"
          >
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-sangeet-red-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-5 right-5 p-2 text-sangeet-neutral-400 hover:text-white hover:bg-sangeet-neutral-800/80 rounded-full transition-colors cursor-pointer z-20"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Content */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest mb-4 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Exclusive Digital Preview</span>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
                A Taste of <span className="text-gradient-gold italic">What’s to Come</span>
              </h2>

              <p className="text-sm text-sangeet-neutral-300 leading-relaxed max-w-md mx-auto">
                We are putting the final touches on our luxury dining hall in Wan Chai and our full online booking experience.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-3 gap-2.5 mb-6 py-4 px-3 rounded-2xl bg-sangeet-neutral-950/70 border border-sangeet-neutral-800">
              <div className="text-center p-2 rounded-xl bg-sangeet-neutral-900/60 border border-sangeet-neutral-800/50">
                <UtensilsCrossed className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
                <span className="block text-[11px] font-semibold text-sangeet-neutral-200">Signature Menus</span>
                <span className="block text-[9px] text-sangeet-neutral-400">Live Preview</span>
              </div>
              <div className="text-center p-2 rounded-xl bg-sangeet-neutral-900/60 border border-sangeet-neutral-800/50">
                <Calendar className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
                <span className="block text-[11px] font-semibold text-sangeet-neutral-200">Diwali Galas</span>
                <span className="block text-[9px] text-sangeet-neutral-400">Special Events</span>
              </div>
              <div className="text-center p-2 rounded-xl bg-sangeet-neutral-900/60 border border-sangeet-neutral-800/50">
                <Award className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
                <span className="block text-[11px] font-semibold text-sangeet-neutral-200">5,300 Sq Ft</span>
                <span className="block text-[9px] text-sangeet-neutral-400">Luxury Venue</span>
              </div>
            </div>

            <p className="text-xs text-sangeet-neutral-400 text-center mb-6 leading-normal">
              Feel free to explore our authentic recipes, festive banquets, and venue atmosphere ahead of our grand launch.
            </p>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleDismiss}
                className="w-full py-3.5 px-6 rounded-xl bg-linear-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-sangeet-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Explore Sangeet Experience</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <div className="flex items-center justify-center gap-4 pt-1">
                <Link
                  href="/contact"
                  onClick={handleDismiss}
                  className="text-xs text-sangeet-neutral-400 hover:text-amber-400 transition-colors underline-offset-4 hover:underline"
                >
                  Private Event Inquiries
                </Link>
                <span className="text-sangeet-neutral-700">•</span>
                <a
                  href="tel:+85223456789"
                  className="text-xs text-sangeet-neutral-400 hover:text-amber-400 transition-colors flex items-center gap-1"
                >
                  <Phone className="w-3 h-3 text-amber-400" />
                  <span>+852 2345 6789</span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
