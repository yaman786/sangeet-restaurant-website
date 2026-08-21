"use client";
import React from 'react';
import { ShieldCheck, FileCheck, ArrowLeft, UtensilsCrossed, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

/**
 * Terms of Service Page — Sangeet Restaurant Wan Chai
 */
const TermsOfServicePage = () => {
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
            <FileCheck className="w-4 h-4" />
            Guest Policy &amp; Terms
          </div>
          <h1 className="text-3xl md:text-5xl font-display text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-sangeet-neutral-400 text-base md:text-lg">
            Sangeet Restaurant · 17 Fenwick Street, Wan Chai, Hong Kong
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16 max-w-4xl mx-auto px-5 sm:px-6 font-sans leading-relaxed space-y-8">
        
        {/* Section 1: Reservations & Seating */}
        <div className="p-6 md:p-8 rounded-2xl bg-sangeet-neutral-900/50 border border-sangeet-neutral-800">
          <h2 className="text-xl md:text-2xl font-display text-sangeet-400 mb-4 flex items-center gap-2.5">
            <Clock className="w-5 h-5" /> 1. Reservations &amp; Table Holding
          </h2>
          <div className="space-y-3 text-body-sm text-sangeet-neutral-300">
            <p>
              • <strong>Table Hold Time:</strong> Reserved tables will be held for up to 15 minutes past the scheduled booking time before being released to walk-in guests. If you are running late, please notify us by calling +852 26568820.
            </p>
            <p>
              • <strong>Dining Duration:</strong> To ensure all guests enjoy their experience, standard dinner seatings are allocated a 2-hour dining window during peak evening and weekend services.
            </p>
            <p>
              • <strong>Large Parties &amp; Private Events:</strong> For parties of 8 or more or private room bookings, advance deposit or minimum spend arrangements may apply as confirmed by our events team.
            </p>
          </div>
        </div>

        {/* Section 2: Dietary Requirements */}
        <div className="p-6 md:p-8 rounded-2xl bg-sangeet-neutral-900/50 border border-sangeet-neutral-800">
          <h2 className="text-xl md:text-2xl font-display text-sangeet-400 mb-4 flex items-center gap-2.5">
            <UtensilsCrossed className="w-5 h-5" /> 2. Dietary Requirements &amp; Allergies
          </h2>
          <div className="space-y-3 text-body-sm text-sangeet-neutral-300">
            <p>
              • <strong>Halal Certification:</strong> All chicken, lamb, and meat products served at Sangeet are 100% Halal certified.
            </p>
            <p>
              • <strong>Allergies:</strong> While we take extreme care to accommodate allergies and dietary restrictions, our kitchen handles nuts, dairy, gluten, and various regional spices. Please inform your server of any severe food allergies prior to ordering.
            </p>
          </div>
        </div>

        {/* Section 3: House Rules */}
        <div className="p-6 md:p-8 rounded-2xl bg-sangeet-neutral-900/50 border border-sangeet-neutral-800">
          <h2 className="text-xl md:text-2xl font-display text-sangeet-400 mb-4 flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5" /> 3. House Rules &amp; Corkage
          </h2>
          <div className="space-y-3 text-body-sm text-sangeet-neutral-300">
            <p>
              • <strong>Dress Code:</strong> Smart casual attire is appreciated.
            </p>
            <p>
              • <strong>Corkage &amp; Cakeage:</strong> A standard corkage fee applies per 750ml bottle of wine, and cakeage applies for outside celebration cakes. Please check with our service staff upon arrival.
            </p>
          </div>
        </div>

        {/* Section 4: Contact */}
        <div className="p-6 md:p-8 rounded-2xl bg-sangeet-neutral-900/50 border border-sangeet-neutral-800">
          <h2 className="text-xl md:text-2xl font-display text-sangeet-400 mb-4 flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5" /> 4. Contact Us
          </h2>
          <p className="text-body-sm text-sangeet-neutral-300 mb-3">
            For questions regarding table policies, cancellations, or group bookings:
          </p>
          <div className="text-sm text-sangeet-300 space-y-1">
            <div>Sangeet Restaurant, 17 Fenwick Street, Wan Chai, Hong Kong</div>
            <div>Email: <a href="mailto:info@sangeet.hk" className="text-sangeet-400 underline">info@sangeet.hk</a> | Phone: <a href="tel:+85226568820" className="text-sangeet-400 underline">+852 26568820</a></div>
          </div>
        </div>

      </section>
    </div>
  );
};

export default TermsOfServicePage;
