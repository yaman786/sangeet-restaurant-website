'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ImageIcon, Building2, PartyPopper, Theater, UtensilsCrossed } from 'lucide-react';

export const AboutGallery = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [galleryImages, setGalleryImages] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchMedia = async () => {
      try {
        const res = await fetch('/api/website/media');
        if (res.ok) {
          const data = await res.json();
          // Filter to only include gallery-related media (not default/hero)
          const validCategories = ['dining', 'celebrations', 'cultural', 'culinary', 'gallery'];
          const galleryData = data
            .filter((item: any) => validCategories.includes(item.media_key))
            .map((item: any) => ({
              url: item.file_path,
              title: item.alt_text || 'Experience Sangeet',
              description: item.caption || '',
              category: item.media_key
            }));
          
          if (galleryData.length > 0) {
            setGalleryImages(galleryData);
          }
        }
      } catch (err) {
        console.error('Failed to fetch gallery media', err);
      }
    };
    fetchMedia();
  }, []);

  const galleryFilters = [
    { id: 'all', label: 'All', icon: ImageIcon },
    { id: 'dining', label: 'Dining Areas', icon: Building2 },
    { id: 'celebrations', label: 'Celebrations', icon: PartyPopper },
    { id: 'cultural', label: 'Cultural Experience', icon: Theater },
    { id: 'culinary', label: 'Culinary Journey', icon: UtensilsCrossed }
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
          <div className="inline-flex items-center space-x-2 bg-linear-to-r from-sangeet-400/20 to-sangeet-red-500/20 backdrop-blur-md border border-sangeet-400/30 rounded-full px-6 py-2 mb-4">
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
                <Image
                  src={image.url}
                  alt={image.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-linear-to-t from-sangeet-neutral-900/80 via-transparent to-transparent"></div>
                
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
        {/* If no images uploaded yet */}
        {galleryImages.length === 0 && (
          <div className="text-center py-20 text-sangeet-neutral-400">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold">More Memories Coming Soon!</h3>
            <p className="mt-2 text-sm">We are currently curating our photo gallery. Check back soon.</p>
          </div>
        )}
      </div>
    </section>
  );
};
