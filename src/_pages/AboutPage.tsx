"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useNavigate } from '@/utils/router-mock';
import { Building2, UtensilsCrossed, Theater, History, Star, Users, Award, ChefHat } from 'lucide-react';
import { AboutGallery } from '@/components/client/AboutGallery';

/**
 * AboutPage Component - Streamlined Essential Sections
 * Features: Hero video, simplified story, gallery with filters, team, and CTA
 */
const AboutPage = () => {
  const navigate = useNavigate();
// Gallery moved to AboutGallery component

  // Grand Opening story highlights
  const storyHighlights = [
    {
      icon: Star,
      title: "The Meaning of Sangeet",
      description: "In Sanskrit, Sangeet signifies the harmonious symphony of music, rhythm, and emotion — a philosophy we infuse into every spice blend and curated dish."
    },
    {
      icon: Building2,
      title: "Contemporary Luxury Sanctuary",
      description: "An opulent dining destination in Wan Chai featuring intimate booth seating, a private dining room, and an ambient cocktail lounge."
    },
    {
      icon: UtensilsCrossed,
      title: "Artisanal Charcoal Craft",
      description: "Master chefs utilizing authentic clay tandoor ovens and slow-cooked regional recipes from across the South Asian subcontinent."
    }
  ];

  // Key highlights
  const keyStats = [
    { number: "100%", label: "Fresh Sourced", icon: Award },
    { number: "60+", label: "Signature Dishes", icon: UtensilsCrossed },
    { number: "Wan Chai", label: "Hong Kong", icon: Building2 }
  ];

  // Executive culinary team
  const teamMembers = [
    {
      name: "Executive Head Chef",
      role: "Culinary Director",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      description: "Master chef dedicated to authentic South Asian culinary art. His signature creations blend traditional clay tandoor techniques with modern fine-dining finesse."
    },
    {
      name: "Hospitality Team",
      role: "General Management",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
      description: "Leading our service team with warmth and precision, ensuring every guest experiences the gracious hospitality of South Asian culture."
    },
    {
      name: "Sommelier & Bar Team",
      role: "Beverage Program",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      description: "Curating our beverage program with handcrafted signature mocktails, fine wine pairings, and traditional spiced Himalayan teas."
    }
  ];

  // Culinary commitments & standards
  const culinaryCommitments = [
    {
      icon: Award,
      title: "Premium Sourced Ingredients",
      description: "We hand-select the finest fresh meats, farm produce, and authentic whole spices to craft every single dish from scratch."
    },
    {
      icon: UtensilsCrossed,
      title: "Live Charcoal Clay Tandoor",
      description: "Char-grilled kebabs, tender tikkas, and handcrafted naans baked fresh at 400°C over natural charcoal."
    },
    {
      icon: Star,
      title: "Dedicated Vegetarian & Vegan Delicacies",
      description: "Rich, authentic plant-based curries crafted from scratch without compromising on flavor, texture, or depth."
    },
    {
      icon: Building2,
      title: "Unrivaled Hospitality & Private Events",
      description: "Warm, attentive service tailored for intimate romantic dinners, family celebrations, and corporate gatherings."
    }
  ];

  return (
    <div className="min-h-screen bg-sangeet-neutral-950">
      {/* Unique AboutPage Hero - Story-Focused Design */}
      <section className="relative min-h-screen bg-linear-to-br from-sangeet-neutral-950 via-sangeet-neutral-900 to-sangeet-neutral-950">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1920&h=1080&fit=crop"
            alt="Chef preparing authentic South Asian cuisine"
            fill
            sizes="100vw"
            priority
            className="object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-linear-to-br from-sangeet-neutral-950 via-sangeet-neutral-900/95 to-sangeet-neutral-950"></div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 z-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fbbf24' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Floating Elements - Better Positioned */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-32 left-8 md:left-16 text-4xl md:text-6xl opacity-20 z-10"
        >
          <Star />
        </motion.div>

        <motion.div
          animate={{
            y: [0, 15, 0],
            rotate: [0, -5, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute top-48 right-8 md:right-16 text-3xl md:text-5xl opacity-20 z-10"
        >
          <Theater />
        </motion.div>

        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 3, 0]
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-32 left-8 md:left-16 text-xl md:text-3xl opacity-15 z-10"
        >
          <UtensilsCrossed />
        </motion.div>

        {/* Main Content Container - Better Centered */}
        <div className="relative z-20 flex items-center justify-center min-h-screen px-4 py-16">
          <div className="max-w-5xl mx-auto text-center">

            {/* Story Badge - Better Spacing */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-12"
            >
              <div className="inline-flex items-center space-x-3 bg-linear-to-r from-sangeet-400/20 to-sangeet-red-500/20 backdrop-blur-md border border-sangeet-400/30 rounded-full px-8 py-4">
                <span className="text-2xl"><History className="text-sangeet-400" /></span>
                <span className="text-sangeet-400 font-semibold text-lg">Our Story</span>
                <span className="text-2xl"><Star className="text-sangeet-400" /></span>
              </div>
            </motion.div>

            {/* Main Headline - Better Typography */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-10 leading-tight px-4"
            >
              <span className="text-white">A New Symphony</span>
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-sangeet-400 to-sangeet-red-500">
                Of Flavors
              </span>
              <br />
              <span className="text-white">In Hong Kong</span>
            </motion.h1>

            {/* Story Subtitle - Unique & Compelling */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="text-lg md:text-xl text-sangeet-neutral-300 mb-16 max-w-4xl mx-auto leading-relaxed px-4"
            >
              Welcome to Sangeet, Hong Kong&apos;s newest South Asian fine-dining sanctuary in the heart of Wan Chai.
              <span className="text-sangeet-400 font-semibold"> Inspired by the Sanskrit word for musical harmony</span>,
              we celebrate the artistry of South Asian gastronomy through live charcoal tandoor cooking, fragrant whole spices, and modern luxury.
            </motion.p>

            {/* Story Timeline Preview - Better Grid */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16 max-w-5xl mx-auto px-4"
            >
              <div className="bg-sangeet-neutral-900/50 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-sangeet-neutral-700 hover:border-sangeet-400/50 transition-all duration-300">
                <div className="text-3xl md:text-4xl mb-4 text-sangeet-400"><ChefHat /></div>
                <h3 className="text-sangeet-400 font-bold text-lg md:text-xl mb-3">Master Craftsmanship</h3>
                <p className="text-sangeet-neutral-400 text-sm md:text-base">Authentic regional recipes elevated with contemporary fine-dining presentation</p>
              </div>

              <div className="bg-sangeet-neutral-900/50 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-sangeet-neutral-700 hover:border-sangeet-400/50 transition-all duration-300">
                <div className="text-3xl md:text-4xl mb-4 text-sangeet-400"><Building2 /></div>
                <h3 className="text-sangeet-400 font-bold text-lg md:text-xl mb-3">Sophisticated Spaces</h3>
                <p className="text-sangeet-neutral-400 text-sm md:text-base">Atmospheric dining rooms designed for intimate dinners and private celebrations</p>
              </div>

              <div className="bg-sangeet-neutral-900/50 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-sangeet-neutral-700 hover:border-sangeet-400/50 transition-all duration-300">
                <div className="text-3xl md:text-4xl mb-4 text-sangeet-400"><UtensilsCrossed /></div>
                <h3 className="text-sangeet-400 font-bold text-lg md:text-xl mb-3">Charcoal Tandoor</h3>
                <p className="text-sangeet-neutral-400 text-sm md:text-base">Live clay-oven roasting that infuses every kebab and naan with smoky perfection</p>
              </div>
            </motion.div>

            {/* Story-Focused CTAs - Better Spacing */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.0 }}
              className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center mb-12 px-4"
            >
              {/* Primary CTA - Learn More */}
              <motion.button
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className="bg-linear-to-r from-sangeet-400 to-sangeet-500 text-sangeet-neutral-950 px-8 md:px-10 py-4 rounded-2xl font-bold text-lg md:text-xl hover:from-sangeet-300 hover:to-sangeet-400 transition-all duration-300 shadow-2xl hover:shadow-sangeet-400/30 flex items-center space-x-3"
              >
                <span className="text-xl md:text-2xl"><History /></span>
                <span>Read Our Story</span>
              </motion.button>

              {/* Secondary CTA - Contact */}
              <motion.button
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className="bg-sangeet-neutral-800/80 backdrop-blur-md text-sangeet-400 px-6 md:px-8 py-4 rounded-2xl font-bold text-lg hover:bg-sangeet-neutral-700/80 transition-all duration-300 border border-sangeet-neutral-600 flex items-center space-x-3"
              >
                <span className="text-lg md:text-xl"><Users /></span>
                <span>Get in Touch</span>
              </motion.button>
            </motion.div>

            {/* Unique Story Elements */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="flex flex-wrap justify-center items-center gap-6 md:gap-8 text-sangeet-neutral-400 px-4"
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg text-sangeet-400"><UtensilsCrossed className="w-5 h-5" /></span>
                <span className="text-sm md:text-base">Authentic Spices</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg text-sangeet-400"><Theater className="w-5 h-5" /></span>
                <span className="text-sm md:text-base">Traditional Music</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg text-sangeet-400"><Star className="w-5 h-5" /></span>
                <span className="text-sm md:text-base">Luxury Experience</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg text-sangeet-400"><Users className="w-5 h-5" /></span>
                <span className="text-sm md:text-base">Warm Hospitality</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator - Subtle Position */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-4 right-6 z-30"
        >
          <div className="flex flex-col items-center space-y-1 text-sangeet-neutral-500 opacity-60 hover:opacity-100 transition-opacity duration-300">
            <span className="text-xs">Scroll</span>
            <div className="w-4 h-6 border border-sangeet-neutral-500 rounded-full flex justify-center">
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-0.5 h-2 bg-sangeet-neutral-500 rounded-full mt-1"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Enhanced Our Story Section */}
      <section className="py-20 bg-linear-to-br from-sangeet-neutral-900 via-sangeet-neutral-800 to-sangeet-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-2 bg-linear-to-r from-sangeet-400/20 to-sangeet-red-500/20 backdrop-blur-md border border-sangeet-400/30 rounded-full px-6 py-2 mb-4">
              <span className="text-2xl text-sangeet-400"><Star /></span>
              <span className="text-sangeet-400 font-semibold">Our Story</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-sangeet-400 mb-4">Follow Our Journey</h2>
            <p className="text-sangeet-neutral-400 text-lg max-w-3xl mx-auto">
              Nestled in Wanchai&apos;s bustling center, Sangeet bridges the timeless and the contemporary. We create bespoke experiences where every dish tells a story, every performance celebrates heritage, and every moment becomes a cherished memory. From intimate dinners to grand celebrations, we&apos;re here to make your special occasions extraordinary.
            </p>
          </motion.div>

          {/* Story Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {storyHighlights.map((highlight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-sangeet-neutral-900/50 backdrop-blur-md rounded-2xl p-8 border border-sangeet-neutral-700 text-center"
              >
                <div className="text-4xl mb-4 text-sangeet-400 flex justify-center"><highlight.icon className="w-10 h-10" /></div>
                <h3 className="text-2xl font-bold text-sangeet-400 mb-3 group-hover:text-sangeet-300 transition-colors">{highlight.title}</h3>
                <p className="text-sangeet-neutral-300 text-sm leading-relaxed">{highlight.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Key Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {keyStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-sangeet-neutral-900/50 backdrop-blur-md rounded-2xl p-8 border border-sangeet-neutral-700 text-center"
              >
                <div className="text-4xl mb-2 text-sangeet-400 flex justify-center"><stat.icon className="w-10 h-10" /></div>
                <div className="text-sangeet-400 font-bold text-3xl">{stat.number}</div>
                <div className="text-sangeet-neutral-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Restaurant Gallery Section with Filters */}
      <AboutGallery />

      {/* Team Section */}
      <section className="py-20 bg-sangeet-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-sangeet-400 mb-4">Meet Our Team</h2>
            <p className="text-sangeet-neutral-400 text-lg max-w-3xl mx-auto">The passionate individuals who bring the authentic flavors of South Asia to life</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group bg-linear-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-2xl p-8 shadow-2xl hover:shadow-sangeet-400/20 transition-all duration-500 border border-sangeet-neutral-700 hover:border-sangeet-400"
              >
                <div className="text-center">
                  <div className="relative mb-6">
                    <div className="w-40 h-40 rounded-full mx-auto overflow-hidden border-4 border-sangeet-400/20 group-hover:border-sangeet-400/40 transition-all duration-300">
                      <div className="relative w-full h-full">
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          sizes="160px"
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    </div>

                  </div>
                  <h3 className="text-2xl font-bold text-sangeet-400 mb-2 group-hover:text-sangeet-300 transition-colors">{member.name}</h3>
                  <p className="text-sangeet-neutral-400 font-medium mb-4">{member.role}</p>
                  <p className="text-sangeet-neutral-400 leading-relaxed">{member.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Culinary Commitments Section */}
      <section className="py-20 bg-linear-to-br from-sangeet-neutral-950 via-sangeet-neutral-900 to-sangeet-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-sangeet-400 mb-4">Our Culinary Commitments</h2>
            <p className="text-sangeet-neutral-400 text-lg max-w-3xl mx-auto">Uncompromising standards in sourcing, authentic clay tandoor cooking, and luxury hospitality</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {culinaryCommitments.map((commitment, index) => (
              <motion.div
                key={commitment.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group bg-linear-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-2xl p-8 shadow-2xl hover:shadow-sangeet-400/20 transition-all duration-500 border border-sangeet-neutral-700 hover:border-sangeet-400 text-center"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  <commitment.icon />
                </div>
                <h3 className="text-xl font-bold text-sangeet-400 mb-3 group-hover:text-sangeet-300 transition-colors">
                  {commitment.title}
                </h3>
                <p className="text-sangeet-neutral-400 font-medium">
                  {commitment.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-sangeet-neutral-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-sangeet-400 mb-6">
              Your Journey Begins Here
            </h2>
            <p className="text-sangeet-neutral-400 text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
              Whether it&apos;s a romantic dinner, family celebration, or corporate event, we&apos;re here to make it extraordinary.
              <span className="text-sangeet-400 font-semibold"> Reserve your table</span> and let us create memories that last a lifetime.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {/* Primary CTA - Book Table */}
              <motion.button
                onClick={() => navigate('/reservations')}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center space-x-3 bg-linear-to-r from-sangeet-400 to-sangeet-500 text-sangeet-neutral-950 px-10 py-4 rounded-2xl font-bold text-xl hover:from-sangeet-300 hover:to-sangeet-400 transition-all duration-300 shadow-2xl hover:shadow-sangeet-400/30"
              >
                <span className="text-2xl">📅</span>
                <span>Book Your Table</span>
                <motion.span
                  animate={{ x: [0, 8, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  →
                </motion.span>
              </motion.button>

              {/* Secondary CTA - View Menu */}
              <motion.button
                onClick={() => navigate('/menu')}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center space-x-3 border-2 border-sangeet-red-500 text-sangeet-red-400 px-10 py-4 rounded-2xl font-bold text-xl hover:bg-sangeet-red-500 hover:text-white transition-all duration-300 shadow-2xl hover:shadow-sangeet-red-500/30"
              >
                <span className="text-2xl">🍽️</span>
                <span>View Menu</span>
                <motion.span
                  animate={{ x: [0, 8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  →
                </motion.span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage; 