import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import AdminHeader from '../components/AdminHeader';
import {
  getRestaurantSettings,
  updateRestaurantSettings,
  getWebsiteContent,
  updateWebsiteContent,
  getWebsiteMedia,
  uploadWebsiteMedia,
  deleteWebsiteMedia,
  getWebsiteStats
} from '../services/api';

const RestaurantWebsiteManagementPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [settings, setSettings] = useState({});
  const [content, setContent] = useState({});
  const [media, setMedia] = useState([]);
  const [saving, setSaving] = useState(false);

  // Load all data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [statsData, settingsData, contentData, mediaData] = await Promise.all([
          getWebsiteStats(),
          getRestaurantSettings(),
          getWebsiteContent(),
          getWebsiteMedia()
        ]);

        setStats(statsData.stats);
        setSettings(settingsData.settings);
        setContent(contentData.content);
        setMedia(mediaData.media);
      } catch (error) {
        console.error('Error loading website data:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        } else {
          toast.error('Failed to load website data');
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  // Save settings
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await updateRestaurantSettings(settings);
      toast.success('Restaurant settings updated successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Save content
  const handleSaveContent = async () => {
    try {
      setSaving(true);
      await updateWebsiteContent(content);
      toast.success('Website content updated successfully!');
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event, mediaKey) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('media_key', mediaKey);

    try {
      const response = await uploadWebsiteMedia(formData);
      setMedia([...media, response.media]);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload image');
    }
  };

  // Delete media
  const handleDeleteMedia = async (id) => {
    try {
      await deleteWebsiteMedia(id);
      setMedia(media.filter(item => item.id !== id));
      toast.success('Image deleted successfully!');
    } catch (error) {
      console.error('Error deleting media:', error);
      toast.error('Failed to delete image');
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        value
      }
    }));
  };

  const updateContent = (key, field, value) => {
    setContent(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sangeet-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sangeet-400 mx-auto mb-4"></div>
          <p className="text-sangeet-400">Loading website management...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'settings', name: 'Restaurant Settings', icon: '⚙️' },
    { id: 'content', name: 'Website Content', icon: '📝' },
    { id: 'media', name: 'Media Gallery', icon: '🖼️' }
  ];

  return (
    <div className="min-h-screen bg-sangeet-neutral-950">
      <AdminHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-sangeet-400 mb-2">
            🌐 Restaurant Website Management
          </h1>
          <p className="text-sangeet-neutral-400">
            Manage your restaurant's website content, settings, and media gallery
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-sangeet-neutral-900 rounded-xl border border-sangeet-neutral-700 mb-6">
          <div className="flex flex-wrap border-b border-sangeet-neutral-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-sangeet-400 border-b-2 border-sangeet-400 bg-sangeet-400/5'
                    : 'text-sangeet-neutral-400 hover:text-sangeet-300'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Stats Cards */}
                  <div className="bg-gradient-to-br from-sangeet-400/10 to-sangeet-400/5 rounded-lg p-6 border border-sangeet-400/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-sangeet-400/20 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">⚙️</span>
                      </div>
                      <span className="text-2xl font-bold text-sangeet-400">{stats.total_settings || 0}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-sangeet-neutral-100 mb-1">Settings Configured</h3>
                    <p className="text-sangeet-neutral-400 text-sm">Restaurant information and preferences</p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-400/10 to-blue-400/5 rounded-lg p-6 border border-blue-400/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-400/20 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📝</span>
                      </div>
                      <span className="text-2xl font-bold text-blue-400">{stats.total_content_sections || 0}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-sangeet-neutral-100 mb-1">Content Sections</h3>
                    <p className="text-sangeet-neutral-400 text-sm">Website content and descriptions</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-400/10 to-green-400/5 rounded-lg p-6 border border-green-400/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-green-400/20 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">🖼️</span>
                      </div>
                      <span className="text-2xl font-bold text-green-400">{stats.total_media_files || 0}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-sangeet-neutral-100 mb-1">Media Files</h3>
                    <p className="text-sangeet-neutral-400 text-sm">Images and visual content</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-sangeet-neutral-800 rounded-lg p-6 border border-sangeet-neutral-600">
                  <h3 className="text-xl font-bold text-sangeet-400 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                      onClick={() => setActiveTab('settings')}
                      className="flex items-center gap-3 p-4 bg-sangeet-neutral-700 rounded-lg hover:bg-sangeet-neutral-600 transition-colors text-left"
                    >
                      <span className="text-2xl">⚙️</span>
                      <div>
                        <div className="font-medium text-sangeet-neutral-100">Update Settings</div>
                        <div className="text-sm text-sangeet-neutral-400">Restaurant info & hours</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab('content')}
                      className="flex items-center gap-3 p-4 bg-sangeet-neutral-700 rounded-lg hover:bg-sangeet-neutral-600 transition-colors text-left"
                    >
                      <span className="text-2xl">📝</span>
                      <div>
                        <div className="font-medium text-sangeet-neutral-100">Edit Content</div>
                        <div className="text-sm text-sangeet-neutral-400">About, announcements</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab('media')}
                      className="flex items-center gap-3 p-4 bg-sangeet-neutral-700 rounded-lg hover:bg-sangeet-neutral-600 transition-colors text-left"
                    >
                      <span className="text-2xl">🖼️</span>
                      <div>
                        <div className="font-medium text-sangeet-neutral-100">Manage Media</div>
                        <div className="text-sm text-sangeet-neutral-400">Upload & organize images</div>
                      </div>
                    </button>

                    <button
                      onClick={() => window.open('/', '_blank')}
                      className="flex items-center gap-3 p-4 bg-sangeet-400/20 rounded-lg hover:bg-sangeet-400/30 transition-colors text-left border border-sangeet-400/30"
                    >
                      <span className="text-2xl">🌐</span>
                      <div>
                        <div className="font-medium text-sangeet-400">Preview Website</div>
                        <div className="text-sm text-sangeet-400/70">View live website</div>
                      </div>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Restaurant Settings Tab */}
            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-sangeet-400">Restaurant Settings</h3>
                  <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="bg-sangeet-400 text-sangeet-neutral-950 px-6 py-2 rounded-lg font-semibold hover:bg-sangeet-300 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="bg-sangeet-neutral-800 rounded-lg p-6 border border-sangeet-neutral-600">
                    <h4 className="text-lg font-semibold text-sangeet-neutral-100 mb-4">Basic Information</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
                          Restaurant Name
                        </label>
                        <input
                          type="text"
                          value={settings.restaurant_name?.value || ''}
                          onChange={(e) => updateSetting('restaurant_name', e.target.value)}
                          className="w-full px-4 py-2 bg-sangeet-neutral-700 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 focus:outline-none focus:ring-2 focus:ring-sangeet-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
                          Tagline/Slogan
                        </label>
                        <input
                          type="text"
                          value={settings.restaurant_tagline?.value || ''}
                          onChange={(e) => updateSetting('restaurant_tagline', e.target.value)}
                          className="w-full px-4 py-2 bg-sangeet-neutral-700 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 focus:outline-none focus:ring-2 focus:ring-sangeet-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={settings.phone_number?.value || ''}
                          onChange={(e) => updateSetting('phone_number', e.target.value)}
                          className="w-full px-4 py-2 bg-sangeet-neutral-700 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 focus:outline-none focus:ring-2 focus:ring-sangeet-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={settings.email?.value || ''}
                          onChange={(e) => updateSetting('email', e.target.value)}
                          className="w-full px-4 py-2 bg-sangeet-neutral-700 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 focus:outline-none focus:ring-2 focus:ring-sangeet-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
                          Address
                        </label>
                        <textarea
                          value={settings.address?.value || ''}
                          onChange={(e) => updateSetting('address', e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 bg-sangeet-neutral-700 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 focus:outline-none focus:ring-2 focus:ring-sangeet-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Media & Features */}
                  <div className="bg-sangeet-neutral-800 rounded-lg p-6 border border-sangeet-neutral-600">
                    <h4 className="text-lg font-semibold text-sangeet-neutral-100 mb-4">Social Media & Features</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
                          Facebook URL
                        </label>
                        <input
                          type="url"
                          value={settings.social_facebook?.value || ''}
                          onChange={(e) => updateSetting('social_facebook', e.target.value)}
                          className="w-full px-4 py-2 bg-sangeet-neutral-700 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 focus:outline-none focus:ring-2 focus:ring-sangeet-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
                          Instagram URL
                        </label>
                        <input
                          type="url"
                          value={settings.social_instagram?.value || ''}
                          onChange={(e) => updateSetting('social_instagram', e.target.value)}
                          className="w-full px-4 py-2 bg-sangeet-neutral-700 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 focus:outline-none focus:ring-2 focus:ring-sangeet-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
                          Twitter URL
                        </label>
                        <input
                          type="url"
                          value={settings.social_twitter?.value || ''}
                          onChange={(e) => updateSetting('social_twitter', e.target.value)}
                          className="w-full px-4 py-2 bg-sangeet-neutral-700 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 focus:outline-none focus:ring-2 focus:ring-sangeet-400"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="reservation_enabled"
                            checked={settings.reservation_enabled?.value || false}
                            onChange={(e) => updateSetting('reservation_enabled', e.target.checked)}
                            className="w-4 h-4 text-sangeet-400 bg-sangeet-neutral-700 border-sangeet-neutral-600 rounded focus:ring-sangeet-400"
                          />
                          <label htmlFor="reservation_enabled" className="text-sm text-sangeet-neutral-300">
                            Enable Online Reservations
                          </label>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="delivery_enabled"
                            checked={settings.delivery_enabled?.value || false}
                            onChange={(e) => updateSetting('delivery_enabled', e.target.checked)}
                            className="w-4 h-4 text-sangeet-400 bg-sangeet-neutral-700 border-sangeet-neutral-600 rounded focus:ring-sangeet-400"
                          />
                          <label htmlFor="delivery_enabled" className="text-sm text-sangeet-neutral-300">
                            Enable Delivery/Takeout Orders
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
                          Theme Color
                        </label>
                        <input
                          type="color"
                          value={settings.website_theme_color?.value || '#D97706'}
                          onChange={(e) => updateSetting('website_theme_color', e.target.value)}
                          className="w-full h-12 bg-sangeet-neutral-700 border border-sangeet-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sangeet-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Website Content Tab */}
            {activeTab === 'content' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-sangeet-400">Website Content</h3>
                  <button
                    onClick={handleSaveContent}
                    disabled={saving}
                    className="bg-sangeet-400 text-sangeet-neutral-950 px-6 py-2 rounded-lg font-semibold hover:bg-sangeet-300 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Content'}
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Hero Section */}
                  <div className="bg-sangeet-neutral-800 rounded-lg p-6 border border-sangeet-neutral-600">
                    <h4 className="text-lg font-semibold text-sangeet-neutral-100 mb-4">Hero Section</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
                          Main Title
                        </label>
                        <input
                          type="text"
                          value={content.hero_title?.content || ''}
                          onChange={(e) => updateContent('hero_title', 'content', e.target.value)}
                          className="w-full px-4 py-2 bg-sangeet-neutral-700 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 focus:outline-none focus:ring-2 focus:ring-sangeet-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
                          Subtitle
                        </label>
                        <textarea
                          value={content.hero_subtitle?.content || ''}
                          onChange={(e) => updateContent('hero_subtitle', 'content', e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 bg-sangeet-neutral-700 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 focus:outline-none focus:ring-2 focus:ring-sangeet-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* About Section */}
                  <div className="bg-sangeet-neutral-800 rounded-lg p-6 border border-sangeet-neutral-600">
                    <h4 className="text-lg font-semibold text-sangeet-neutral-100 mb-4">About Section</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
                          About Title
                        </label>
                        <input
                          type="text"
                          value={content.about_title?.content || ''}
                          onChange={(e) => updateContent('about_title', 'content', e.target.value)}
                          className="w-full px-4 py-2 bg-sangeet-neutral-700 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 focus:outline-none focus:ring-2 focus:ring-sangeet-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
                          About Content
                        </label>
                        <textarea
                          value={content.about_content?.content || ''}
                          onChange={(e) => updateContent('about_content', 'content', e.target.value)}
                          rows={6}
                          className="w-full px-4 py-2 bg-sangeet-neutral-700 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 focus:outline-none focus:ring-2 focus:ring-sangeet-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Special Announcements */}
                  <div className="bg-sangeet-neutral-800 rounded-lg p-6 border border-sangeet-neutral-600">
                    <h4 className="text-lg font-semibold text-sangeet-neutral-100 mb-4">Special Announcements</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
                          Announcement
                        </label>
                        <textarea
                          value={content.special_announcement?.content || ''}
                          onChange={(e) => updateContent('special_announcement', 'content', e.target.value)}
                          rows={4}
                          className="w-full px-4 py-2 bg-sangeet-neutral-700 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 focus:outline-none focus:ring-2 focus:ring-sangeet-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Chef's Recommendations */}
                  <div className="bg-sangeet-neutral-800 rounded-lg p-6 border border-sangeet-neutral-600">
                    <h4 className="text-lg font-semibold text-sangeet-neutral-100 mb-4">Chef's Recommendations</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
                          Section Title
                        </label>
                        <input
                          type="text"
                          value={content.chef_special_title?.content || ''}
                          onChange={(e) => updateContent('chef_special_title', 'content', e.target.value)}
                          className="w-full px-4 py-2 bg-sangeet-neutral-700 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 focus:outline-none focus:ring-2 focus:ring-sangeet-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
                          Description
                        </label>
                        <textarea
                          value={content.chef_special_description?.content || ''}
                          onChange={(e) => updateContent('chef_special_description', 'content', e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 bg-sangeet-neutral-700 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 focus:outline-none focus:ring-2 focus:ring-sangeet-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Media Gallery Tab */}
            {activeTab === 'media' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-sangeet-400">Media Gallery</h3>
                  <label className="bg-sangeet-400 text-sangeet-neutral-950 px-6 py-2 rounded-lg font-semibold hover:bg-sangeet-300 transition-colors cursor-pointer">
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'gallery')}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {media.map((item) => (
                    <div key={item.id} className="bg-sangeet-neutral-800 rounded-lg p-4 border border-sangeet-neutral-600">
                      <div className="aspect-square bg-sangeet-neutral-700 rounded-lg mb-3 overflow-hidden">
                        <img
                          src={`http://localhost:5001${item.file_path}`}
                          alt={item.alt_text || item.file_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-sangeet-neutral-100 truncate">
                          {item.file_name}
                        </p>
                        <p className="text-xs text-sangeet-neutral-400">
                          {item.media_key}
                        </p>
                        <button
                          onClick={() => handleDeleteMedia(item.id)}
                          className="w-full bg-red-500/20 text-red-400 px-3 py-1 rounded text-sm hover:bg-red-500/30 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}

                  {media.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <div className="text-6xl mb-4">🖼️</div>
                      <h3 className="text-xl font-semibold text-sangeet-neutral-300 mb-2">
                        No media files yet
                      </h3>
                      <p className="text-sangeet-neutral-400 mb-4">
                        Upload images to build your restaurant's media gallery
                      </p>
                    </div>
                  )}
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
