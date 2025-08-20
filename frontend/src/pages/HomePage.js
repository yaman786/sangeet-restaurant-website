import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import logo from '../assets/images/logo.png';
import ReviewsSection from '../components/ReviewsSection';

/**
 * HomePage Component
 * Main landing page for Sangeet Restaurant
 * Features: Hero section, dining areas, social proof, events, and journey story
 * Enhanced mobile experience with touch gestures and optimized layouts
 * 
 * @param {Object} props - Component props
 * @param {Array} props.menuItems - Array of menu items
 * @param {Array} props.reviews - Array of customer reviews
 * @param {Array} props.events - Array of upcoming events
 */
const HomePage = ({ menuItems, reviews, events }) => {
  const navigate = useNavigate();
  
  // Navigation functions for quick actions
  const handleBookTable = () => {
    navigate('/reservations');
  };
  
  const handleViewMenu = () => {
    navigate('/menu');
  };
  
  const handleCallNow = () => {
    window.location.href = 'tel:+85223456789';
  };
  
  const handleDirections = () => {
    // Open Google Maps with restaurant location
    const address = encodeURIComponent('Wanchai, Hong Kong');
    const url = `https://www.google.com/maps/search/?api=1&query=${address}`;
    window.open(url, '_blank');
  };
  
  // State management for carousel functionality
  // eslint-disable-next-line no-unused-vars
  const [currentSlide, setCurrentSlide] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [mobileCurrentSlide, setMobileCurrentSlide] = useState(0);
  const [currentEventsSlide, setCurrentEventsSlide] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Scroll animations for hero section
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Restaurant operating hours and status
  const isOpen = currentTime.getHours() >= 18 && currentTime.getHours() < 23;

  // Constants for reusable data
  // eslint-disable-next-line no-unused-vars
  const DINING_AREAS = [
    {
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=800&fit=crop",
      title: "Main Dining Hall",
      subtitle: "Elegant & Spacious",
      description: "Our grand dining hall accommodates 150+ guests with sophisticated decor and warm lighting, perfect for family gatherings and celebrations",
      capacity: "150+ Seats",
      bestFor: "Family Gatherings, Celebrations",
      features: ["Sophisticated Decor", "Warm Lighting", "Group Seating"]
    },
    {
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=800&fit=crop",
      title: "Bar & Lounge",
      subtitle: "Modern & Casual",
      description: "Contemporary bar area with craft cocktails and casual dining, perfect for pre-dinner drinks or light meals",
      capacity: "Cozy",
      bestFor: "Drinks & Appetizers, Casual Dining",
      features: ["Craft Cocktails", "Casual Seating", "Bar Service"]
    },
    {
      image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&h=800&fit=crop",
      title: "Private Dining Room",
      subtitle: "Exclusive & Intimate",
      description: "Exclusive private dining space for intimate gatherings, business meetings, and special occasions",
      capacity: "Intimate",
      bestFor: "Business Meetings, Special Occasions",
      features: ["Private Service", "Customized Menu", "Intimate Setting"]
    }
  ];

  const HERO_STATS = [
    { value: "5,300", label: "Sq Ft" },
    { value: "150+", label: "Seats" },
    { value: "100+", label: "Family Recipes" }
  ];

  const QUICK_STATS = [
    { label: "Wait Time", value: "15 min", color: "text-green-400" },
    { label: "Capacity", value: "85%", color: "text-yellow-400" },
    { label: "Perfect For", value: "Indoor Dining", color: "text-blue-400" }
  ];

  const JOURNEY_STATS = [
    { number: "5,300", label: "Sq Ft", icon: "🏠" },
    { number: "100+", label: "Family Recipes", icon: "📜" },
    { number: "150+", label: "Seat Capacity", icon: "🪑" },
    { number: "3", label: "Dining Areas", icon: "🍽️" }
  ];

  const JOURNEY_STORY = [
    {
      icon: "👨‍🍳",
      title: "Chef's Passion",
      description: "Our head chef brings authentic South Asian cooking expertise, trained in traditional techniques and passionate about preserving authentic flavors.",
      highlight: "Authentic Techniques"
    },
    {
      icon: "👨‍👩‍👧‍👦",
      title: "Family Heritage",
      description: "Every recipe comes from generations of family tradition, passed down through the years to create authentic South Asian dining experiences.",
      highlight: "Generations of Recipes"
    },
    {
      icon: "🌟",
      title: "Our Dream",
      description: "We dreamed of bringing the authentic taste of South Asia to Hong Kong - where every dish tells a story and every meal creates memories.",
      highlight: "Authentic South Asian Flavors"
    },
    {
      icon: "🏠",
      title: "Perfect Location",
      description: "Chose Wanchai for its vibrant community and food culture - the perfect place to share our passion for authentic South Asian cuisine.",
      highlight: "Vibrant Wanchai Community"
    }
  ];

  // eslint-disable-next-line no-unused-vars
  const AWARDS = [
    { icon: "🏆", title: "Best New Restaurant", subtitle: "Hong Kong Food Awards 2024" },
    { icon: "👨‍👩‍👧‍👦", title: "Family Favorite", subtitle: "Local Community Choice" },
    { icon: "🎖️", title: "Chef's Choice Award", subtitle: "Culinary Excellence" }
  ];

  // Sample upcoming events data
  const UPCOMING_EVENTS = [
    {
      id: 1,
      title: "Diwali Festival Celebration",
      description: "Join us for a spectacular Diwali celebration with traditional South Asian cuisine, live music, and cultural performances. Special menu featuring festival favorites.",
      date: "2024-11-12",
      time: "6:00 PM - 11:00 PM",
      image_url: "https://images.unsplash.com/photo-1606220838315-056192d5e927?w=800&h=600&fit=crop",
      category: "Cultural Festival",
      price: "From $45",
      badge: "Limited Seats"
    },
    {
      id: 2,
      title: "Bollywood Night",
      description: "Dance the night away with live Bollywood music, traditional dance performances, and a special menu inspired by Indian cinema culture.",
      date: "2024-11-25",
      time: "8:00 PM - 1:00 AM",
      image_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
      category: "Entertainment",
      price: "From $35",
      badge: "Popular"
    },
    {
      id: 3,
      title: "Corporate Lunch Special",
      description: "Perfect for business meetings and corporate events. Special group menus and private dining options available.",
      date: "2024-12-02",
      time: "12:00 PM - 3:00 PM",
      image_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
      category: "Business",
      price: "From $25",
      badge: "Group Discount"
    },
    {
      id: 4,
      title: "Holiday Season Gala",
      description: "Celebrate the holiday season with our grand gala dinner featuring traditional South Asian holiday dishes and festive decorations.",
      date: "2024-12-15",
      time: "6:30 PM - 11:30 PM",
      image_url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop",
      category: "Holiday",
      price: "From $65",
      badge: "Seasonal"
    }
  ];

  const TRUST_INDICATORS = [
    { icon: "🎖️", text: "Award Winning", subtext: "Best Indian Restaurant 2024" },
    { icon: "⭐", text: "Customer Favorite", subtext: "500+ Happy Guests" },
    { icon: "🕒", text: "Open Daily", subtext: "6 PM - 11 PM" }
  ];

  // Carousel navigation functions
  // eslint-disable-next-line no-unused-vars
  const navigateCarousel = (direction) => {
    setCurrentSlide((prev) => {
      const newSlide = prev + direction;
      if (newSlide < 0) return 2;
      if (newSlide > 2) return 0;
      return newSlide;
    });
  };

  // eslint-disable-next-line no-unused-vars
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // eslint-disable-next-line no-unused-vars
  const navigateMobileCarousel = (direction) => {
    setMobileCurrentSlide((prev) => {
      const newSlide = prev + direction;
      if (newSlide < 0) return 2;
      if (newSlide > 2) return 0;
      return newSlide;
    });
  };

  // eslint-disable-next-line no-unused-vars
  const goToMobileSlide = (index) => {
    setMobileCurrentSlide(index);
  };

  // Events carousel navigation
  const navigateEventsCarousel = (direction) => {
    const totalEvents = UPCOMING_EVENTS.length;
    setCurrentEventsSlide(prev => {
      if (direction === 1) {
        return prev === totalEvents - 1 ? 0 : prev + 1;
      } else {
        return prev === 0 ? totalEvents - 1 : prev - 1;
      }
    });
  };

  const goToEventsSlide = (index) => {
    setCurrentEventsSlide(index);
  };

  // Auto-play carousel effect with performance optimization
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
      setMobileCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);
    
    // Cleanup on component unmount
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);





  // Reusable components
  const QuickActionButton = ({ icon, text, isPrimary = false, onClick }) => (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex items-center space-x-2 px-5 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg ${
        isPrimary 
          ? 'bg-gradient-to-r from-sangeet-400 to-sangeet-500 text-sangeet-neutral-950 hover:from-sangeet-300 hover:to-sangeet-400 ring-2 ring-sangeet-400/20' 
          : 'bg-sangeet-neutral-800/80 text-sangeet-400 hover:bg-sangeet-neutral-700/90 border border-sangeet-neutral-600/50 hover:border-sangeet-neutral-500'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="tracking-wide">{text}</span>
    </motion.button>
  );

  const StatCard = ({ value, label }) => (
    <div className="text-center group hover:scale-105 transition-transform duration-300">
      <div className="text-sm sm:text-base md:text-xl font-bold text-yellow-300 mb-1 group-hover:text-yellow-200 transition-colors drop-shadow-lg">{value}</div>
      <div className="text-xs text-orange-200 font-semibold group-hover:text-orange-100 transition-colors">{label}</div>
    </div>
  );

  const QuickStatCard = ({ label, value, color }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 1.4 }}
      className="text-center group hover:scale-105 transition-transform duration-300"
    >
      <div className={`text-lg font-bold ${color} mb-1`}>
        {value}
      </div>
      <div className="text-sangeet-neutral-400 text-xs">
        {label}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen">
      {/* Quick Actions Bar - Desktop */}
      <div className="hidden md:block fixed top-20 left-1/2 transform -translate-x-1/2 z-40">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex items-center space-x-4 bg-gradient-to-r from-sangeet-neutral-950/98 to-sangeet-neutral-900/98 backdrop-blur-2xl rounded-full px-8 py-4 border border-sangeet-neutral-600/50 shadow-2xl shadow-black/50"
        >
          <QuickActionButton icon="📅" text="Book Table" isPrimary={true} onClick={handleBookTable} />
          <QuickActionButton icon="📋" text="View Menu" onClick={handleViewMenu} />
          <QuickActionButton icon="📞" text="Call Now" onClick={handleCallNow} />
          <QuickActionButton icon="📍" text="Directions" onClick={handleDirections} />
        </motion.div>
      </div>

      {/* Quick Actions Bar - Mobile */}
      <div className="md:hidden fixed top-16 left-1/2 transform -translate-x-1/2 z-40 w-full px-4">
        {/* Status Bar - Mobile Only */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex justify-center mb-3"
        >
          <div className="flex items-center justify-center space-x-4 bg-sangeet-neutral-900/95 backdrop-blur-md rounded-full px-5 py-4 border-2 border-yellow-400/60 max-w-sm mx-auto shadow-xl">
            <div className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded-full ${isOpen ? 'bg-green-400' : 'bg-red-400'} animate-pulse shadow-lg`}></div>
              <span className={`text-sm font-bold ${isOpen ? 'text-green-300' : 'text-red-300'}`}>
                {isOpen ? 'OPEN NOW' : 'CLOSED'}
              </span>
            </div>
            <div className="text-sm text-yellow-200 font-bold">
              {isOpen ? 'Closes at 11:00 PM' : 'Opens at 6:00 PM'}
            </div>
            <div className="text-sm text-orange-200 font-bold">
              📍 Wanchai
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex justify-between items-center bg-gradient-to-r from-sangeet-neutral-950/98 to-sangeet-neutral-900/98 backdrop-blur-2xl rounded-2xl px-6 py-4 border border-sangeet-neutral-600/50 shadow-2xl shadow-black/50"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBookTable}
            className="flex flex-col items-center space-y-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-sangeet-neutral-950 px-2 py-1.5 md:px-1 md:py-0.5 rounded-lg font-bold hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 shadow-lg touch-manipulation"
          >
            <span className="text-base md:text-xs">📅</span>
            <span className="text-xs font-bold">Book</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleViewMenu}
            className="flex flex-col items-center space-y-1 bg-sangeet-neutral-800 text-yellow-300 px-2 py-1.5 md:px-1 md:py-0.5 rounded-lg font-bold hover:bg-sangeet-neutral-700 transition-all duration-300 border border-yellow-400/50 touch-manipulation"
          >
            <span className="text-base md:text-xs">📋</span>
            <span className="text-xs font-bold">Menu</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCallNow}
            className="flex flex-col items-center space-y-1 bg-sangeet-neutral-800 text-orange-300 px-2 py-1.5 md:px-1 md:py-0.5 rounded-lg font-bold hover:bg-sangeet-neutral-700 transition-all duration-300 border border-orange-400/50 touch-manipulation"
          >
            <span className="text-base md:text-xs">📞</span>
            <span className="text-xs font-bold">Call</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDirections}
            className="flex flex-col items-center space-y-1 bg-sangeet-neutral-800 text-red-300 px-2 py-1.5 md:px-1 md:py-0.5 rounded-lg font-bold hover:bg-sangeet-neutral-700 transition-all duration-300 border border-red-400/50 touch-manipulation"
          >
            <span className="text-base md:text-xs">📍</span>
            <span className="text-xs font-bold">Map</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Enhanced Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&h=1080&fit=crop"
          >
            <source src="https://player.vimeo.com/external/434045526.sd.mp4?s=c27eecc69a27dbc4ff2b87d38afc35f1a9e7c02d&profile_id=164&oauth2_token_id=57447761" type="video/mp4" />
            <img 
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&h=1080&fit=crop" 
              alt="Restaurant ambiance"
              className="w-full h-full object-cover"
            />
          </video>
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-sangeet-neutral-900/80 via-sangeet-neutral-800/70 to-sangeet-neutral-900/80 z-10"></div>
        
        {/* Mobile Scroll Indicator - Bottom Right */}
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-24 right-6 z-20 md:hidden"
        >
                      <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-12 border-2 border-white/80 rounded-full flex justify-center shadow-lg">
                <motion.div
                  animate={{ y: [0, 16, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-1.5 h-4 bg-white/90 rounded-full mt-2"
                />
              </div>
              <span className="text-sm text-white/90 font-bold">Scroll</span>
            </div>
        </motion.div>
        
                                {/* Main Content */}
                <motion.div
                  style={{ y, opacity }}
                  className="relative z-20 text-center text-white px-4 max-w-6xl mx-auto flex flex-col justify-start md:justify-start items-center h-full pt-32 md:pt-40"
                >
          

          {/* Logo Animation - Mobile Only */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-8 md:mb-10 md:hidden"
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/40 via-orange-400/30 to-red-500/40 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/20 via-orange-300/15 to-red-400/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <img 
                src={logo} 
                alt="Sangeet Restaurant" 
                className="relative h-48 sm:h-64 w-auto logo-navbar-dark drop-shadow-2xl brightness-150 contrast-150 filter drop-shadow-lg"
              />
            </div>
          </motion.div>
        

        
          {/* Mobile-First Main Heading */}
                                  <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-2xl sm:text-3xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-4 sm:mb-4 md:mb-6 px-4"
            >
              <span className="text-white">Experience</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-red-400 drop-shadow-lg font-extrabold">
                South Asian Elegance<span className="hidden md:inline"> at</span>
              </span>
            </motion.h1>
            
            {/* Logo Below Heading - Desktop Only */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="hidden md:flex justify-center mb-2"
            >
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/40 via-orange-400/30 to-red-500/40 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/20 via-orange-300/15 to-red-400/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <img 
                  src={logo} 
                  alt="Sangeet Restaurant" 
                  className="relative h-20 md:h-24 lg:h-28 xl:h-32 w-auto logo-navbar-dark drop-shadow-2xl brightness-150 contrast-150 filter drop-shadow-lg"
                />
              </div>
            </motion.div>
            

          
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-base md:text-lg text-sangeet-neutral-100 mb-5 md:mb-8 max-w-2xl mx-auto px-4 font-semibold"
          >
            Authentic South Asian cuisine in the heart of Hong Kong. Where tradition meets modern dining excellence.
          </motion.p>

          {/* Hero Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex justify-center space-x-3 md:space-x-8 mb-4 md:mb-8 text-sangeet-neutral-200 px-4"
          >
            {HERO_STATS.map((stat, index) => (
              <StatCard key={index} value={stat.value} label={stat.label} />
            ))}
          </motion.div>

          {/* Quick Stats Bar - Desktop */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="hidden md:block max-w-3xl mx-auto mb-6"
          >
            <div className="bg-sangeet-neutral-900/50 backdrop-blur-md rounded-2xl p-4 border border-sangeet-neutral-700">
              <div className="grid grid-cols-4 gap-6">
                {QUICK_STATS.map((stat, index) => (
                  <QuickStatCard key={index} {...stat} />
                ))}
              </div>
            </div>
          </motion.div>


        </motion.div>

        {/* Scroll Indicator - Hidden on Mobile */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute bottom-20 right-6 z-20 hidden md:block"
        >
          <div className="flex flex-col items-center space-y-2 text-sangeet-neutral-300 bg-sangeet-neutral-900/40 backdrop-blur-md rounded-full px-4 py-3 border border-sangeet-neutral-600/30 shadow-lg">
            <span className="text-sm font-medium tracking-wide">Scroll to explore</span>
            <div className="w-5 h-8 border border-sangeet-neutral-400/70 rounded-full flex justify-center">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-3 bg-sangeet-neutral-400/80 rounded-full mt-1"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Events Section */}
      <section className="py-16 bg-sangeet-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-sangeet-red-500/20 to-sangeet-400/20 backdrop-blur-md border border-sangeet-red-500/30 rounded-full px-4 py-1.5 mb-3">
              <span className="text-lg">🎉</span>
              <span className="text-sangeet-400 font-semibold text-sm">Upcoming Events</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-sangeet-400 mb-3">Join Our Celebrations</h2>
            <p className="text-sangeet-neutral-400 text-base max-w-2xl mx-auto">
              Experience South Asian culture through special events, festivals, and exclusive dining experiences
            </p>
          </motion.div>

          {/* Desktop Events Carousel - Optimized */}
          <div className="hidden md:block">
            <div className="relative">
              {/* Carousel Container */}
              <div className="relative overflow-hidden rounded-2xl">
                <div 
                  className="flex transition-transform duration-500 ease-in-out" 
                  style={{ transform: `translateX(-${currentEventsSlide * 100}%)` }}
                >
                  {UPCOMING_EVENTS.map((event, index) => (
                    <div key={event.id} className="w-full flex-shrink-0">
                      <div className="relative h-[450px] group">
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-sangeet-neutral-900/90 via-sangeet-neutral-900/30 to-transparent"></div>
                        
                        {/* Content Overlay - Compact */}
                        <div className="absolute bottom-6 left-6 right-6">
                          <div className="bg-sangeet-neutral-900/95 backdrop-blur-md rounded-xl p-6 border border-sangeet-neutral-700">
                            {/* Header Row */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="bg-gradient-to-r from-sangeet-red-500 to-sangeet-400 text-white px-3 py-1 rounded-full font-bold text-xs">
                                {event.badge}
                              </div>
                              <div className="text-sangeet-400 font-semibold text-base">
                                {event.price}
                              </div>
                            </div>
                            
                            {/* Event Title */}
                            <h3 className="text-xl font-bold text-sangeet-400 mb-2 line-clamp-1">{event.title}</h3>
                            
                            {/* Event Description - Truncated */}
                            <p className="text-sangeet-neutral-300 text-sm mb-3 leading-relaxed line-clamp-2">{event.description}</p>
                            
                            {/* Date, Time & Category - Compact */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-1">
                                  <span className="text-sangeet-400 text-sm">📅</span>
                                  <span className="text-sangeet-neutral-300 text-xs">
                                    {new Date(event.date).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <span className="text-sangeet-400 text-sm">⏰</span>
                                  <span className="text-sangeet-neutral-300 text-xs">{event.time.split(' ')[0]}</span>
                                </div>
                              </div>
                              <div className="bg-sangeet-400/20 text-sangeet-400 px-2 py-1 rounded-full text-xs font-semibold">
                                {event.category}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={() => navigateEventsCarousel(-1)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-sangeet-neutral-900/80 backdrop-blur-md text-sangeet-400 p-3 rounded-full hover:bg-sangeet-neutral-800 transition-all duration-300 z-10"
                aria-label="Previous event"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={() => navigateEventsCarousel(1)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-sangeet-neutral-900/80 backdrop-blur-md text-sangeet-400 p-3 rounded-full hover:bg-sangeet-neutral-800 transition-all duration-300 z-10"
                aria-label="Next event"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                {UPCOMING_EVENTS.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToEventsSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentEventsSlide ? 'bg-sangeet-400' : 'bg-sangeet-neutral-600 hover:bg-sangeet-neutral-500'
                    }`}
                    aria-label={`Go to event ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Events Carousel - Optimized */}
          <div className="md:hidden block">
            <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide">
              {UPCOMING_EVENTS.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex-shrink-0 w-72 bg-sangeet-neutral-900 rounded-xl overflow-hidden shadow-lg"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-sangeet-neutral-900/70 to-transparent"></div>
                    
                    {/* Badge & Price - Compact */}
                    <div className="absolute top-2 left-2 right-2 flex justify-between">
                      <div className="bg-gradient-to-r from-sangeet-red-500 to-sangeet-400 text-white px-2 py-1 rounded-full font-bold text-xs">
                        {event.badge}
                      </div>
                      <div className="bg-sangeet-neutral-900/90 backdrop-blur-sm text-sangeet-400 px-2 py-1 rounded-full font-semibold text-xs">
                        {event.price}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <h3 className="text-base font-bold text-sangeet-400 mb-1 line-clamp-1">{event.title}</h3>
                    <p className="text-sangeet-neutral-400 text-xs mb-2 line-clamp-2 leading-relaxed">{event.description}</p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1">
                        <span className="text-sangeet-400 text-xs">📅</span>
                        <span className="text-sangeet-neutral-300 text-xs">
                          {new Date(event.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="bg-sangeet-400/20 text-sangeet-400 px-2 py-0.5 rounded-full font-semibold text-xs">
                        {event.category}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Follow Our Journey Section */}
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
              From humble beginnings to becoming Hong Kong's favorite South Asian restaurant. Discover the passion, tradition, and innovation behind every dish.
            </p>
          </motion.div>

          {/* Journey Story - Desktop */}
          <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Story Content */}
            <div className="space-y-8">
              {JOURNEY_STORY.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-start space-x-4 p-6 bg-sangeet-neutral-900/50 backdrop-blur-md rounded-2xl border border-sangeet-neutral-700 hover:border-sangeet-400/50 transition-all duration-300 group"
                >
                  <div className="text-3xl group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-sangeet-400 font-bold text-lg">{item.title}</h3>
                      <div className="bg-sangeet-red-500/20 text-sangeet-red-400 px-2 py-1 rounded-full text-xs font-semibold">
                        {item.highlight}
                      </div>
                    </div>
                    <p className="text-sangeet-neutral-300 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Visual Story */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative overflow-hidden rounded-3xl group"
              >
                <img
                  src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop"
                  alt="Chef preparing authentic South Asian dishes"
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-sangeet-neutral-900/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-sangeet-neutral-900/80 backdrop-blur-md rounded-2xl p-6 border border-sangeet-neutral-700">
                    <h4 className="text-sangeet-400 font-bold text-xl mb-2">Authentic South Asian Cuisine</h4>
                    <p className="text-sangeet-neutral-300 text-sm">
                      Every dish is crafted with passion, tradition, and the finest ingredients to bring you the true taste of South Asia
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                {JOURNEY_STATS.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-sangeet-neutral-900/50 backdrop-blur-md rounded-xl p-4 border border-sangeet-neutral-700 text-center"
                  >
                    <div className="text-2xl mb-2">{stat.icon}</div>
                    <div className="text-sangeet-400 font-bold text-xl">{stat.number}</div>
                    <div className="text-sangeet-neutral-400 text-xs">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Journey Story - Mobile */}
          <div className="md:hidden space-y-6">
            {/* Main Story Image */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative overflow-hidden rounded-2xl group"
            >
              <img
                src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop"
                alt="Chef preparing authentic South Asian dishes"
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-sangeet-neutral-900/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-sangeet-neutral-900/80 backdrop-blur-md rounded-xl p-4 border border-sangeet-neutral-700">
                  <h4 className="text-sangeet-400 font-bold text-lg mb-1">Authentic South Asian Cuisine</h4>
                  <p className="text-sangeet-neutral-300 text-xs">
                    Every dish is crafted with passion, tradition, and the finest ingredients
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Story Cards */}
            {JOURNEY_STORY.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex items-start space-x-4 p-4 bg-sangeet-neutral-900/50 backdrop-blur-md rounded-xl border border-sangeet-neutral-700"
              >
                <div className="text-2xl">{item.icon}</div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-sangeet-400 font-bold text-base">{item.title}</h3>
                    <div className="bg-sangeet-red-500/20 text-sangeet-red-400 px-2 py-1 rounded-full text-xs font-semibold">
                      {item.highlight}
                    </div>
                  </div>
                  <p className="text-sangeet-neutral-300 text-xs leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}

            {/* Mobile Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {JOURNEY_STATS.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-sangeet-neutral-900/50 backdrop-blur-md rounded-xl p-3 border border-sangeet-neutral-700 text-center"
                >
                  <div className="text-xl mb-1">{stat.icon}</div>
                  <div className="text-sangeet-400 font-bold text-lg">{stat.number}</div>
                  <div className="text-sangeet-neutral-400 text-xs">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA for Journey */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-16"
          >
            <Link
              to="/about"
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-sangeet-400 to-sangeet-500 text-sangeet-neutral-950 px-8 py-4 rounded-2xl font-bold text-lg hover:from-sangeet-300 hover:to-sangeet-400 transition-all duration-300 shadow-2xl hover:shadow-sangeet-400/30"
            >
              <span>📖</span>
              <span>Read Our Full Story</span>
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <ReviewsSection />

      {/* Enhanced CTA Section - Final Call to Action */}
      <section className="relative py-24 bg-gradient-to-br from-sangeet-neutral-900 via-sangeet-neutral-800 to-sangeet-neutral-900 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-sangeet-400/5 to-sangeet-red-500/5"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f4d95c' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-8">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              <h2 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="text-white">Ready to Experience</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-red-400 drop-shadow-lg">
                  Authentic Flavors?
                </span>
              </h2>
              <p className="text-xl md:text-2xl text-orange-200 font-semibold mb-8 max-w-4xl mx-auto leading-relaxed">
                Book your table today and embark on a culinary journey through India and Nepal. 
                <span className="text-yellow-300 font-bold"> Every meal is a celebration of culture and tradition.</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mx-auto mb-12">
              {/* Primary CTA - Book Table */}
              <motion.div 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto"
              >
                <Link
                  to="/reservations"
                  className="flex items-center justify-center space-x-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-sangeet-neutral-950 px-6 py-4 md:px-10 md:py-5 rounded-2xl font-bold text-lg md:text-xl hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 shadow-2xl hover:shadow-orange-400/30 touch-manipulation min-h-[56px]"
                >
                  <span className="text-xl md:text-2xl">📅</span>
                  <span>Book Your Table</span>
                  <motion.span
                    animate={{ x: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </Link>
              </motion.div>
              
              {/* Secondary CTA - Call Now */}
              <motion.div 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto"
              >
                <Link
                  href="tel:+85223456789"
                  className="flex items-center justify-center space-x-3 border-2 border-red-500 text-red-300 px-6 py-4 md:px-10 md:py-5 rounded-2xl font-bold text-lg md:text-xl hover:bg-red-500 hover:text-white transition-all duration-300 shadow-2xl hover:shadow-red-500/30 backdrop-blur-sm touch-manipulation min-h-[56px]"
                >
                  <span className="text-xl md:text-2xl">📞</span>
                  <span>Call Now</span>
                  <motion.span
                    animate={{ x: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  >
                    →
                  </motion.span>
                </Link>
              </motion.div>
            </div>

            {/* Mobile-Optimized Trust Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 max-w-4xl mx-auto">
              {TRUST_INDICATORS.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="text-center"
                >
                  <div className="text-2xl md:text-3xl mb-1 md:mb-2">{item.icon}</div>
                  <div className="text-sangeet-400 font-bold text-base md:text-lg">{item.text}</div>
                  <div className="text-sangeet-neutral-500 text-xs md:text-sm">{item.subtext}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>


    </div>
  );
};

export default HomePage; 