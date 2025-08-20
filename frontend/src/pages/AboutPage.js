import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/**
 * AboutPage Component - Streamlined Essential Sections
 * Features: Hero video, simplified story, gallery with filters, team, and CTA
 */
const AboutPage = () => {
  const navigate = useNavigate();
  // Gallery filter state
  const [activeFilter, setActiveFilter] = useState('all');

  // Gallery filter options
  const galleryFilters = [
    { id: 'all', label: 'All', icon: '🖼️' },
    { id: 'dining', label: 'Dining Areas', icon: '🏛️' },
    { id: 'celebrations', label: 'Celebrations', icon: '🎉' },
    { id: 'cultural', label: 'Cultural Experience', icon: '🎭' },
    { id: 'culinary', label: 'Culinary Journey', icon: '🍳' }
  ];

  // Enhanced gallery images with categories
  const galleryImages = [
    // Dining Areas
    {
      url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
      title: "Main Dining Hall",
      description: "Our grand dining hall accommodates 150+ guests with sophisticated decor and warm lighting",
      category: "dining"
    },
    {
      url: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop",
      title: "Private Dining Room",
      description: "Intimate private dining spaces perfect for special occasions and celebrations",
      category: "dining"
    },
    {
      url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
      title: "Bar & Lounge",
      description: "Relax with premium spirits and handcrafted cocktails in our elegant bar area",
      category: "dining"
    },
    
    // Celebrations
    {
      url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop",
      title: "Birthday Celebration",
      description: "Creating memorable birthday celebrations with authentic South Asian hospitality",
      category: "celebrations"
    },
    {
      url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&h=600&fit=crop",
      title: "Wedding Reception",
      description: "Elegant wedding receptions with traditional South Asian wedding customs",
      category: "celebrations"
    },
    {
      url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop",
      title: "Family Gathering",
      description: "Warm family gatherings celebrating special moments and traditions",
      category: "celebrations"
    },
    
    // Cultural Experience
    {
      url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
      title: "Live Music Performance",
      description: "Traditional South Asian music performances that create an authentic atmosphere",
      category: "cultural"
    },
    {
      url: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&h=600&fit=crop",
      title: "Traditional Dance",
      description: "Cultural dance performances that bring South Asian heritage to life",
      category: "cultural"
    },
    {
      url: "https://images.unsplash.com/photo-1606220838315-056192d5e927?w=800&h=600&fit=crop",
      title: "Cultural Decor",
      description: "Authentic South Asian decor and traditional elements throughout our space",
      category: "cultural"
    },
    
    // Culinary Journey
    {
      url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop",
      title: "Traditional Cooking",
      description: "Behind-the-scenes look at our traditional cooking methods and techniques",
      category: "culinary"
    },
    {
      url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&h=600&fit=crop",
      title: "Signature Dishes",
      description: "Our most popular dishes showcasing the diversity of South Asian cuisine",
      category: "culinary"
    }
  ];

  // Filter gallery images based on active filter
  const filteredImages = activeFilter === 'all' 
    ? galleryImages 
    : galleryImages.filter(image => image.category === activeFilter);

  // Unique story highlights with diverse focus
  const storyHighlights = [
    {
      icon: "🌟",
      title: "Innovation Meets Tradition",
      description: "Chef Rajesh Kumar's creative approach to classic South Asian recipes, blending authentic flavors with contemporary techniques"
    },
    {
      icon: "🏛️",
      title: "Versatile Venue",
      description: "Multiple dining spaces designed for every occasion - from romantic dinners to corporate events and cultural celebrations"
    },
    {
      icon: "🎭",
      title: "Living Culture",
      description: "Daily live performances featuring traditional music, dance, and cultural storytelling that bring South Asian heritage to life"
    }
  ];

  // Key statistics
  const keyStats = [
    { number: "150+", label: "Seat Capacity", icon: "🍽️" },
    { number: "5,300", label: "Sq Ft Space", icon: "🏛️" },
    { number: "100+", label: "Family Recipes", icon: "📜" }
  ];

  // Enhanced team members with strategic positioning
  const teamMembers = [
    {
      name: "Chef Rajesh Kumar",
      role: "Executive Chef & Culinary Director",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      description: "Award-winning chef with 15+ years crafting authentic South Asian cuisine. His signature dishes blend traditional techniques with modern innovation, earning recognition in Hong Kong's culinary scene."
    },
    {
      name: "Priya Sharma",
      role: "General Manager & Hospitality Director",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
      description: "Leading our team with 10+ years in luxury hospitality. Priya ensures every guest receives personalized attention and creates memorable experiences for celebrations and events."
    },
    {
      name: "Amit Patel",
      role: "Beverage Director & Sommelier",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      description: "Expert in premium spirits and wine pairings. Amit curates our extensive beverage program, featuring rare teas from the Himalayas and fine wines that complement our authentic cuisine."
    }
  ];

  // Enhanced awards and recognition with strategic positioning
  const awards = [
    {
      icon: "🏆",
      title: "Best New Restaurant 2024",
      description: "Hong Kong Food Awards - Excellence in South Asian Cuisine"
    },
    {
      icon: "⭐",
      title: "4.8/5 Customer Rating",
      description: "Based on 500+ verified reviews - Outstanding Service & Quality"
    },
    {
      icon: "🎭",
      title: "Cultural Excellence Award",
      description: "Hong Kong Tourism Board - Best Cultural Dining Experience"
    },
    {
      icon: "🍽️",
      title: "Chef's Choice Award",
      description: "Hong Kong Culinary Association - Innovation in Traditional Cuisine"
    }
  ];

  return (
    <div className="min-h-screen bg-sangeet-neutral-950">
      {/* Unique AboutPage Hero - Story-Focused Design */}
      <section className="relative min-h-screen bg-gradient-to-br from-sangeet-neutral-950 via-sangeet-neutral-900 to-sangeet-neutral-950">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1920&h=1080&fit=crop"
            alt="Chef preparing authentic South Asian cuisine"
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-sangeet-neutral-950 via-sangeet-neutral-900/95 to-sangeet-neutral-950"></div>
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
          🌟
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
          🎭
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
          🍽️
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
              <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-sangeet-400/20 to-sangeet-red-500/20 backdrop-blur-md border border-sangeet-400/30 rounded-full px-8 py-4">
                <span className="text-2xl">📖</span>
                <span className="text-sangeet-400 font-semibold text-lg">Our Story</span>
                <span className="text-2xl">✨</span>
              </div>
            </motion.div>

            {/* Main Headline - Better Typography */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-10 leading-tight px-4"
            >
              <span className="text-white">From Family</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sangeet-400 to-sangeet-red-500">
                Traditions
              </span>
              <br />
              <span className="text-white">To Your Table</span>
            </motion.h1>

            {/* Story Subtitle - Unique & Compelling */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="text-lg md:text-xl text-sangeet-neutral-300 mb-16 max-w-4xl mx-auto leading-relaxed px-4"
            >
              Welcome to Sangeet, where the soul of South Asia comes alive in the heart of Wanchai. 
              <span className="text-sangeet-400 font-semibold"> Rooted in vibrant traditions of music, dance, and culinary artistry</span>, 
              we're more than a dining destination—we're an immersive celebration of culture, community, and connection. 
              Every moment at Sangeet is crafted to create unforgettable memories.
            </motion.p>

            {/* Story Timeline Preview - Better Grid */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16 max-w-5xl mx-auto px-4"
            >
              <div className="bg-sangeet-neutral-900/50 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-sangeet-neutral-700 hover:border-sangeet-400/50 transition-all duration-300">
                <div className="text-3xl md:text-4xl mb-4">👨‍🍳</div>
                <h3 className="text-sangeet-400 font-bold text-lg md:text-xl mb-3">Chef's Signature</h3>
                <p className="text-sangeet-neutral-400 text-sm md:text-base">Chef Rajesh Kumar's innovative take on traditional South Asian flavors</p>
              </div>
              
              <div className="bg-sangeet-neutral-900/50 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-sangeet-neutral-700 hover:border-sangeet-400/50 transition-all duration-300">
                <div className="text-3xl md:text-4xl mb-4">🏛️</div>
                <h3 className="text-sangeet-400 font-bold text-lg md:text-xl mb-3">Sophisticated Spaces</h3>
                <p className="text-sangeet-neutral-400 text-sm md:text-base">Multiple dining areas designed for intimate dinners and grand celebrations</p>
              </div>
              
              <div className="bg-sangeet-neutral-900/50 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-sangeet-neutral-700 hover:border-sangeet-400/50 transition-all duration-300">
                <div className="text-3xl md:text-4xl mb-4">🎭</div>
                <h3 className="text-sangeet-400 font-bold text-lg md:text-xl mb-3">Cultural Immersion</h3>
                <p className="text-sangeet-neutral-400 text-sm md:text-base">Live performances and authentic decor that transport you to South Asia</p>
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
                className="bg-gradient-to-r from-sangeet-400 to-sangeet-500 text-sangeet-neutral-950 px-8 md:px-10 py-4 rounded-2xl font-bold text-lg md:text-xl hover:from-sangeet-300 hover:to-sangeet-400 transition-all duration-300 shadow-2xl hover:shadow-sangeet-400/30 flex items-center space-x-3"
              >
                <span className="text-xl md:text-2xl">📖</span>
                <span>Read Our Story</span>
                <motion.span
                  animate={{ x: [0, 8, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  →
                </motion.span>
              </motion.button>
              
              {/* Secondary CTA - Contact */}
              <motion.button
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className="bg-sangeet-neutral-800/80 backdrop-blur-md text-sangeet-400 px-6 md:px-8 py-4 rounded-2xl font-bold text-lg hover:bg-sangeet-neutral-700/80 transition-all duration-300 border border-sangeet-neutral-600 flex items-center space-x-3"
              >
                <span className="text-lg md:text-xl">💬</span>
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
                <span className="text-lg">🌶️</span>
                <span className="text-sm md:text-base">Authentic Spices</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg">🎵</span>
                <span className="text-sm md:text-base">Traditional Music</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg">💎</span>
                <span className="text-sm md:text-base">Luxury Experience</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg">❤️</span>
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
      <section className="py-20 bg-gradient-to-br from-sangeet-neutral-900 via-sangeet-neutral-800 to-sangeet-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-sangeet-400/20 to-sangeet-red-500/20 backdrop-blur-md border border-sangeet-400/30 rounded-full px-6 py-2 mb-4">
              <span className="text-2xl">🌟</span>
              <span className="text-sangeet-400 font-semibold">Our Story</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-sangeet-400 mb-4">Follow Our Journey</h2>
            <p className="text-sangeet-neutral-400 text-lg max-w-3xl mx-auto">
              Nestled in Wanchai's bustling center, Sangeet bridges the timeless and the contemporary. We create bespoke experiences where every dish tells a story, every performance celebrates heritage, and every moment becomes a cherished memory. From intimate dinners to grand celebrations, we're here to make your special occasions extraordinary.
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
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{highlight.icon}</div>
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
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-sangeet-400 font-bold text-3xl">{stat.number}</div>
                <div className="text-sangeet-neutral-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Restaurant Gallery Section with Filters */}
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
              Step into our world through these carefully curated moments. From intimate celebrations to grand cultural events, each photograph captures the essence of what makes Sangeet truly special - authentic flavors, warm hospitality, and unforgettable experiences.
            </p>
          </motion.div>

          {/* Filter Buttons - Desktop */}
          <div className="hidden md:flex flex-wrap justify-center gap-4 mb-12">
            {galleryFilters.map((filter) => (
              <motion.button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`inline-flex items-center space-x-2 px-6 py-3 rounded-full font-semibold text-lg transition-all duration-300 ${
                  activeFilter === filter.id
                    ? 'bg-sangeet-400 text-sangeet-neutral-950 shadow-lg'
                    : 'bg-sangeet-neutral-800/50 text-sangeet-neutral-400 hover:bg-sangeet-neutral-700/50 hover:text-sangeet-300'
                }`}
              >
                <span className="text-2xl">{filter.icon}</span>
                <span>{filter.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Filter Buttons - Mobile */}
          <div className="md:hidden overflow-x-auto scrollbar-hide mb-8">
            <div className="flex space-x-3 px-4">
              {galleryFilters.map((filter) => (
                <motion.button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-shrink-0 inline-flex items-center space-x-2 px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                    activeFilter === filter.id
                      ? 'bg-sangeet-400 text-sangeet-neutral-950 shadow-lg'
                      : 'bg-sangeet-neutral-800/50 text-sangeet-neutral-400 hover:bg-sangeet-neutral-700/50'
                  }`}
                >
                  <span className="text-lg">{filter.icon}</span>
                  <span>{filter.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Gallery Grid */}
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
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
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-sangeet-neutral-900/80 via-transparent to-transparent"></div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <div className="bg-sangeet-400/90 backdrop-blur-md text-sangeet-neutral-950 px-3 py-1 rounded-full text-xs font-semibold">
                      {galleryFilters.find(f => f.id === image.category)?.label}
                    </div>
                  </div>
                  
                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-sangeet-400 transition-colors">
                      {image.title}
                    </h3>
                    <p className="text-sangeet-neutral-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {image.description}
                    </p>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-sangeet-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* No Results Message */}
          {filteredImages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">📸</div>
              <h3 className="text-2xl font-bold text-sangeet-neutral-400 mb-2">No images found</h3>
              <p className="text-sangeet-neutral-500">Try selecting a different filter</p>
            </motion.div>
          )}
        </div>
      </section>

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
                className="group bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-2xl p-8 shadow-2xl hover:shadow-sangeet-400/20 transition-all duration-500 border border-sangeet-neutral-700 hover:border-sangeet-400"
              >
                <div className="text-center">
                  <div className="relative mb-6">
                    <div className="w-40 h-40 rounded-full mx-auto overflow-hidden border-4 border-sangeet-400/20 group-hover:border-sangeet-400/40 transition-all duration-300">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
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

      {/* Awards Section */}
      <section className="py-20 bg-gradient-to-br from-sangeet-neutral-950 via-sangeet-neutral-900 to-sangeet-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-sangeet-400 mb-4">Recognition & Awards</h2>
            <p className="text-sangeet-neutral-400 text-lg max-w-3xl mx-auto">Celebrating our achievements and commitment to culinary excellence</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {awards.map((award, index) => (
              <motion.div
                key={award.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-2xl p-8 shadow-2xl hover:shadow-sangeet-400/20 transition-all duration-500 border border-sangeet-neutral-700 hover:border-sangeet-400 text-center"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {award.icon}
                </div>
                <h3 className="text-xl font-bold text-sangeet-400 mb-3 group-hover:text-sangeet-300 transition-colors">
                  {award.title}
                </h3>
                <p className="text-sangeet-neutral-400 font-medium">
                  {award.description}
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
              Whether it's a romantic dinner, family celebration, or corporate event, we're here to make it extraordinary. 
              <span className="text-sangeet-400 font-semibold"> Reserve your table</span> and let us create memories that last a lifetime.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {/* Primary CTA - Book Table */}
              <motion.button
                onClick={() => navigate('/reservations')}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-sangeet-400 to-sangeet-500 text-sangeet-neutral-950 px-10 py-4 rounded-2xl font-bold text-xl hover:from-sangeet-300 hover:to-sangeet-400 transition-all duration-300 shadow-2xl hover:shadow-sangeet-400/30"
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