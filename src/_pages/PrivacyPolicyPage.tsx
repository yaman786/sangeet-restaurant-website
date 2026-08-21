"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Eye, FileText, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/**
 * Privacy Policy Page — Hong Kong PDPO (Cap. 486) & Hospitality Standard Compliant
 * Sangeet Restaurant Wan Chai
 */
const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-sangeet-neutral-950 text-sangeet-neutral-300">
      {/* Header */}
      <section className="relative py-16 md:py-24 bg-linear-to-b from-sangeet-neutral-900 to-sangeet-neutral-950 border-b border-sangeet-neutral-800">
        <div className="max-w-4xl mx-auto px-5 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sangeet-400 hover:text-sangeet-300 text-sm font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="inline-flex items-center gap-2 bg-sangeet-400/10 border border-sangeet-400/20 px-3.5 py-1.5 rounded-full text-sangeet-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4" />
            Data Protection Notice
          </div>
          <h1 className="text-3xl md:text-5xl font-display text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-sangeet-neutral-400 text-base md:text-lg">
            Last Updated: August 2026 · Sangeet Restaurant, 17 Fenwick Street, Wan Chai, Hong Kong
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16 max-w-4xl mx-auto px-5 sm:px-6 font-sans leading-relaxed space-y-10">
        
        {/* Section 1 */}
        <div className="p-6 md:p-8 rounded-2xl bg-sangeet-neutral-900/50 border border-sangeet-neutral-800">
          <h2 className="text-xl md:text-2xl font-display text-sangeet-400 mb-4 flex items-center gap-2.5">
            <Eye className="w-5 h-5" /> 1. Commitment to Guest Privacy
          </h2>
          <p className="text-body-sm text-sangeet-neutral-300 mb-3">
            Sangeet Restaurant (&ldquo;Sangeet&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates the restaurant located at 17 Fenwick Street, Wan Chai, Hong Kong. We are committed to protecting the privacy and personal data of our dining guests, event organizers, and website visitors in accordance with the Hong Kong Personal Data (Privacy) Ordinance (PDPO, Cap. 486).
          </p>
          <p className="text-body-sm text-sangeet-neutral-300">
            This Privacy Policy explains what personal information we collect, why we collect it, how it is used, and how your data is protected.
          </p>
        </div>

        {/* Section 2 */}
        <div className="p-6 md:p-8 rounded-2xl bg-sangeet-neutral-900/50 border border-sangeet-neutral-800">
          <h2 className="text-xl md:text-2xl font-display text-sangeet-400 mb-4 flex items-center gap-2.5">
            <FileText className="w-5 h-5" /> 2. Information We Collect
          </h2>
          <div className="space-y-4 text-body-sm">
            <div>
              <h3 className="font-semibold text-white mb-1">• Table Reservations & Seating</h3>
              <p className="text-sangeet-neutral-400">
                When you make a reservation via our website or telephone, we collect your full name, email address, contact telephone number, date, time, party size, and any voluntary special requests (such as dietary restrictions, allergies, or seating preferences).
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">• Private Dining & General Inquiries</h3>
              <p className="text-sangeet-neutral-400">
                When contacting us regarding private dining, corporate bookings, or general inquiries, we collect your contact details and message contents to respond to your request.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">• Dine-In QR Ordering</h3>
              <p className="text-sangeet-neutral-400">
                When utilizing our table QR code digital ordering system, we process your selected food and beverage items and table session ID to prepare and fulfill your order.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">• Technical Log Data & Cookies</h3>
              <p className="text-sangeet-neutral-400">
                Our servers automatically record standard anonymous technical information (e.g. browser type, IP address, device viewport, and essential functional session cookies) solely to maintain website stability and security.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div className="p-6 md:p-8 rounded-2xl bg-sangeet-neutral-900/50 border border-sangeet-neutral-800">
          <h2 className="text-xl md:text-2xl font-display text-sangeet-400 mb-4 flex items-center gap-2.5">
            <Lock className="w-5 h-5" /> 3. How We Use Your Personal Data
          </h2>
          <ul className="list-disc list-inside space-y-2 text-body-sm text-sangeet-neutral-300">
            <li>To process, confirm, and manage your table reservation and assign appropriate seating.</li>
            <li>To send automated email confirmation tickets and critical dining notices.</li>
            <li>To communicate with our kitchen team regarding food allergies and dietary preferences (e.g. Halal, Vegetarian, Vegan, Nut allergies).</li>
            <li>To respond to your inquiries, private event requests, and guest feedback.</li>
            <li>To comply with statutory legal, safety, and accounting obligations in the Hong Kong SAR.</li>
          </ul>
          <div className="mt-4 p-4 rounded-xl bg-sangeet-400/10 border border-sangeet-400/30 text-sangeet-300 text-sm font-medium">
            🛡️ <strong>Zero Data Selling Guarantee:</strong> Sangeet will never sell, rent, trade, or monetize your personal information to any third-party marketing companies.
          </div>
        </div>

        {/* Section 4 */}
        <div className="p-6 md:p-8 rounded-2xl bg-sangeet-neutral-900/50 border border-sangeet-neutral-800">
          <h2 className="text-xl md:text-2xl font-display text-sangeet-400 mb-4 flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5" /> 4. Data Security & Storage
          </h2>
          <p className="text-body-sm text-sangeet-neutral-300 mb-3">
            All data transmitted through our website is encrypted using industry-standard Transport Layer Security (TLS 1.3/HTTPS). Customer records are stored in secure cloud database infrastructure with strict role-based access controls.
          </p>
          <p className="text-body-sm text-sangeet-neutral-400">
            We retain personal data only for as long as necessary to fulfill the reservation, handle inquiries, maintain operational history, or satisfy Hong Kong statutory record-keeping requirements.
          </p>
        </div>

        {/* Section 5 */}
        <div className="p-6 md:p-8 rounded-2xl bg-sangeet-neutral-900/50 border border-sangeet-neutral-800">
          <h2 className="text-xl md:text-2xl font-display text-sangeet-400 mb-4 flex items-center gap-2.5">
            <Mail className="w-5 h-5" /> 5. Your Rights Under Hong Kong PDPO & Inquiries
          </h2>
          <p className="text-body-sm text-sangeet-neutral-300 mb-4">
            Under the Hong Kong Personal Data (Privacy) Ordinance, you have the right to request access to and correction or deletion of personal data held by us. If you wish to exercise your data protection rights, please contact our management team:
          </p>
          <div className="p-5 rounded-xl bg-sangeet-neutral-900 border border-sangeet-neutral-700/60 space-y-1.5 text-sm">
            <div className="font-semibold text-white">Sangeet Restaurant Management</div>
            <div className="text-sangeet-300">Address: 17 Fenwick Street, Wan Chai, Hong Kong</div>
            <div className="text-sangeet-300">Email: <a href="mailto:info@sangeet.hk" className="text-sangeet-400 underline">info@sangeet.hk</a></div>
            <div className="text-sangeet-300">Telephone: <a href="tel:+85226568820" className="text-sangeet-400 underline">+852 26568820</a></div>
          </div>
        </div>

      </section>
    </div>
  );
};

export default PrivacyPolicyPage;
