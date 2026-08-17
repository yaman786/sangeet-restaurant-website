"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useNavigate } from '@/utils/router-mock';
import { Building2, UtensilsCrossed, Sparkles, Award, ChefHat, ShieldCheck, Leaf, Wine, ArrowRight } from 'lucide-react';
import { AboutGallery } from '@/components/client/AboutGallery';

/**
 * AboutPage Component — Sangeet Fine Dining
 * Benchmarked against: Gymkhana London (2★), Benares Mayfair (1★), New Punjab Club HK (1★), Semma NYC (1★)
 * 
 * Design decisions:
 * - Direct, honest culinary prose (no purple prose / no "symphony" fluff)
 * - Authentic venue photography
 * - Authoritative Halal & dietary certification
 * - Clean storytelling & full visual gallery
 */

const AboutPage = () => {
  const navigate = useNavigate();

  const fadeUp = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as any },
  };

  // Core Pillars of Sangeet
  const storyHighlights = [
    {
      icon: Sparkles,
      title: "The Meaning of Sangeet",
      description: "In Sanskrit, Sangeet means music — representing the balance and harmony of aromatics, spices, and ingredients in South Asian gastronomy."
    },
    {
      icon: ChefHat,
      title: "Subcontinental Heritage",
      description: "Time-honoured regional recipes, from high-heat clay tandoor grills and fresh naans to rich, slow-simmered curries."
    },
    {
      icon: Building2,
      title: "A Considered Space",
      description: "Located in the heart of Wan Chai, featuring comfortable table and booth seating, an ambient cocktail bar, and private dining."
    }
  ];

  // Verified Key Highlights
  const keyStats = [
    { number: "Fresh", label: "Ingredients Sourced Daily", icon: Award },
    { number: "60+", label: "Dishes on the Menu", icon: UtensilsCrossed },
    { number: "Wan Chai", label: "Hong Kong", icon: Building2 }
  ];

  // Kitchen Standards & Commitments
  const culinaryCommitments = [
    {
      icon: ShieldCheck,
      title: "100% Halal Certified Meats",
      description: "All chicken, lamb, and meats served at Sangeet are 100% Halal certified and prepared to the highest culinary standards."
    },
    {
      icon: UtensilsCrossed,
      title: "High-Heat Tandoori Cooking",
      description: "Clay tandoor grilling for marinated skewers, tender tikkas, and freshly baked naans and rotis made to order."
    },
    {
      icon: Award,
      title: "Fresh Produce & In-House Spices",
      description: "We source fresh produce daily and roast our whole spices in-house for authentic, layered aromatic depth."
    },
    {
      icon: Leaf,
      title: "Dedicated Vegetarian Selections",
      description: "Authentic, rich plant-based curries and starters crafted from scratch with full flavor, texture, and care."
    },
    {
      icon: Wine,
      title: "Craft Cocktails & Wine",
      description: "Signature cocktails infused with regional botanicals alongside a curated wine list and spiced Himalayan teas."
    },
    {
      icon: Building2,
      title: "Private Dining & Events",
      description: "Custom menus and dedicated hosting for birthdays, corporate dinners, and intimate family celebrations."
    }
  ];

  return (
    <div className="min-h-screen bg-sangeet-neutral-950">

      {/* ───────────────────────────────────────────────────────
          HERO SECTION — Full cinematic view
      ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[75vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-interior.jpg"
            alt="Sangeet Restaurant dining room ambiance"
            fill
            sizes="100vw"
            priority
            unoptimized
            className="object-cover scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-b from-sangeet-neutral-950/80 via-sangeet-neutral-950/60 to-sangeet-neutral-950" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center px-5 pt-28 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="section-badge mb-6 inline-block">About Sangeet</span>
            <h1 className="text-display-md md:text-display-lg font-display text-white mb-6 leading-tight">
              South Asian Dining,{' '}
              <span className="text-gradient-gold italic">Done Properly</span>
            </h1>
            <p className="text-body-lg sm:text-heading-sm text-sangeet-neutral-300 mb-10 max-w-2xl mx-auto font-sans leading-relaxed">
              Sangeet is a South Asian fine-dining restaurant in Wan Chai, Hong Kong. The name means &ldquo;music&rdquo; in Sanskrit — a tribute to the harmony and balance of ingredients in every dish we prepare.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate('/reservations')}
                className="btn-primary text-heading-sm px-10 py-4"
              >
                Reserve a Table
              </button>
              <button
                onClick={() => navigate('/menu')}
                className="btn-secondary px-8 py-4"
              >
                View Menu
              </button>
            </div>
          </motion.div>
        </div>
      </section>


      {/* ───────────────────────────────────────────────────────
          OUR STORY & PHILOSOPHY — Clean narrative & 3 pillars
      ─────────────────────────────────────────────────────── */}
      <section className="section-padding bg-sangeet-neutral-950 border-t border-sangeet-neutral-800/60">
        <div className="max-w-6xl mx-auto container-padding">
          {/* Section Header */}
          <motion.div {...fadeUp} className="text-center mb-16 md:mb-20">
            <span className="section-badge mb-4">Our Philosophy</span>
            <h2 className="section-title">
              Authentic Roots.{' '}
              <span className="text-gradient-gold italic">Refined Setting.</span>
            </h2>
            <p className="section-subtitle">
              We opened in Wan Chai with a clear purpose: to serve regional South Asian cuisine without shortcuts. In our kitchen, whole spices are roasted and ground in-house, curries are slow-simmered for depth, and tandoori grills and breads are fired fresh to order.
            </p>
          </motion.div>

          {/* 3 Story Pillar Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16">
            {storyHighlights.map((highlight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] as any }}
                className="card group text-center p-8 md:p-10"
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-sangeet-400/10 border border-sangeet-400/20 flex items-center justify-center text-sangeet-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <highlight.icon className="w-7 h-7" />
                </div>
                <h3 className="text-heading-md text-sangeet-neutral-100 font-sans font-semibold mb-3">
                  {highlight.title}
                </h3>
                <p className="text-body-sm text-sangeet-neutral-400 leading-relaxed">
                  {highlight.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Key Statistics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            {keyStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-sangeet-neutral-900/60 border border-sangeet-neutral-800 text-center"
              >
                <div className="text-display-sm font-display text-sangeet-400 mb-1">{stat.number}</div>
                <div className="text-caption text-sangeet-neutral-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* ───────────────────────────────────────────────────────
          RESTAURANT GALLERY
      ─────────────────────────────────────────────────────── */}
      <AboutGallery />


      {/* ───────────────────────────────────────────────────────
          KITCHEN STANDARDS & COMMITMENTS (including Halal certification)
      ─────────────────────────────────────────────────────── */}
      <section className="section-padding bg-linear-to-b from-sangeet-neutral-950 via-sangeet-neutral-900 to-sangeet-neutral-950">
        <div className="max-w-6xl mx-auto container-padding">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span className="section-badge mb-4">Kitchen Standards</span>
            <h2 className="section-title">
              How We{' '}
              <span className="text-gradient-gold italic">Work</span>
            </h2>
            <p className="section-subtitle">
              Uncompromising standards in sourcing, authentic clay tandoor cooking, and thoughtful hospitality.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {culinaryCommitments.map((commitment, index) => (
              <motion.div
                key={commitment.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] as any }}
                className="card group p-8 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-sangeet-400/10 border border-sangeet-400/20 flex items-center justify-center text-sangeet-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                    <commitment.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-heading-sm sm:text-heading-md font-sans font-semibold text-sangeet-neutral-100 mb-3 group-hover:text-sangeet-300 transition-colors">
                    {commitment.title}
                  </h3>
                  <p className="text-body-sm text-sangeet-neutral-400 leading-relaxed">
                    {commitment.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* ───────────────────────────────────────────────────────
          FINAL INVITATION CTA
      ─────────────────────────────────────────────────────── */}
      <section className="relative section-padding bg-sangeet-neutral-900 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sangeet-400/5 rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="max-w-4xl mx-auto container-padding text-center relative z-10">
          <motion.div {...fadeUp}>
            <h2 className="font-display text-display-md md:text-display-lg text-sangeet-neutral-100 mb-6">
              Come Dine With Us in{' '}
              <span className="text-gradient-gold italic">Wan Chai</span>
            </h2>
            <p className="text-body-lg text-sangeet-neutral-400 mb-10 max-w-xl mx-auto leading-relaxed">
              Walk-ins welcome. Reservations recommended for dinner service and weekend seatings.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate('/reservations')}
                className="btn-primary text-heading-sm px-10 py-4 flex items-center gap-2"
              >
                <span>Reserve a Table</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/menu')}
                className="btn-secondary px-8 py-4"
              >
                View Menu
              </button>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;