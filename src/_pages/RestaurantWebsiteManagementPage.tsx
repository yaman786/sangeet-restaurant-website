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
  Edit,
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
  Upload,
  PartyPopper
} from 'lucide-react';
import {
  getRestaurantSettings,
  updateRestaurantSettings,
  getWebsiteContent,
  updateWebsiteContent,
  getWebsiteMedia,
  uploadWebsiteMedia,
  deleteWebsiteMedia,
  updateWebsiteMedia,
  getWebsiteStats,
  getAllTimeSlots,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  getPublicWebsiteConfig,
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent
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
  const [editingMedia, setEditingMedia] = useState<any>(null);
  
  // Events State
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [deleteConfirmEvent, setDeleteConfirmEvent] = useState<any | null>(null);
  const [deletingEvent, setDeletingEvent] = useState(false);

  // CMS State Sections
  const [heroForm, setHeroForm] = useState({
    title: "South Asian Fine Dining in Wan Chai",
    subtitle: "Tandoori grills, regional curries, and craft cocktails. Now open in Hong Kong.",
    image_url: "/images/hero-interior.jpg",
    primary_cta_text: "Reserve a Table",
    primary_cta_link: "/reservations",
    secondary_cta_text: "View Menu",
    secondary_cta_link: "/menu"
  });

  const [businessHoursForm, setBusinessHoursForm] = useState({
    status_override: "normal",
    schedule: DEFAULT_SCHEDULE
  });

  const [contactForm, setContactForm] = useState({
    phone: "+852 2345 6789",
    email: "info@sangeet.hk",
    address: "17 Fenwick Street, Wan Chai, Hong Kong",
    maps_iframe: ""
  });

  const [socialForm, setSocialForm] = useState({
    facebook: "https://facebook.com",
    instagram: "https://instagram.com"
  });

  const [seoForm, setSeoForm] = useState({
    title: "Sangeet | Fine-Dining South Asian Cuisine & Clay Tandoor | Wan Chai, Hong Kong",
    description: "Sangeet is Hong Kong's newest South Asian fine-dining sanctuary in Wan Chai. Experience charcoal clay tandoor cooking, handcrafted regional curries, and modern luxury.",
    keywords: "Sangeet restaurant, Wan Chai Indian food, South Asian fine dining, Hong Kong tandoor, authentic Indian curries, private dining Wan Chai",
    og_image: "/images/hero-interior.jpg"
  });

  const [mediaList, setMediaList] = useState<any[]>([]);

  // Load all website configuration data
  const loadData = async () => {
    try {
      setLoading(true);
      const [configData, mediaData, eventsData] = await Promise.all([
        getPublicWebsiteConfig().catch(() => null),
        getWebsiteMedia().catch(() => []),
        fetchEvents().catch(() => [])
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
      setEventsList((eventsData as any) || []);
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
        setHeroForm(prev => ({ ...prev, image_url: res.url || '' }));
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

  const handleEventImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    if (editingEvent?.image_url) {
      formData.append('oldUrl', editingEvent.image_url);
    }

    try {
      const toastId = toast.loading('Uploading event image...');
      const res = await uploadHeroMediaAction(formData);
      
      if (res.success) {
        setEditingEvent((prev: any) => ({ ...prev, image_url: res.url || '' }));
        toast.dismiss(toastId);
        toast.success('Event image uploaded successfully!');
      } else {
        toast.dismiss(toastId);
        toast.error(res.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading event image:', error);
      toast.dismiss();
      toast.error('Failed to upload event image');
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
      const newMedia = (response as any).media || response;
      setMediaList(prev => [...prev, newMedia]);
      toast.success('Image uploaded! Now add the details.');
      // Automatically open the Edit modal for the newly uploaded photo
      setEditingMedia(newMedia);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload image');
    }
    // Reset the input so the same file can be re-selected if needed
    e.target.value = '';
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

  const handleUpdateMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedia) return;
    try {
      const data = {
        media_key: editingMedia.media_key,
        alt_text: editingMedia.alt_text,
        caption: editingMedia.caption
      };
      await updateWebsiteMedia(editingMedia.id, data);
      setMediaList(prev => prev.map(m => String(m.id) === String(editingMedia.id) ? { ...m, ...data } : m));
      toast.success('Media updated');
      setEditingMedia(null);
    } catch (error) {
      toast.error('Failed to update media');
    }
  };

  // Event Handlers
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingEvent.id) {
        await updateEvent(editingEvent.id, editingEvent);
        toast.success('Event updated!');
      } else {
        await createEvent(editingEvent);
        toast.success('Event created!');
      }
      const newEvents = await fetchEvents();
      setEventsList((newEvents as any) || []);
      setIsEventModalOpen(false);
      setEditingEvent(null);
    } catch (error) {
      toast.error('Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = (event: any) => {
    setDeleteConfirmEvent(event);
  };

  const confirmDeleteEvent = async () => {
    if (!deleteConfirmEvent) return;
    setDeletingEvent(true);
    try {
      await deleteEvent(deleteConfirmEvent.id);
      setEventsList(eventsList.filter(ev => ev.id !== deleteConfirmEvent.id));
      toast.success('Event removed successfully');
      setDeleteConfirmEvent(null);
    } catch (e) {
      toast.error('Failed to delete event');
    } finally {
      setDeletingEvent(false);
    }
  };

  const handleEditEvent = (event: any = null) => {
    if (event) {
      setEditingEvent(event);
    } else {
      setEditingEvent({
        title: '',
        date: new Date().toISOString().split('T')[0],
        time: '',
        category: '',
        price: '',
        description: '',
        image_url: ''
      });
    }
    setIsEventModalOpen(true);
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
    { id: 'events', name: 'Special Events', icon: PartyPopper }
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
                      <div className="mt-3 relative aspect-video w-full max-h-[300px] rounded-lg overflow-hidden border border-sangeet-neutral-800">
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
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                        <span className="text-white text-xs font-bold bg-amber-500/80 px-2 py-1 rounded">{item.media_key || 'gallery'}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingMedia(item)}
                            className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMedia(item.id)}
                            className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'events' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex justify-between items-center bg-sangeet-neutral-950 p-6 rounded-xl border border-sangeet-neutral-800">
                  <div>
                    <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                      <PartyPopper className="w-5 h-5" /> Upcoming Events
                    </h3>
                    <p className="text-sm text-sangeet-neutral-400 mt-1">Manage special events displayed on the homepage.</p>
                  </div>
                  <button
                    onClick={() => handleEditEvent()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Event
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {eventsList.map((event) => (
                    <div key={event.id} className="bg-sangeet-neutral-950 rounded-xl overflow-hidden border border-sangeet-neutral-800 group relative flex flex-col">
                      <div className="relative h-48 w-full bg-sangeet-neutral-900">
                        {event.image_url ? (
                          <Image src={event.image_url} alt={event.title} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sangeet-neutral-700">
                            <ImageIcon className="w-8 h-8" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2 flex gap-2">
                          <button
                            onClick={() => handleEditEvent(event)}
                            className="p-2 bg-black/60 hover:bg-amber-500 hover:text-black text-white rounded-full backdrop-blur-md transition-all shadow-xl"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event)}
                            className="p-2 bg-black/60 hover:bg-red-500 hover:text-white text-white rounded-full backdrop-blur-md transition-all shadow-xl cursor-pointer"
                            title="Delete Event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-white text-lg leading-tight">{event.title}</h4>
                          {event.price && <span className="text-amber-400 font-medium text-sm whitespace-nowrap ml-2">{event.price}</span>}
                        </div>
                        <div className="space-y-1 mt-auto">
                          <div className="flex items-center gap-2 text-sm text-sangeet-neutral-400">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(event.date).toLocaleDateString()} {event.time && `• ${event.time}`}</span>
                          </div>
                          {event.category && (
                            <span className="inline-block px-2 py-0.5 bg-sangeet-neutral-800 text-sangeet-neutral-300 rounded text-xs">
                              {event.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {eventsList.length === 0 && (
                    <div className="col-span-full py-12 text-center text-sangeet-neutral-500 border border-dashed border-sangeet-neutral-800 rounded-xl">
                      No events found. Click "Add Event" to create one.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </main>

      {/* EDIT EVENT MODAL */}
      <AnimatePresence>
        {isEventModalOpen && editingEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-sangeet-neutral-900 border border-sangeet-neutral-800 rounded-xl p-6 max-w-2xl w-full shadow-2xl relative my-8"
            >
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="absolute top-4 right-4 text-sangeet-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-xl font-bold text-amber-400 mb-6">{editingEvent.id ? 'Edit Event' : 'Add New Event'}</h3>
              
              <form onSubmit={handleSaveEvent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">Event Title *</label>
                    <input
                      type="text"
                      required
                      value={editingEvent.title}
                      onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                      className="w-full bg-sangeet-neutral-950 border border-sangeet-neutral-800 rounded-lg px-4 py-2.5 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">Date *</label>
                    <input
                      type="date"
                      required
                      value={editingEvent.date ? new Date(editingEvent.date).toISOString().split('T')[0] : ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                      className="w-full bg-sangeet-neutral-950 border border-sangeet-neutral-800 rounded-lg px-4 py-2.5 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">Time (e.g., 6:00 PM – 11:00 PM)</label>
                    <input
                      type="text"
                      value={editingEvent.time || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                      className="w-full bg-sangeet-neutral-950 border border-sangeet-neutral-800 rounded-lg px-4 py-2.5 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">Category (e.g., Cultural Festival)</label>
                    <input
                      type="text"
                      value={editingEvent.category || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value })}
                      className="w-full bg-sangeet-neutral-950 border border-sangeet-neutral-800 rounded-lg px-4 py-2.5 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">Price (e.g., From $45)</label>
                    <input
                      type="text"
                      value={editingEvent.price || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, price: e.target.value })}
                      className="w-full bg-sangeet-neutral-950 border border-sangeet-neutral-800 rounded-lg px-4 py-2.5 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">Description</label>
                    <textarea
                      value={editingEvent.description || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                      className="w-full bg-sangeet-neutral-950 border border-sangeet-neutral-800 rounded-lg px-4 py-2.5 text-white focus:border-amber-400 focus:outline-none h-24"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">Event Image</label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Image URL or upload a file..."
                        value={editingEvent.image_url || ''}
                        onChange={(e) => setEditingEvent({ ...editingEvent, image_url: e.target.value })}
                        className="flex-1 bg-sangeet-neutral-950 border border-sangeet-neutral-800 rounded-lg px-4 py-2.5 text-white focus:border-amber-400 focus:outline-none"
                      />
                      <label className="flex items-center gap-2 px-4 py-2.5 bg-sangeet-neutral-800 hover:bg-sangeet-neutral-700 text-white rounded-lg cursor-pointer transition-colors border border-sangeet-neutral-700 shrink-0">
                        <Upload className="w-4 h-4" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleEventImageUpload}
                        />
                      </label>
                    </div>
                    {editingEvent.image_url && (
                      <div className="mt-4 relative h-32 w-full rounded-lg overflow-hidden border border-sangeet-neutral-800">
                        <Image src={editingEvent.image_url} alt="Preview" fill className="object-cover" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-6 border-t border-sangeet-neutral-800 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsEventModalOpen(false)}
                    className="px-6 py-2.5 rounded-lg border border-sangeet-neutral-700 text-white hover:bg-sangeet-neutral-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Event'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EDIT MEDIA MODAL */}
      <AnimatePresence>
        {editingMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-sangeet-neutral-900 border border-sangeet-neutral-800 rounded-xl p-6 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setEditingMedia(null)}
                className="absolute top-4 right-4 text-sangeet-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-xl font-bold text-amber-400 mb-6">Edit Media</h3>
              
              <form onSubmit={handleUpdateMedia} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">Category</label>
                  <select
                    value={editingMedia.media_key || 'gallery'}
                    onChange={(e) => setEditingMedia({ ...editingMedia, media_key: e.target.value })}
                    className="w-full bg-sangeet-neutral-950 border border-sangeet-neutral-800 rounded-lg px-4 py-2.5 text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="dining">Dining Areas</option>
                    <option value="celebrations">Celebrations</option>
                    <option value="cultural">Cultural Experience</option>
                    <option value="culinary">Culinary Journey</option>
                    <option value="gallery">General Gallery</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">Title (Alt Text)</label>
                  <input
                    type="text"
                    value={editingMedia.alt_text || ''}
                    onChange={(e) => setEditingMedia({ ...editingMedia, alt_text: e.target.value })}
                    className="w-full bg-sangeet-neutral-950 border border-sangeet-neutral-800 rounded-lg px-4 py-2.5 text-white focus:border-amber-400 focus:outline-none"
                    placeholder="e.g. Main Dining Hall"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">Description</label>
                  <textarea
                    value={editingMedia.caption || ''}
                    onChange={(e) => setEditingMedia({ ...editingMedia, caption: e.target.value })}
                    className="w-full bg-sangeet-neutral-950 border border-sangeet-neutral-800 rounded-lg px-4 py-2.5 text-white focus:border-amber-400 focus:outline-none h-24"
                    placeholder="Brief description for the gallery..."
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingMedia(null)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-sangeet-neutral-700 text-white hover:bg-sangeet-neutral-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE EVENT CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfirmEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-sangeet-neutral-900 border border-sangeet-neutral-700/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-sangeet-neutral-800 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Delete Special Event</h3>
                  <p className="text-sm text-sangeet-neutral-400">Remove from homepage celebrations</p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-sangeet-neutral-950 p-4 rounded-xl border border-sangeet-neutral-800">
                  <div className="font-semibold text-sangeet-neutral-100 mb-1">{deleteConfirmEvent.title}</div>
                  <div className="text-xs text-sangeet-neutral-400 flex items-center gap-2">
                    <span>{new Date(deleteConfirmEvent.date).toLocaleDateString()}</span>
                    {deleteConfirmEvent.category && <span>• {deleteConfirmEvent.category}</span>}
                    {deleteConfirmEvent.price && <span className="text-amber-400 font-medium">• {deleteConfirmEvent.price}</span>}
                  </div>
                </div>

                <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300 flex items-start gap-2.5">
                  <span className="text-base leading-none">⚠️</span>
                  <span className="leading-relaxed">
                    This action will permanently delete this event. You can also keep it and update its date for future use.
                  </span>
                </div>
              </div>

              <div className="flex gap-3 p-6 border-t border-sangeet-neutral-800 bg-sangeet-neutral-950/60">
                <button
                  type="button"
                  disabled={deletingEvent}
                  onClick={() => setDeleteConfirmEvent(null)}
                  className="flex-1 px-5 py-2.5 rounded-lg bg-sangeet-neutral-800 hover:bg-sangeet-neutral-700 text-sangeet-neutral-200 font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deletingEvent}
                  onClick={confirmDeleteEvent}
                  className="flex-1 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition-all shadow-lg hover:shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {deletingEvent ? 'Deleting...' : 'Delete Event'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RestaurantWebsiteManagementPage;
