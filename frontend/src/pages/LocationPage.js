import React from 'react';
import { motion } from 'framer-motion';

/**
 * LocationPage Component
 * Showcases Sangeet's prime location in Wanchai with authentic neighborhood details.
 * Features:
 * - High-impact diverse hero section
 * - Interactive transit guide (MTR, Tram, Taxi)
 * - "Make a Day of It" neighborhood guide (Blue House, Lee Tung Ave)
 */
const LocationPage = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const NEIGHBORHOOD_SPOTS = [
        {
            title: "The Blue House",
            category: "Heritage",
            description: "Visit the award-winning UNESCO heritage building. A stunning example of lively community conservation, just a 5-minute walk from our door.",
            image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop", // Representative Heritage/Community vibe
            distance: "5 min walk"
        },
        {
            title: "Lee Tung Avenue",
            category: "Shopping & Culture",
            description: "Stroll through the tree-lined boulevard known for its distinctive red lanterns, upscale boutiques, and vibrant cultural events.",
            image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop", // Vibrant Lights/Culture vibe
            distance: "3 min walk"
        },
        {
            title: "HK Convention Centre",
            category: "Business",
            description: "Located near the bustling HKCEC, we're the perfect spot for business lunches or a relaxing dinner after a conference.",
            image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop", // Modern Business/Dining vibe
            distance: "10 min taxi"
        }
    ];

    const TRANSIT_OPTIONS = [
        {
            mode: "MTR",
            icon: "🚇",
            title: "Wanchai Station",
            details: "Exit A3 (Johnston Road)",
            highlight: "3 min walk",
            description: "Head left just out of the exit. We are located centrally on the bustling street."
        },
        {
            mode: "Tram",
            icon: "🚋",
            title: "The 'Ding Ding'",
            details: "Fleming Road Stop",
            highlight: "Doorstep Access",
            description: "Experience HK's iconic tramway. Hop off at Fleming Road and look for our golden signage."
        },
        {
            mode: "Taxi / Car",
            icon: "🚖",
            title: "Drop-off Point",
            details: "Tai Yau Plaza",
            highlight: "Parking Nearby",
            description: "Convenient drop-off on Johnston Road. Parking available at Hopewell Centre or Wu Chung House."
        }
    ];

    return (
        <div className="min-h-screen bg-sangeet-neutral-950">

            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1606220838315-056192d5e927?w=1920&h=1080&fit=crop"
                        alt="Wanchai Hong Kong Street Scene"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-sangeet-neutral-950 via-sangeet-neutral-950/50 to-transparent"></div>
                </div>

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-16">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-block bg-sangeet-400/10 backdrop-blur-md border border-sangeet-400/20 text-sangeet-400 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
                            📍 Wanchai, Hong Kong
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                            Where Heritage Meets <span className="text-transparent bg-clip-text bg-gradient-to-r from-sangeet-400 to-red-500">Hustle</span>
                        </h1>
                        <p className="text-xl text-sangeet-neutral-300 leading-relaxed">
                            Dining in the heart of Hong Kong's most vibrant district.
                            A culinary sanctuary amidst the energy of Wanchai.
                        </p>
                    </motion.div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 -mt-20 relative z-20">

                {/* Map Section */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="bg-sangeet-neutral-900 rounded-2xl overflow-hidden shadow-2xl border border-sangeet-neutral-800 mb-16 h-[400px] md:h-[500px] relative"
                >
                    {/* Custom style map link/iframe wrapper */}
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3692.657805166297!2d114.17135031481546!3d22.27749898533555!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3404005e83e5836f%3A0x6b4503714ccfa6e!2sWanchai%2C%20Hong%20Kong!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus"
                        width="100%"
                        height="100%"
                        style={{ border: 0, filter: 'grayscale(100%) invert(90%)' }} // Dark mode map filter
                        allowFullScreen=""
                        loading="lazy"
                        title="Sangeet Restaurant Location Map"
                    ></iframe>

                    {/* Address Card Overlay */}
                    <div className="absolute bottom-6 left-6 bg-sangeet-neutral-900/95 backdrop-blur-md p-6 rounded-xl border border-sangeet-neutral-700 shadow-lg max-w-sm hidden md:block">
                        <h3 className="text-xl font-bold text-sangeet-400 mb-2">Sangeet Restaurant</h3>
                        <p className="text-sangeet-neutral-300 mb-4">
                            123 Johnston Road,<br />
                            Wanchai, Hong Kong
                        </p>
                        <a
                            href="https://maps.google.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 text-sm font-bold text-sangeet-neutral-900 bg-sangeet-400 px-4 py-2 rounded-lg hover:bg-sangeet-300 transition-colors"
                        >
                            <span>Get Directions</span>
                            <span>→</span>
                        </a>
                    </div>
                </motion.div>

                {/* Transit Options */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="mb-24"
                >
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-sangeet-400 mb-4">Getting Here</h2>
                        <p className="text-sangeet-neutral-400 max-w-2xl mx-auto">
                            We are centrally located with easy access via MTR, Tram, and Taxi.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {TRANSIT_OPTIONS.map((transit, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className="bg-sangeet-neutral-900 p-8 rounded-xl border border-sangeet-neutral-800 hover:border-sangeet-400/50 transition-colors group"
                            >
                                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{transit.icon}</div>
                                <h3 className="text-xl font-bold text-white mb-2">{transit.mode}</h3>
                                <div className="bg-sangeet-neutral-800 inline-block px-3 py-1 rounded text-sangeet-400 text-sm font-semibold mb-4">
                                    {transit.highlight}
                                </div>
                                <h4 className="text-lg font-semibold text-sangeet-300 mb-1">{transit.title}</h4>
                                <p className="text-sangeet-neutral-400 text-sm font-mono mb-3">{transit.details}</p>
                                <p className="text-sangeet-neutral-500 text-sm leading-relaxed">{transit.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Neighborhood Guide */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl font-bold text-sangeet-400 mb-4">Make a Day of It</h2>
                            <p className="text-sangeet-neutral-400 max-w-xl">
                                Explore the vibrant culture of Wanchai before or after your meal.
                                Here are our favorite local spots.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {NEIGHBORHOOD_SPOTS.map((spot, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className="group relative overflow-hidden rounded-xl bg-sangeet-neutral-900 border border-sangeet-neutral-800"
                            >
                                <div className="h-48 overflow-hidden">
                                    <img
                                        src={spot.image}
                                        alt={spot.title}
                                        loading="lazy"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-sangeet-400 transition-colors">{spot.title}</h3>
                                            <span className="text-xs font-semibold text-sangeet-neutral-500 uppercase tracking-wider">{spot.category}</span>
                                        </div>
                                        <span className="bg-sangeet-400/10 text-sangeet-400 text-xs font-bold px-2 py-1 rounded">
                                            {spot.distance}
                                        </span>
                                    </div>
                                    <p className="text-sangeet-neutral-400 text-sm leading-relaxed">
                                        {spot.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default LocationPage;
