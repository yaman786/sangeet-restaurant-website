'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ImageIcon, Building2, PartyPopper, Theater, UtensilsCrossed } from 'lucide-react';

export const AboutGallery = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const galleryFilters = [
    { id: 'all', label: 'All', icon: ImageIcon },
    { id: 'dining', label: 'Dining Areas', icon: Building2 },
    { id: 'celebrations', label: 'Celebrations', icon: PartyPopper },
    { id: 'cultural', label: 'Cultural Experience', icon: Theater },
    { id: 'culinary', label: 'Culinary Journey', icon: UtensilsCrossed }
  ];

  const galleryImages = [
    { url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop", title: "Main Dining Hall", description: "Our grand dining hall accommodates 150+ guests", category: "dining" },
    { url: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop", title: "Private Dining Room", description: "Intimate private dining spaces", category: "dining" },
    { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop", title: "Bar & Lounge", description: "Relax with premium spirits", category: "dining" },
    { url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop", title: "Birthday Celebration", description: "Creating memorable birthdays", category: "celebrations" },
    { url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&h=600&fit=crop", title: "Wedding Reception", description: "Elegant wedding receptions", category: "celebrations" },
    { url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop", title: "Family Gathering", description: "Warm family gatherings", category: "celebrations" },
    { url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop", title: "Live Music", description: "Traditional South Asian music", category: "cultural" },
    { url: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&h=600&fit=crop", title: "Traditional Dance", description: "Cultural dance performances", category: "cultural" },
    { url: "https://images.unsplash.com/photo-1606220838315-056192d5e927?w=800&h=600&fit=crop", title: "Cultural Decor", description: "Authentic South Asian decor", category: "cultural" },
    { url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop", title: "Traditional Cooking", description: "Behind-the-scenes look", category: "culinary" },
    { url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&h=600&fit=crop", title: "Signature Dishes", description: "Our most popular dishes", category: "culinary" }
  ];

  const filteredImages = activeFilter === 'all'
    ? galleryImages
    : galleryImages.filter(image => image.category === activeFilter);

  return (
    <section className="py-20 bg-sangeet-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-sangeet-400/20 to-sangeet-red-500/20 backdrop-blur-md border border-sangeet-400/30 rounded-full px-6 py-2 mb-4">
            <span className="text-2xl">📸</span>
            <span className="text-sangeet-400 font-semibold">Gallery</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-sangeet-400 mb-4">Experience Sangeet</h2>
          <p className="text-sangeet-neutral-400 text-lg max-w-3xl mx-auto">
            Step into our world through these carefully curated moments.
          </p>
        </motion.div>

        {/* Desktop Filters */}
        <div className="hidden md:flex flex-wrap justify-center gap-4 mb-12">
          {galleryFilters.map((filter) => (
            <motion.button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`inline-flex items-center space-x-2 px-6 py-3 rounded-full font-semibold text-lg transition-all duration-300 ${activeFilter === filter.id
                ? 'bg-sangeet-400 text-sangeet-neutral-950 shadow-lg'
                : 'bg-sangeet-neutral-800/50 text-sangeet-neutral-400 hover:bg-sangeet-neutral-700/50 hover:text-sangeet-300'
                }`}
            >
              <span className="text-2xl"><filter.icon /></span>
              <span>{filter.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Mobile Filters */}
        <div className="md:hidden overflow-x-auto scrollbar-hide mb-8">
          <div className="flex space-x-3 px-4">
            {galleryFilters.map((filter) => (
              <motion.button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                whileTap={{ scale: 0.95 }}
                className={`flex-shrink-0 inline-flex items-center space-x-2 px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${activeFilter === filter.id
                  ? 'bg-sangeet-400 text-sangeet-neutral-950 shadow-lg'
                  : 'bg-sangeet-neutral-800/50 text-sangeet-neutral-400 hover:bg-sangeet-neutral-700/50'
                  }`}
              >
                <span className="text-lg"><filter.icon /></span>
                <span>{filter.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredImages.map((image, index) => (
            <motion.div
              key={`${image.category}-${index}`}
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative overflow-hidden rounded-2xl shadow-2xl"
            >
              <div className="relative h-80 overflow-hidden">
                <img
                  src={image.url}
                  alt={image.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-sangeet-neutral-900/80 via-transparent to-transparent"></div>
                
                <div className="absolute top-4 left-4">
                  <div className="bg-sangeet-400/90 backdrop-blur-md text-sangeet-neutral-950 px-3 py-1 rounded-full text-xs font-semibold">
                    {galleryFilters.find(f => f.id === image.category)?.label}
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-sangeet-400 transition-colors">
                    {image.title}
                  </h3>
                  <p className="text-sangeet-neutral-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {image.description}
                  </p>
                </div>
                <div className="absolute inset-0 bg-sangeet-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
