"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { sanitizePhoneNumber } from '../utils/sanitizePhone';

import logo from '../assets/images/logo.png';

/**
 * Footer Component
 * Mobile-first footer with responsive design
 * Features: Restaurant info, quick links, contact info, social media
 * Optimized for touch interactions and mobile performance
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [socialLinks, setSocialLinks] = React.useState<any>({
    facebook: "https://facebook.com",
    instagram: "https://instagram.com"
  });
  const [contactInfo, setContactInfo] = React.useState<any>({
    phone: "+852 26568820",
    whatsapp: "+852 93848960",
    email: "info@sangeet.hk",
    address: "17 Fenwick Street, Wan Chai, Hong Kong"
  });
  const [businessHours, setBusinessHours] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/website/public-config');
        if (res.ok) {
          const data = await res.json();
          if (data?.social) setSocialLinks(data.social);
          if (data?.contact) setContactInfo(data.contact);
          if (data?.business_hours) setBusinessHours(data.business_hours);
        }
      } catch (err) {
        console.error('Failed to fetch footer config', err);
      }
    };
    fetchConfig();
  }, []);

  return (
    <footer className="bg-linear-to-br from-sangeet-neutral-950 via-sangeet-neutral-900 to-sangeet-neutral-950 border-t border-sangeet-neutral-800">
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
                    <div className="absolute inset-0 bg-linear-to-r from-sangeet-400/20 to-sangeet-red-500/20 rounded-full blur-xl"></div>
                    <Image src={logo} alt="Sangeet Logo" className="relative h-12 md:h-16 w-auto filter brightness-110 contrast-110" />
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
                South Asian fine dining in the heart of Wan Chai, Hong Kong. Tandoori grills, slow-cooked regional curries, and craft cocktails. All meats are 100% Halal certified.
              </p>
              
              {/* Social Media Links */}
              <div className="flex space-x-3 md:space-x-4">
                {socialLinks.facebook && (
                  <motion.a
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-linear-to-r from-sangeet-400/10 to-sangeet-red-500/10 p-2.5 md:p-3 rounded-full border border-sangeet-400/20 text-sangeet-400 hover:text-sangeet-300 hover:border-sangeet-400/40 transition-all duration-300 touch-manipulation"
                    aria-label="Facebook"
                  >
                    <svg className="h-4 w-4 md:h-5 md:w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </motion.a>
                )}
                {socialLinks.instagram && (
                  <motion.a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-linear-to-r from-sangeet-400/10 to-sangeet-red-500/10 p-2.5 md:p-3 rounded-full border border-sangeet-400/20 text-sangeet-400 hover:text-sangeet-300 hover:border-sangeet-400/40 transition-all duration-300 touch-manipulation"
                    aria-label="Instagram"
                  >
                    <svg className="h-4 w-4 md:h-5 md:w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z"/>
                    </svg>
                  </motion.a>
                )}
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
                  <Link href="/menu" className="text-sangeet-neutral-300 hover:text-sangeet-400 transition-colors duration-300 flex items-center group text-sm md:text-base touch-manipulation py-1">
                    <span className="mr-2 text-sangeet-400 group-hover:translate-x-1 transition-transform duration-300">→</span>
                    Our Menu
                  </Link>
                </li>
                <li>
                  <Link href="/reservations" className="text-sangeet-neutral-300 hover:text-sangeet-400 transition-colors duration-300 flex items-center group text-sm md:text-base touch-manipulation py-1">
                    <span className="mr-2 text-sangeet-400 group-hover:translate-x-1 transition-transform duration-300">→</span>
                    Make Reservation
                  </Link>
                </li>
                <li>
                  <Link href="/location" className="text-sangeet-neutral-300 hover:text-sangeet-400 transition-colors duration-300 flex items-center group text-sm md:text-base touch-manipulation py-1">
                    <span className="mr-2 text-sangeet-400 group-hover:translate-x-1 transition-transform duration-300">→</span>
                    Location &amp; Hours
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-sangeet-neutral-300 hover:text-sangeet-400 transition-colors duration-300 flex items-center group text-sm md:text-base touch-manipulation py-1">
                    <span className="mr-2 text-sangeet-400 group-hover:translate-x-1 transition-transform duration-300">→</span>
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sangeet-neutral-300 hover:text-sangeet-400 transition-colors duration-300 flex items-center group text-sm md:text-base touch-manipulation py-1">
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
                    <p className="text-sangeet-neutral-300 text-sm md:text-base">{contactInfo.address}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-4 w-4 text-sangeet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    {(() => {
                      const phone = sanitizePhoneNumber(contactInfo.phone || '+852 2345 6789');
                      return (
                        <a 
                          href={phone.telHref} 
                          className="text-sangeet-neutral-300 hover:text-sangeet-400 transition-colors duration-300 text-sm md:text-base touch-manipulation"
                        >
                          {phone.raw}
                        </a>
                      );
                    })()}
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-4 w-4 text-sangeet-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                    </svg>
                  </div>
                  <div>
                    {(() => {
                      const whatsapp = sanitizePhoneNumber(contactInfo.whatsapp || '+852 93848960');
                      return (
                        <a 
                          href={`https://wa.me/${whatsapp.raw.replace(/[^0-9]/g, '')}`} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sangeet-neutral-300 hover:text-sangeet-400 transition-colors duration-300 text-sm md:text-base touch-manipulation flex items-center"
                        >
                          {whatsapp.raw}
                        </a>
                      );
                    })()}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-4 w-4 text-sangeet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <a 
                      href={`mailto:${contactInfo.email}`} 
                      className="text-sangeet-neutral-300 hover:text-sangeet-400 transition-colors duration-300 text-sm md:text-base touch-manipulation"
                    >
                      {contactInfo.email}
                    </a>
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
              <Link href="/privacy" className="text-sangeet-neutral-400 hover:text-sangeet-400 transition-colors duration-300 touch-manipulation">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sangeet-neutral-400 hover:text-sangeet-400 transition-colors duration-300 touch-manipulation">
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