import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '../assets/images/logo.png';

/**
 * Footer Component
 * Mobile-first footer with responsive design
 * Features: Restaurant info, quick links, contact info, social media
 * Optimized for touch interactions and mobile performance
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-sangeet-neutral-950 via-sangeet-neutral-900 to-sangeet-neutral-950 border-t border-sangeet-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Restaurant Info */}
          <div className="col-span-1 md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6">
                <div className="relative mb-4 sm:mb-0 sm:mr-6">
                  {/* Logo with enhanced visibility */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-sangeet-400/20 to-sangeet-red-500/20 rounded-full blur-xl"></div>
                    <img 
                      src={logo} 
                      alt="Sangeet Restaurant" 
                      className="relative h-12 md:h-16 w-auto filter brightness-110 contrast-110"
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-lg md:text-xl font-bold text-sangeet-400 mb-1">Sangeet Restaurant</h3>
                  <p className="text-sangeet-neutral-400 text-sm">
                    Authentic South Asian Cuisine
                  </p>
                </div>
              </div>
              
              <p className="text-sangeet-neutral-300 mb-6 max-w-md leading-relaxed text-sm md:text-base">
                Where the soul of South Asia comes alive in the heart of Wanchai. 
                Experience the rich flavors and warm hospitality that make every meal memorable.
              </p>
              
              {/* Social Media Links */}
              <div className="flex space-x-3 md:space-x-4">
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-sangeet-400/10 to-sangeet-red-500/10 p-2.5 md:p-3 rounded-full border border-sangeet-400/20 text-sangeet-400 hover:text-sangeet-300 hover:border-sangeet-400/40 transition-all duration-300 touch-manipulation"
                  aria-label="Facebook"
                >
                  <svg className="h-4 w-4 md:h-5 md:w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </motion.a>
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-sangeet-400/10 to-sangeet-red-500/10 p-2.5 md:p-3 rounded-full border border-sangeet-400/20 text-sangeet-400 hover:text-sangeet-300 hover:border-sangeet-400/40 transition-all duration-300 touch-manipulation"
                  aria-label="Instagram"
                >
                  <svg className="h-4 w-4 md:h-5 md:w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z"/>
                  </svg>
                </motion.a>
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-sangeet-400/10 to-sangeet-red-500/10 p-2.5 md:p-3 rounded-full border border-sangeet-400/20 text-sangeet-400 hover:text-sangeet-300 hover:border-sangeet-400/40 transition-all duration-300 touch-manipulation"
                  aria-label="Twitter"
                >
                  <svg className="h-4 w-4 md:h-5 md:w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </motion.a>
              </div>
            </motion.div>
          </div>

          {/* Quick Links */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h4 className="text-lg md:text-xl font-bold text-sangeet-400 mb-4 md:mb-6">Quick Links</h4>
              <ul className="space-y-2 md:space-y-3">
                <li>
                  <Link to="/menu" className="text-sangeet-neutral-300 hover:text-sangeet-400 transition-colors duration-300 flex items-center group text-sm md:text-base touch-manipulation py-1">
                    <span className="mr-2 text-sangeet-400 group-hover:translate-x-1 transition-transform duration-300">→</span>
                    Our Menu
                  </Link>
                </li>
                <li>
                  <Link to="/reservations" className="text-sangeet-neutral-300 hover:text-sangeet-400 transition-colors duration-300 flex items-center group text-sm md:text-base touch-manipulation py-1">
                    <span className="mr-2 text-sangeet-400 group-hover:translate-x-1 transition-transform duration-300">→</span>
                    Make Reservation
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-sangeet-neutral-300 hover:text-sangeet-400 transition-colors duration-300 flex items-center group text-sm md:text-base touch-manipulation py-1">
                    <span className="mr-2 text-sangeet-400 group-hover:translate-x-1 transition-transform duration-300">→</span>
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-sangeet-neutral-300 hover:text-sangeet-400 transition-colors duration-300 flex items-center group text-sm md:text-base touch-manipulation py-1">
                    <span className="mr-2 text-sangeet-400 group-hover:translate-x-1 transition-transform duration-300">→</span>
                    Contact
                  </Link>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Contact Info */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h4 className="text-lg md:text-xl font-bold text-sangeet-400 mb-4 md:mb-6">Contact Info</h4>
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-4 w-4 text-sangeet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sangeet-neutral-300 text-sm md:text-base">Wanchai, Hong Kong</p>
                    <p className="text-sangeet-neutral-400 text-xs md:text-sm">Central District</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-4 w-4 text-sangeet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <a 
                      href="tel:+85223456789" 
                      className="text-sangeet-neutral-300 hover:text-sangeet-400 transition-colors duration-300 text-sm md:text-base touch-manipulation"
                    >
                      +852 2345 6789
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-4 w-4 text-sangeet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sangeet-neutral-300 text-sm md:text-base">6:00 PM - 11:00 PM</p>
                    <p className="text-sangeet-neutral-400 text-xs md:text-sm">Daily</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="border-t border-sangeet-neutral-800 mt-8 md:mt-12 pt-6 md:pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sangeet-neutral-400 text-sm text-center md:text-left">
              © {currentYear} Sangeet Restaurant. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="text-sangeet-neutral-400 hover:text-sangeet-400 transition-colors duration-300 touch-manipulation">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sangeet-neutral-400 hover:text-sangeet-400 transition-colors duration-300 touch-manipulation">
                Terms of Service
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer; 