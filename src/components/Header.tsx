"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocation } from '@/utils/router-mock';
import { motion, AnimatePresence } from 'framer-motion';

import logo from '../assets/images/logo-trimmed.png';

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
  { path: '/track-order', label: 'Track Order' },
  { path: '/location', label: 'Location' },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [socialLinks, setSocialLinks] = useState({
    facebook: "https://www.facebook.com/sangeetrestaurant",
    instagram: "https://www.instagram.com/sangeet_wanchai/"
  });
  const location = useLocation();

  const isActive = useCallback((path: any) => location.pathname === path, [location.pathname]);

  // Load dynamic public config for social links
  useEffect(() => {
    fetch('/api/website/public-config')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.social) {
          setSocialLinks(prev => ({
            ...prev,
            ...Object.fromEntries(
              Object.entries(data.social).filter(([_, v]) => typeof v === 'string' && (v as string).trim().length > 0)
            )
          }));
        }
      })
      .catch(() => {});
  }, []);

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
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">

            {/* Logo */}
            <Link
              href="/"
              data-testid="header-logo-link"
              className="relative flex items-center gap-2.5 shrink-0 py-1 group"
              aria-label="Sangeet Restaurant Home"
            >
              <div className="absolute -inset-2 bg-linear-to-r from-sangeet-400/15 via-sangeet-red-500/10 to-transparent rounded-full blur-xl opacity-80 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <Image
                src={logo}
                alt="Sangeet Logo"
                priority
                unoptimized
                data-testid="header-logo-img"
                className="relative h-10 sm:h-11 md:h-12 lg:h-14 w-auto logo-image-header"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-0.5 lg:gap-1.5">
              {NAVIGATION_ITEMS.map((item) => (
                <Link key={item.path}
                  href={item.path}
                  className={`relative px-2 lg:px-3.5 py-2 rounded-lg text-xs lg:text-body-sm font-medium transition-colors duration-200 whitespace-nowrap
                    focus:outline-hidden focus:ring-2 focus:ring-sangeet-400/30 focus:ring-offset-2 focus:ring-offset-transparent
                    ${isActive(item.path)
                      ? 'text-sangeet-400'
                      : 'text-sangeet-neutral-300 hover:text-sangeet-neutral-100'
                    }`}
                  aria-current={isActive(item.path) ? 'page' : undefined}
                >
                  {item.label}
                  {isActive(item.path) && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-sangeet-400 rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right side — CTA (Desktop) */}
            <div className="hidden md:flex items-center gap-2 lg:gap-2.5 shrink-0">
              <Link href="/pickup"
                data-testid="header-pickup-cta"
                className="px-3 lg:px-4 py-2 rounded-lg bg-sangeet-400 text-sangeet-neutral-950 text-xs lg:text-body-sm font-bold
                           hover:bg-sangeet-300 transition-all duration-200 whitespace-nowrap shrink-0 shadow-gold-glow"
              >
                Order Pick-Up
              </Link>
              <Link href="/reservations"
                className="hidden lg:inline-flex px-4 py-2 rounded-lg bg-sangeet-400/10 text-sangeet-400 text-body-sm font-semibold
                           border border-sangeet-400/20 hover:bg-sangeet-400/20 hover:border-sangeet-400/30
                           transition-all duration-200 whitespace-nowrap shrink-0"
              >
                Book a Table
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg
                         hover:bg-sangeet-neutral-800/50 transition-colors duration-200 z-60"
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
      <div className="h-16 md:h-20" />

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
              className="fixed inset-0 bg-sangeet-neutral-950/80 backdrop-blur-xs z-40"
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
                <div className="flex flex-col gap-3">
                  <Link href="/pickup"
                    data-testid="mobile-pickup-cta"
                    onClick={() => setIsMenuOpen(false)}
                    className="btn-primary w-full text-center block"
                  >
                    Order Online for Pick-Up
                  </Link>
                  <Link href="/reservations"
                    onClick={() => setIsMenuOpen(false)}
                    className="btn-secondary w-full text-center block"
                  >
                    Reserve a Table
                  </Link>
                </div>

                {/* Mobile Drawer Social Links */}
                {(socialLinks.instagram || socialLinks.facebook) && (
                  <div className="pt-4 mt-5 border-t border-sangeet-neutral-800 flex items-center justify-between">
                    <span className="text-xs font-medium text-sangeet-neutral-400">Follow Sangeet</span>
                    <div className="flex items-center gap-2">
                      {socialLinks.instagram && (
                        <a
                          href={socialLinks.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-testid="mobile-nav-instagram"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sangeet-neutral-800/80 border border-sangeet-neutral-700/60 text-sangeet-300 hover:text-white hover:border-sangeet-400 text-xs font-medium transition-colors"
                          aria-label="Follow on Instagram"
                        >
                          <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                          <span>Instagram</span>
                        </a>
                      )}
                      {socialLinks.facebook && (
                        <a
                          href={socialLinks.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-testid="mobile-nav-facebook"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sangeet-neutral-800/80 border border-sangeet-neutral-700/60 text-sangeet-300 hover:text-white hover:border-[#1877F2] text-xs font-medium transition-colors"
                          aria-label="Follow on Facebook"
                        >
                          <svg className="w-3.5 h-3.5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          <span>Facebook</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;