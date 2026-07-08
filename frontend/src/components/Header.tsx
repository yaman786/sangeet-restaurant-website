"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useLocation } from '@/utils/router-mock';
import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import logo from '../assets/images/logo.png';

/**
 * Header Component — Premium Navigation
 * Benchmarked: Vercel/Notion frosted-glass sticky nav
 * 
 * Design decisions:
 * - Frosted glass background that strengthens on scroll
 * - Clean text links (no emoji icons in nav)
 * - Minimal status indicator (dot + text only)
 * - Smooth mobile drawer (not a jarring overlay)
 */

const NAVIGATION_ITEMS = [
  { path: '/', label: 'Home' },
  { path: '/menu', label: 'Menu' },
  { path: '/reservations', label: 'Reservations' },
  { path: '/location', label: 'Location' },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const isActive = useCallback((path: any) => location.pathname === path, [location.pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  // Restaurant status
  const isOpen = useMemo(() => {
    const h = new Date().getHours();
    return h >= 18 && h < 23;
  }, []);

  return (
    <>
      {/* ── Desktop + Mobile Header ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out-expo ${
          isScrolled
            ? 'bg-sangeet-neutral-950/90 backdrop-blur-xl border-b border-sangeet-neutral-800/50 shadow-glass'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-18">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5" aria-label="Sangeet Restaurant Home">
              <img src={(logo as any).src || logo} alt="Sangeet Logo" className="h-8 w-auto logo-image-header" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {NAVIGATION_ITEMS.map((item) => (
                <Link key={item.path}
                  href={item.path}
                  className={`relative px-3.5 py-2 rounded-lg text-body-sm font-medium transition-colors duration-200
                    focus:outline-none focus:ring-2 focus:ring-sangeet-400/30 focus:ring-offset-2 focus:ring-offset-transparent
                    ${isActive(item.path)
                      ? 'text-sangeet-400'
                      : 'text-sangeet-neutral-400 hover:text-sangeet-neutral-100'
                    }`}
                  aria-current={isActive(item.path) ? 'page' : undefined}
                >
                  {item.label}
                  {isActive(item.path) && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-sangeet-400 rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right side — Status + CTA (Desktop) */}
            <div className="hidden md:flex items-center gap-4">
              {/* Status pill */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sangeet-neutral-800/40 border border-sangeet-neutral-700/20">
                <div className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-green-400' : 'bg-sangeet-neutral-500'}`} />
                <span className="text-caption text-sangeet-neutral-400">
                  {isOpen ? 'Open' : 'Closed'}
                </span>
              </div>

              {/* CTA */}
              <Link href="/reservations"
                className="px-4 py-2 rounded-lg bg-sangeet-400/10 text-sangeet-400 text-body-sm font-semibold
                           border border-sangeet-400/20 hover:bg-sangeet-400/20 hover:border-sangeet-400/30
                           transition-all duration-200"
              >
                Book a Table
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg
                         hover:bg-sangeet-neutral-800/50 transition-colors duration-200 z-[60]"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <motion.span
                  animate={isMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="block h-[1.5px] w-full bg-sangeet-neutral-200 rounded-full origin-center"
                />
                <motion.span
                  animate={isMenuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.2 }}
                  className="block h-[1.5px] w-full bg-sangeet-neutral-200 rounded-full"
                />
                <motion.span
                  animate={isMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="block h-[1.5px] w-full bg-sangeet-neutral-200 rounded-full origin-center"
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16 md:h-18" />

      {/* ── Mobile Menu Overlay ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-sangeet-neutral-950/80 backdrop-blur-sm z-40"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-16 left-0 right-0 z-50 bg-sangeet-neutral-900/98 backdrop-blur-xl border-b border-sangeet-neutral-800/50"
            >
              <div className="max-w-lg mx-auto px-5 py-6">
                {/* Nav Links */}
                <div className="space-y-1 mb-6">
                  {NAVIGATION_ITEMS.map((item, index) => (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Link href={item.path}
                        onClick={() => setIsMenuOpen(false)}
                        className={`block px-4 py-3 rounded-xl text-heading-sm font-medium transition-all duration-200
                          ${isActive(item.path)
                            ? 'text-sangeet-400 bg-sangeet-400/10'
                            : 'text-sangeet-neutral-200 hover:text-sangeet-400 hover:bg-sangeet-neutral-800/40'
                          }`}
                        aria-current={isActive(item.path) ? 'page' : undefined}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Divider */}
                <div className="h-px bg-sangeet-neutral-800 mb-6" />

                {/* Mobile CTA */}
                <Link href="/reservations"
                  onClick={() => setIsMenuOpen(false)}
                  className="btn-primary w-full text-center block"
                >
                  Reserve Your Table
                </Link>

                {/* Status */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-400' : 'bg-sangeet-neutral-500'}`} />
                  <span className="text-caption text-sangeet-neutral-400">
                    {isOpen ? 'Open Now · Closes at 11 PM' : 'Closed · Opens at 6 PM'}
                  </span>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;