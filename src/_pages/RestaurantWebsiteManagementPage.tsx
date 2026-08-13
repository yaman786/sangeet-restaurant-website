"use client";
import React, { useState, useEffect } from 'react';
import { useNavigate } from '@/utils/router-mock';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Image from 'next/image';
import AdminHeader from '../components/AdminHeader';
import {
  Layout,
  Clock,
  Globe,
  Search,
  Image as ImageIcon,
  Calendar,
  Eye,
  Save,
  Trash2,
  Plus,
  X,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  MapPin,
  Share2,
  Upload
} from 'lucide-react';
import {
  getRestaurantSettings,
  updateRestaurantSettings,
  getWebsiteContent,
  updateWebsiteContent,
  getWebsiteMedia,
  deleteWebsiteMedia,
  getWebsiteStats,
  getAllTimeSlots,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  getPublicWebsiteConfig
} from '../services/api';
import { uploadHeroMediaAction } from '@/app/actions/websiteActions';

const DEFAULT_SCHEDULE = {
  monday: { open: "17:30", close: "23:00", closed: false },
  tuesday: { open: "17:30", close: "23:00", closed: false },
  wednesday: { open: "17:30", close: "23:00", closed: false },
  thursday: { open: "17:30", close: "23:00", closed: false },
  friday: { open: "17:30", close: "23:30", closed: false },
  saturday: { open: "12:00", close: "23:30", closed: false },
  sunday: { open: "12:00", close: "23:00", closed: false },
};

const RestaurantWebsiteManagementPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hero');
  const [saving, setSaving] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);

  // CMS State Sections
  const [heroForm, setHeroForm] = useState({
    title: "Experience South Asian Elegance",
    subtitle: "Authentic cuisine rooted in tradition, crafted with passion, served in the heart of Hong Kong.",
    image_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&h=1080&fit=crop",
    primary_cta_text: "Reserve Your Table",
    primary_cta_link: "/reservations",
    secondary_cta_text: "Explore the Menu",
    secondary_cta_link: "/menu"
  });

  const [businessHoursForm, setBusinessHoursForm] = useState({
    status_override: "normal",
    schedule: DEFAULT_SCHEDULE
  });

  const [contactForm, setContactForm] = useState({
    phone: "+852 2345 6789",
    email: "info@sangeet.hk",
    address: "Wanchai, Hong Kong",
    maps_iframe: ""
  });

  const [socialForm, setSocialForm] = useState({
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    tripadvisor: "https://tripadvisor.com",
    openrice: "https://openrice.com"
  });

  const [seoForm, setSeoForm] = useState({
    title: "Sangeet Restaurant - Authentic South Asian Cuisine in Hong Kong",
    description: "Experience South Asian Elegance. Authentic cuisine rooted in tradition, crafted with passion, served in the heart of Hong Kong.",
    keywords: "South Asian restaurant, Hong Kong dining, Indian cuisine, Wanchai food, Sangeet",
    og_image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=630&fit=crop"
  });

  const [mediaList, setMediaList] = useState<any[]>([]);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [newTimeSlot, setNewTimeSlot] = useState('');

  // Load all website configuration data
  const loadData = async () => {
    try {
      setLoading(true);
      const [configData, mediaData, timeSlotsData] = await Promise.all([
        getPublicWebsiteConfig().catch(() => null),
        getWebsiteMedia().catch(() => []),
        getAllTimeSlots().catch(() => [])
      ]);

      if (configData) {
        if (configData.hero) setHeroForm(prev => ({ ...prev, ...configData.hero }));
        if (configData.businessHours) {
          setBusinessHoursForm({
            status_override: configData.businessHours.status_override || "normal",
            schedule: configData.businessHours.schedule || DEFAULT_SCHEDULE
          });
        }
        if (configData.contactInfo) setContactForm(prev => ({ ...prev, ...configData.contactInfo }));
        if (configData.social) setSocialForm(prev => ({ ...prev, ...configData.social }));
        if (configData.seo) setSeoForm(prev => ({ ...prev, ...configData.seo }));
      }

      setMediaList((mediaData as any)?.media || mediaData || []);
      setTimeSlots((timeSlotsData as any) || []);
    } catch (error: any) {
      console.error('Error loading website management data:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        toast.error('Failed to load website configuration');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [navigate]);

  // Master Save Handler
  const handleSaveAll = async () => {
    try {
      setSaving(true);

      const settingsPayload: Record<string, any> = {
        business_hours: { value: businessHoursForm, type: 'json' },
        hero_banner: { value: heroForm, type: 'json' },
        phone: { value: contactForm.phone, type: 'text' },
        email: { value: contactForm.email, type: 'text' },
        address: { value: contactForm.address, type: 'text' },
        maps_iframe: { value: contactForm.maps_iframe, type: 'text' }
      };

      const heroBannerPayload = [
        {
          bannerKey: 'hero',
          title: heroForm.title,
          subtitle: heroForm.subtitle,
          image_url: heroForm.image_url,
          primary_cta_text: heroForm.primary_cta_text,
          primary_cta_link: heroForm.primary_cta_link,
          secondary_cta_text: heroForm.secondary_cta_text,
          secondary_cta_link: heroForm.secondary_cta_link,
          is_active: true
        }
      ];

      await Promise.all([
        updateRestaurantSettings(settingsPayload),
        updateWebsiteContent({
          hero_title: { title: 'Hero Title', content: heroForm.title, content_type: 'text' },
          hero_subtitle: { title: 'Hero Subtitle', content: heroForm.subtitle, content_type: 'text' }
        } as any)
      ]);

      toast.success('🎉 All Website CMS settings saved successfully!');
    } catch (error) {
      console.error('Error saving CMS settings:', error);
      toast.error('Failed to save website settings');
    } finally {
      setSaving(false);
    }
  };
  // Media Handlers
  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    if (heroForm.image_url) {
      formData.append('oldUrl', heroForm.image_url);
    }

    try {
      const toastId = toast.loading('Uploading media...');
      const res = await uploadHeroMediaAction(formData);
      
      if (res.success) {
        setHeroForm(prev => ({ ...prev, image_url: res.url }));
        toast.dismiss(toastId);
        toast.success('Hero media uploaded successfully!');
      } else {
        toast.dismiss(toastId);
        toast.error(res.error || 'Failed to upload media');
      }
    } catch (error) {
      console.error('Error uploading hero media:', error);
      toast.dismiss();
      toast.error('Failed to upload hero media');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('media_key', 'gallery');

    try {
      const response = await uploadWebsiteMedia(formData);
      setMediaList(prev => [...prev, (response as any).media || response]);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload image');
    }
  };

  const handleDeleteMedia = async (id: string) => {
    try {
      await deleteWebsiteMedia(id);
      setMediaList(prev => prev.filter(m => String(m.id) !== String(id)));
      toast.success('Media deleted');
    } catch (error) {
      toast.error('Failed to delete media');
    }
  };

  // Timeslot Handlers
  const handleCreateTimeSlot = async () => {
    if (!newTimeSlot) return;
    try {
      setSaving(true);
      await createTimeSlot({ time_slot: newTimeSlot });
      const times = await getAllTimeSlots();
      setTimeSlots((times as any) || []);
      setNewTimeSlot('');
      toast.success('Time slot added!');
    } catch (e) {
      toast.error('Failed to create time slot');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleTimeSlot = async (id: number, isActive: boolean) => {
    try {
      await updateTimeSlot(id, { is_active: !isActive });
      setTimeSlots(timeSlots.map(t => t.id === id ? { ...t, is_active: !isActive } : t));
    } catch (e) {
      toast.error('Failed to update time slot');
    }
  };

  const handleDeleteTimeSlot = async (id: number) => {
    try {
      await deleteTimeSlot(id);
      setTimeSlots(timeSlots.filter(t => t.id !== id));
      toast.success('Time slot deleted');
    } catch (e) {
      toast.error('Failed to delete time slot');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sangeet-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4" />
          <p className="text-amber-400 font-medium">Loading Website CMS Engine...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'hero', name: 'Hero & Banner', icon: Layout },
    { id: 'hours', name: 'Business Hours', icon: Clock },
    { id: 'contact', name: 'Contact & Social', icon: Globe },
    { id: 'seo', name: 'SEO & Metadata', icon: Search },
    { id: 'media', name: 'Media Gallery', icon: ImageIcon },
    { id: 'timeslots', name: 'Reservation Slots', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-sangeet-neutral-950 text-sangeet-neutral-100">
      <AdminHeader title="Website Content Management (CMS)" subtitle="Manage live website banners, hero imagery, business hours, and SEO" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-sangeet-neutral-900 p-6 rounded-2xl border border-sangeet-neutral-800 shadow-xl">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-amber-400 flex items-center gap-3">
              <Sparkles className="w-7 h-7 text-amber-400" />
              Website Content Manager
            </h1>
            <p className="text-sangeet-neutral-400 text-sm mt-1">
              Direct live sync with <a href="https://sangeet.hk/" target="_blank" rel="noreferrer" className="text-amber-400 underline font-medium hover:opacity-80">sangeet.hk</a>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLivePreview(!showLivePreview)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sangeet-neutral-800 hover:bg-sangeet-neutral-700 text-sangeet-neutral-200 font-medium transition-all text-sm border border-sangeet-neutral-700"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              {showLivePreview ? 'Hide Live Preview' : 'Live Preview'}
            </button>

            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-sangeet-neutral-950 font-bold transition-all text-sm shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving Changes...' : 'Save All Changes'}
            </button>
          </div>
        </div>

        {/* Live Preview Modal / Split Drawer */}
        <AnimatePresence>
          {showLivePreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="bg-sangeet-neutral-900 border border-amber-500/30 rounded-2xl p-4 shadow-2xl">
                <div className="flex items-center justify-between mb-3 px-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Eye className="w-4 h-4" /> Live Website Preview (Interactive)
                  </span>
                  <button onClick={() => setShowLivePreview(false)} className="text-sangeet-neutral-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="w-full h-[550px] rounded-xl overflow-hidden border border-sangeet-neutral-800 bg-sangeet-neutral-950">
                  <iframe src="/" className="w-full h-full border-0" title="Live Website Preview" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CMS Navigation Tabs */}
        <div className="bg-sangeet-neutral-900 rounded-2xl border border-sangeet-neutral-800 overflow-hidden shadow-xl mb-8">
          <div className="flex flex-wrap border-b border-sangeet-neutral-800 bg-sangeet-neutral-950/50">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-6 py-4 text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-400/10'
                      : 'text-sangeet-neutral-400 hover:text-sangeet-200 hover:bg-sangeet-neutral-800/40'
                  }`}
                >
                  <IconComponent className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-sangeet-neutral-400'}`} />
                  {tab.name}
                </button>
              );
            })}
          </div>

          <div className="p-6 sm:p-8">

            {/* TAB 1: HERO & ANNOUNCEMENT BANNER */}
            {activeTab === 'hero' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                
                {/* Hero Section Content */}
                <div className="bg-sangeet-neutral-950 p-6 rounded-xl border border-sangeet-neutral-800 space-y-5">
                  <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                    <Layout className="w-5 h-5" /> Homepage Hero Banner
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-sangeet-neutral-300 mb-1">Hero Main Title / Headline</label>
                    <input
                      id="hero-title-input"
                      type="text"
                      value={heroForm.title}
                      onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                      className="w-full bg-sangeet-neutral-900 border border-sangeet-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-sangeet-neutral-300 mb-1">Hero Subtitle / Description</label>
                    <textarea
                      rows={3}
                      value={heroForm.subtitle}
                      onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                      className="w-full bg-sangeet-neutral-900 border border-sangeet-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-sangeet-neutral-300 mb-1">Background Image</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={heroForm.image_url}
                        onChange={(e) => setHeroForm({ ...heroForm, image_url: e.target.value })}
                        className="w-full bg-sangeet-neutral-900 border border-sangeet-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                        placeholder="Paste image URL here..."
                      />
                      <label className="shrink-0 flex items-center justify-center bg-sangeet-neutral-800 hover:bg-sangeet-neutral-700 border border-sangeet-neutral-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors text-sm font-semibold">
                        <Upload className="w-4 h-4 mr-2" /> Upload
                        <input type="file" className="hidden" accept="image/*,video/mp4,video/webm" onChange={handleHeroImageUpload} />
                      </label>
                    </div>
                    {heroForm.image_url && (
                      <div className="mt-3 relative h-40 w-full rounded-lg overflow-hidden border border-sangeet-neutral-800">
                        {heroForm.image_url.match(/\.(mp4|webm)$/i) ? (
                          <video src={heroForm.image_url} autoPlay loop muted playsInline className="object-cover w-full h-full" />
                        ) : (
                          <img src={heroForm.image_url} alt="Hero Preview" className="object-cover w-full h-full" />
                        )}
                      </div>
                    )}
                  </div>
                </div>

              </motion.div>
            )}

            {/* TAB 2: BUSINESS HOURS */}
            {activeTab === 'hours' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                
                {/* Emergency Override Control */}
                <div className="bg-sangeet-neutral-950 p-6 rounded-xl border border-sangeet-neutral-800 space-y-3">
                  <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" /> Restaurant Operating Status Override
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'normal', label: 'Normal Schedule', desc: 'Follows day-by-day business hours below' },
                      { id: 'force_open', label: 'Force Open', desc: 'Shows "Open Now" regardless of time' },
                      { id: 'force_closed', label: 'Force Closed', desc: 'Shows "Closed" for holidays / events' }
                    ].map(mode => (
                      <button
                        key={mode.id}
                        onClick={() => setBusinessHoursForm({ ...businessHoursForm, status_override: mode.id })}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          businessHoursForm.status_override === mode.id
                            ? 'border-amber-400 bg-amber-400/10 text-white'
                            : 'border-sangeet-neutral-800 bg-sangeet-neutral-900 text-sangeet-neutral-400 hover:border-sangeet-neutral-700'
                        }`}
                      >
                        <div className="font-bold text-sm text-amber-300">{mode.label}</div>
                        <div className="text-xs text-sangeet-neutral-400 mt-1">{mode.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Day Schedule Editor */}
                <div className="bg-sangeet-neutral-950 p-6 rounded-xl border border-sangeet-neutral-800 space-y-4">
                  <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                    <Clock className="w-5 h-5" /> Weekly Business Schedule
                  </h3>

                  <div className="space-y-3">
                    {Object.keys(DEFAULT_SCHEDULE).map((dayKey) => {
                      const dayData = businessHoursForm.schedule[dayKey as keyof typeof DEFAULT_SCHEDULE] || { open: "17:30", close: "23:00", closed: false };
                      return (
                        <div key={dayKey} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 bg-sangeet-neutral-900 rounded-lg border border-sangeet-neutral-800">
                          <span className="capitalize font-semibold text-sm w-28 text-amber-300">{dayKey}</span>
                          
                          <div className="flex items-center gap-3 flex-1">
                            <label className="flex items-center gap-2 text-xs text-sangeet-neutral-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={dayData.closed}
                                onChange={(e) => {
                                  setBusinessHoursForm({
                                    ...businessHoursForm,
                                    schedule: {
                                      ...businessHoursForm.schedule,
                                      [dayKey]: { ...dayData, closed: e.target.checked }
                                    }
                                  });
                                }}
                                className="rounded text-amber-500 focus:ring-0"
                              />
                              Closed All Day
                            </label>

                            {!dayData.closed && (
                              <div className="flex items-center gap-2 text-xs">
                                <input
                                  type="time"
                                  value={dayData.open}
                                  onChange={(e) => {
                                    setBusinessHoursForm({
                                      ...businessHoursForm,
                                      schedule: {
                                        ...businessHoursForm.schedule,
                                        [dayKey]: { ...dayData, open: e.target.value }
                                      }
                                    });
                                  }}
                                  className="bg-sangeet-neutral-950 border border-sangeet-neutral-700 rounded px-2.5 py-1 text-white"
                                />
                                <span>to</span>
                                <input
                                  type="time"
                                  value={dayData.close}
                                  onChange={(e) => {
                                    setBusinessHoursForm({
                                      ...businessHoursForm,
                                      schedule: {
                                        ...businessHoursForm.schedule,
                                        [dayKey]: { ...dayData, close: e.target.value }
                                      }
                                    });
                                  }}
                                  className="bg-sangeet-neutral-950 border border-sangeet-neutral-700 rounded px-2.5 py-1 text-white"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </motion.div>
            )}

            {/* TAB 3: CONTACT & SOCIAL */}
            {activeTab === 'contact' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="bg-sangeet-neutral-950 p-6 rounded-xl border border-sangeet-neutral-800 space-y-4">
                  <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                    <Building2 className="w-5 h-5" /> Restaurant Contact Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-sangeet-neutral-300 mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        className="w-full bg-sangeet-neutral-900 border border-sangeet-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-sangeet-neutral-300 mb-1">Email Address</label>
                      <input
                        type="text"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full bg-sangeet-neutral-900 border border-sangeet-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-sangeet-neutral-300 mb-1">Physical Address</label>
                      <input
                        type="text"
                        value={contactForm.address}
                        onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
                        className="w-full bg-sangeet-neutral-900 border border-sangeet-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-sangeet-neutral-950 p-6 rounded-xl border border-sangeet-neutral-800 space-y-4">
                  <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                    <Share2 className="w-5 h-5" /> Social Media Channels
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.keys(socialForm).map((net) => (
                      <div key={net}>
                        <label className="block text-xs font-semibold text-sangeet-neutral-300 capitalize mb-1">{net} Profile URL</label>
                        <input
                          type="text"
                          value={(socialForm as any)[net]}
                          onChange={(e) => setSocialForm({ ...socialForm, [net]: e.target.value })}
                          className="w-full bg-sangeet-neutral-900 border border-sangeet-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 4: SEO METADATA */}
            {activeTab === 'seo' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="bg-sangeet-neutral-950 p-6 rounded-xl border border-sangeet-neutral-800 space-y-4">
                  <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                    <Search className="w-5 h-5" /> Search Engine Optimization (SEO)
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-sangeet-neutral-300 mb-1">Meta Title</label>
                    <input
                      type="text"
                      value={seoForm.title}
                      onChange={(e) => setSeoForm({ ...seoForm, title: e.target.value })}
                      className="w-full bg-sangeet-neutral-900 border border-sangeet-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-sangeet-neutral-300 mb-1">Meta Description</label>
                    <textarea
                      rows={3}
                      value={seoForm.description}
                      onChange={(e) => setSeoForm({ ...seoForm, description: e.target.value })}
                      className="w-full bg-sangeet-neutral-900 border border-sangeet-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-sangeet-neutral-300 mb-1">OpenGraph Share Image URL</label>
                    <input
                      type="text"
                      value={seoForm.og_image}
                      onChange={(e) => setSeoForm({ ...seoForm, og_image: e.target.value })}
                      className="w-full bg-sangeet-neutral-900 border border-sangeet-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 5: MEDIA GALLERY */}
            {activeTab === 'media' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex items-center justify-between bg-sangeet-neutral-950 p-6 rounded-xl border border-sangeet-neutral-800">
                  <div>
                    <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" /> Restaurant Media Assets
                    </h3>
                    <p className="text-xs text-sangeet-neutral-400">Upload promotional photos for landing page & gallery</p>
                  </div>
                  <label className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-sangeet-neutral-950 font-bold text-sm cursor-pointer transition-all">
                    <Plus className="w-4 h-4" /> Upload Photo
                    <input type="file" onChange={handleFileUpload} accept="image/*" className="hidden" />
                  </label>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {mediaList.map((item) => (
                    <div key={item.id} className="relative group bg-sangeet-neutral-900 rounded-xl overflow-hidden border border-sangeet-neutral-800">
                      <img src={item.file_path} alt={item.alt_text || 'Media'} className="w-full h-36 object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDeleteMedia(item.id)}
                          className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB 6: RESERVATION TIMESLOTS */}
            {activeTab === 'timeslots' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="bg-sangeet-neutral-950 p-6 rounded-xl border border-sangeet-neutral-800 space-y-4">
                  <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                    <Calendar className="w-5 h-5" /> Add Reservation Time Slot
                  </h3>
                  <div className="flex gap-3">
                    <input
                      type="time"
                      value={newTimeSlot}
                      onChange={(e) => setNewTimeSlot(e.target.value)}
                      className="bg-sangeet-neutral-900 border border-sangeet-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white"
                    />
                    <button
                      onClick={handleCreateTimeSlot}
                      className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-sangeet-neutral-950 font-bold text-sm"
                    >
                      Add Slot
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {timeSlots.map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between p-3.5 bg-sangeet-neutral-900 rounded-lg border border-sangeet-neutral-800">
                      <span className="font-semibold text-sm text-amber-300">{slot.time_slot}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleTimeSlot(slot.id, slot.is_active)}
                          className={`px-2 py-1 rounded text-xs font-bold ${slot.is_active ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}
                        >
                          {slot.is_active ? 'Active' : 'Off'}
                        </button>
                        <button onClick={() => handleDeleteTimeSlot(slot.id)} className="text-sangeet-neutral-500 hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </div>
        </div>

      </main>
    </div>
  );
};

export default RestaurantWebsiteManagementPage;
