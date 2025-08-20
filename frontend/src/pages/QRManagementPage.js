import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  QrCode, 
  Plus, 
  Download, 
  Trash2, 
  BarChart3, 
  Smartphone,
  RefreshCw,
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminHeader from '../components/AdminHeader';
import CustomDropdown from '../components/CustomDropdown';
import {
  getAllQRCodes,
  generateTableQRCode,
  bulkGenerateTableQRCodes,
  getQRCodeAnalytics,
  deleteQRCode,
  downloadPrintableQRCode
} from '../services/api';

const QRManagementPage = () => {
  const [qrCodes, setQrCodes] = useState({ tableQRCodes: [] });
  const [loading, setLoading] = useState(true);

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedQRCode, setSelectedQRCode] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadTarget, setDownloadTarget] = useState(null);
  const [downloadOptions, setDownloadOptions] = useState({
    format: 'png',
    design: 'classic',
    theme: 'modern'
  });
  const [formData, setFormData] = useState({
    tableNumber: '',
    customUrl: '',
    purpose: '',
    targetUrl: '',
    title: '',
    description: '',
    expiresAt: '',
    design: {
      darkColor: '#1d1b16',
      lightColor: '#ffffff',
      width: 300,
      margin: 2
    }
  });
  const [bulkFormData, setBulkFormData] = useState({
    tableNumbers: '',
    baseUrl: process.env.REACT_APP_CLIENT_URL || 'http://localhost:3000',
    design: {
      darkColor: '#1d1b16',
      lightColor: '#ffffff',
      width: 300,
      margin: 2
    }
  });

  // Sorting and filtering state
  const [sortConfig, setSortConfig] = useState({
    key: 'table_number',
    direction: 'asc'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive, with_orders, without_orders

  // Dropdown options
  const filterOptions = [
    { value: 'all', label: 'All QR Codes' },
    { value: 'active', label: 'Active Only' },
    { value: 'inactive', label: 'Inactive Only' },
    { value: 'with_orders', label: 'With Active Orders' },
    { value: 'without_orders', label: 'Without Orders' }
  ];

  const designOptions = [
    { value: 'classic', label: 'Classic (600px portrait)' },
    { value: 'large', label: 'Large (750px portrait)' },
    { value: 'premium', label: 'Premium (700px portrait)' }
  ];

  const themeOptions = [
    { value: 'modern', label: 'Modern Blue' },
    { value: 'elegant', label: 'Elegant Purple' },
    { value: 'premium', label: 'Premium Green' },
    { value: 'classic', label: 'Classic Red' },
    { value: 'gold', label: 'Elegant Gold' }
  ];

  const formatOptions = [
    { value: 'png', label: 'PNG (High Quality)' },
    { value: 'jpeg', label: 'JPEG (Smaller Size)' }
  ];

  useEffect(() => {
    loadQRCodes();
  }, []);

  // Sorting and filtering logic
  const sortedAndFilteredQRCodes = useMemo(() => {
    let filtered = qrCodes.tableQRCodes;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(qrCode => {
        return qrCode.table_number.toString().includes(searchTerm);
      });
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(qrCode => {
        switch (filterStatus) {
          case 'active':
            return qrCode.is_active === true;
          case 'inactive':
            return qrCode.is_active === false;
          case 'with_orders':
            return (qrCode.active_orders || 0) > 0;
          case 'without_orders':
            return (qrCode.active_orders || 0) === 0;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      if (sortConfig.key === 'table_number') {
        aValue = parseInt(a.table_number);
        bValue = parseInt(b.table_number);
      } else if (sortConfig.key === 'active_orders') {
        aValue = a.active_orders || 0;
        bValue = b.active_orders || 0;
      } else if (sortConfig.key === 'total_orders') {
        aValue = a.total_orders || 0;
        bValue = b.total_orders || 0;
      } else if (sortConfig.key === 'created_at') {
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
      } else {
        aValue = a[sortConfig.key];
        bValue = b[sortConfig.key];
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [qrCodes, searchTerm, filterStatus, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="h-4 w-4" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const loadQRCodes = async () => {
    try {
      setLoading(true);
      const response = await getAllQRCodes();
      setQrCodes(response);
    } catch (error) {
      console.error('Error loading QR codes:', error);
      toast.error('Failed to load QR codes');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async () => {
    try {
      if (!formData.tableNumber) {
        toast.error('Table number is required');
        return;
      }
      
      await generateTableQRCode(formData);
      toast.success('Table QR code generated successfully!');
      
      setShowGenerateModal(false);
      setFormData({
        tableNumber: '',
        customUrl: '',
        design: {
          darkColor: '#1d1b16',
          lightColor: '#ffffff',
          width: 300,
          margin: 2
        }
      });
      loadQRCodes();
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error(error.response?.data?.error || 'Failed to generate QR code');
    }
  };

  const handleBulkGenerate = async () => {
    try {
      const tableNumbers = bulkFormData.tableNumbers
        .split(',')
        .map(num => num.trim())
        .filter(num => num);

      if (tableNumbers.length === 0) {
        toast.error('Please enter table numbers');
        return;
      }

      const response = await bulkGenerateTableQRCodes({
        tableNumbers,
        baseUrl: bulkFormData.baseUrl,
        design: bulkFormData.design
      });

      if (response.summary.successful > 0) {
        toast.success(`Generated ${response.summary.successful} QR codes successfully!`);
      }
      if (response.errors.length > 0) {
        toast.error(`${response.errors.length} QR codes failed to generate`);
      }

      setShowBulkModal(false);
      setBulkFormData({
        tableNumbers: '',
        baseUrl: 'http://localhost:3000',
        design: {
          darkColor: '#1d1b16',
          lightColor: '#ffffff',
          width: 300,
          margin: 2
        }
      });
      loadQRCodes();
    } catch (error) {
      console.error('Error bulk generating QR codes:', error);
      toast.error('Failed to bulk generate QR codes');
    }
  };

  const handleViewAnalytics = async (qrCode) => {
    try {
      setSelectedQRCode(qrCode);
      const analyticsData = await getQRCodeAnalytics(qrCode.id);
      setAnalytics(analyticsData);
      setShowAnalyticsModal(true);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    }
  };

  const handleDeleteQR = async (qrCode) => {
    setDeleteTarget({ qrCode });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteQRCode(deleteTarget.qrCode.id);
      toast.success('QR code deleted successfully!');
      loadQRCodes();
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting QR code:', error);
      const errorMessage = error.response?.data?.error || 'Failed to delete QR code';
      
      if (errorMessage.includes('existing orders')) {
        toast.error('Cannot delete QR code: Table has existing orders. Please complete or delete the orders first.');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleDownloadQR = async (qrCode, format = 'png', design = 'classic', theme = 'modern') => {
    try {
      console.log(`🔄 Starting download for QR code ${qrCode.id} (Table ${qrCode.table_number})`);
      await downloadPrintableQRCode(qrCode.id, format, design, theme);
      console.log('✅ Download completed successfully');
    } catch (error) {
      console.error('❌ Error downloading QR code:', error);
      toast.error(`Failed to download QR code: ${error.message}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/20 border border-green-400/30';
      case 'expired':
        return 'text-red-400 bg-red-400/20 border border-red-400/30';
      default:
        return 'text-sangeet-neutral-400 bg-sangeet-neutral-800 border border-sangeet-neutral-700';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sangeet-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin h-8 w-8 text-sangeet-400 mx-auto mb-4" />
          <p className="text-sangeet-neutral-400">Loading QR codes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sangeet-neutral-950">
      <AdminHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mb-6">
          <button
            onClick={() => setShowBulkModal(true)}
            className="inline-flex items-center px-4 py-2 border border-sangeet-neutral-600 rounded-md shadow-sm text-sm font-medium text-sangeet-neutral-300 bg-sangeet-neutral-800 hover:bg-sangeet-neutral-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Bulk Generate
          </button>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-sangeet-neutral-950 bg-sangeet-400 hover:bg-sangeet-500 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Generate QR Code
          </button>
        </div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-sangeet-neutral-100 mb-2">
            Table QR Code Management
          </h1>
          <p className="text-sangeet-neutral-400">
            Manage QR codes for table ordering system
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sangeet-neutral-400" />
              <input
                type="text"
                placeholder="Search by table number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-md text-sangeet-neutral-100 placeholder-sangeet-neutral-400 focus:outline-none focus:ring-2 focus:ring-sangeet-400 focus:border-transparent"
              />
            </div>
            
            {/* Filter Dropdown */}
            <div className="relative">
              <CustomDropdown
                value={filterStatus}
                onChange={setFilterStatus}
                options={filterOptions}
                className="min-w-[200px]"
              />
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-sangeet-neutral-400">Sort by:</span>
              <button
                onClick={() => handleSort('table_number')}
                className="flex items-center space-x-1 px-3 py-1 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-md text-sangeet-neutral-300 hover:bg-sangeet-neutral-700 transition-colors"
              >
                <span>Table</span>
                {getSortIcon('table_number')}
              </button>
              <button
                onClick={() => handleSort('active_orders')}
                className="flex items-center space-x-1 px-3 py-1 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-md text-sangeet-neutral-300 hover:bg-sangeet-neutral-700 transition-colors"
              >
                <span>Orders</span>
                {getSortIcon('active_orders')}
              </button>
              <button
                onClick={() => handleSort('created_at')}
                className="flex items-center space-x-1 px-3 py-1 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-md text-sangeet-neutral-300 hover:bg-sangeet-neutral-700 transition-colors"
              >
                <span>Created</span>
                {getSortIcon('created_at')}
              </button>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-sangeet-neutral-400">
            <span>
              Showing {sortedAndFilteredQRCodes.length} of {qrCodes.tableQRCodes.length} QR codes
            </span>
            {(searchTerm || filterStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
                className="text-sangeet-400 hover:text-sangeet-300 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

                {/* QR Codes Grid */}
        {sortedAndFilteredQRCodes.length === 0 ? (
          <div className="text-center py-12">
            <QrCode className="h-16 w-16 text-sangeet-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-sangeet-neutral-400 mb-2">
              No QR codes found
            </h3>
            <p className="text-sangeet-neutral-500">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No table QR codes available yet'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedAndFilteredQRCodes.map((qrCode) => (
                  <motion.div
                    key={qrCode.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-sangeet-neutral-900 rounded-xl shadow-lg border border-sangeet-neutral-700 overflow-hidden hover:border-sangeet-400/50 transition-all duration-300"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <Smartphone className="h-5 w-5 text-sangeet-400" />
                          <h3 className="text-lg font-semibold text-sangeet-neutral-100">
                            Table {qrCode.table_number}
                          </h3>
                          {(qrCode.active_orders || 0) > 0 && (
                            <span className="px-2 py-1 text-xs bg-orange-400/20 text-orange-400 border border-orange-400/30 rounded-full">
                              {qrCode.active_orders} active orders
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewAnalytics(qrCode)}
                            className="p-1 text-sangeet-neutral-400 hover:text-sangeet-400 transition-colors"
                            title="View Analytics"
                          >
                            <BarChart3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDownloadTarget(qrCode);
                              setShowDownloadModal(true);
                            }}
                            className="p-1 text-sangeet-neutral-400 hover:text-green-400 transition-colors"
                            title="Download Beautiful QR Code"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteQR(qrCode)}
                            className={`p-1 transition-colors ${
                              (qrCode.active_orders || 0) > 0 
                                ? 'text-red-400/50 cursor-not-allowed' 
                                : 'text-sangeet-neutral-400 hover:text-red-400'
                            }`}
                            title={(qrCode.active_orders || 0) > 0 
                              ? `Cannot delete: ${qrCode.active_orders} active orders` 
                              : 'Delete QR code'
                            }
                            disabled={(qrCode.active_orders || 0) > 0}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* QR Code Preview */}
                      <div className="bg-sangeet-neutral-800 rounded-lg p-4 mb-4 flex justify-center">
                        <img
                          src={qrCode.qr_code_data}
                          alt={`QR Code for Table ${qrCode.table_number}`}
                          className="w-32 h-32"
                        />
                      </div>

                      {/* Analytics Summary */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-sangeet-neutral-400">Total Orders</p>
                          <p className="font-semibold text-sangeet-neutral-100">{qrCode.total_orders || 0}</p>
                        </div>
                        <div>
                          <p className="text-sangeet-neutral-400">Revenue</p>
                          <p className="font-semibold text-sangeet-neutral-100">{formatCurrency(qrCode.total_revenue)}</p>
                        </div>
                        <div>
                          <p className="text-sangeet-neutral-400">Active Orders</p>
                          <p className="font-semibold text-sangeet-neutral-100">{qrCode.active_orders || 0}</p>
                        </div>
                        <div>
                          <p className="text-sangeet-neutral-400">Last Order</p>
                          <p className="font-semibold text-xs text-sangeet-neutral-300">
                            {qrCode.last_order_date ? formatDate(qrCode.last_order_date) : 'Never'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-sangeet-neutral-700">
                        <p className="text-xs text-sangeet-neutral-500 truncate">
                          {qrCode.qr_code_url}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
            }
          </div>
        )}


      </div>

      {/* Generate QR Code Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border border-sangeet-neutral-700 w-96 shadow-xl rounded-xl bg-sangeet-neutral-900">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-sangeet-neutral-100 mb-4">
                Generate Table QR Code
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">
                    Table Number *
                  </label>
                  <input
                    type="text"
                    value={formData.tableNumber}
                    onChange={(e) => setFormData({...formData, tableNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-sangeet-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sangeet-400 bg-sangeet-neutral-800 text-sangeet-neutral-100 placeholder-sangeet-neutral-500"
                    placeholder="e.g., 1, 2, 3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">
                    Custom URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.customUrl}
                    onChange={(e) => setFormData({...formData, customUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-sangeet-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sangeet-400 bg-sangeet-neutral-800 text-sangeet-neutral-100 placeholder-sangeet-neutral-500"
                    placeholder="https://your-restaurant.com/qr/table-1"
                  />
                  <p className="text-xs text-sangeet-neutral-500 mt-1">
                    Leave empty to use default: {process.env.REACT_APP_CLIENT_URL || 'http://localhost:3000'}/qr/table-[number]
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-sangeet-neutral-300 bg-sangeet-neutral-800 hover:bg-sangeet-neutral-700 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleGenerateQR()}
                  className="px-4 py-2 text-sm font-medium text-sangeet-neutral-950 bg-sangeet-400 hover:bg-sangeet-500 rounded-md transition-colors"
                >
                  Generate QR Code
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Generate Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border border-sangeet-neutral-700 w-96 shadow-xl rounded-xl bg-sangeet-neutral-900">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-sangeet-neutral-100 mb-4">
                Bulk Generate Table QR Codes
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">
                    Table Numbers *
                  </label>
                  <input
                    type="text"
                    value={bulkFormData.tableNumbers}
                    onChange={(e) => setBulkFormData({...bulkFormData, tableNumbers: e.target.value})}
                    className="w-full px-3 py-2 border border-sangeet-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sangeet-400 bg-sangeet-neutral-800 text-sangeet-neutral-100 placeholder-sangeet-neutral-500"
                    placeholder="e.g., 1,2,3,4,5 or 1-10"
                  />
                  <p className="text-xs text-sangeet-neutral-500 mt-1">
                    Enter table numbers separated by commas
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">
                    Base URL
                  </label>
                  <input
                    type="url"
                    value={bulkFormData.baseUrl}
                    onChange={(e) => setBulkFormData({...bulkFormData, baseUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-sangeet-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sangeet-400 bg-sangeet-neutral-800 text-sangeet-neutral-100 placeholder-sangeet-neutral-500"
                    placeholder="https://your-restaurant.com"
                  />
                  <p className="text-xs text-sangeet-neutral-500 mt-1">
                    This will be used as the base for all QR code URLs. For production, use your actual domain.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 text-sm font-medium text-sangeet-neutral-300 bg-sangeet-neutral-800 hover:bg-sangeet-neutral-700 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkGenerate}
                  className="px-4 py-2 text-sm font-medium text-sangeet-neutral-950 bg-sangeet-400 hover:bg-sangeet-500 rounded-md transition-colors"
                >
                  Generate QR Codes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && selectedQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border border-sangeet-neutral-700 w-96 shadow-xl rounded-xl bg-sangeet-neutral-900">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-sangeet-neutral-100 mb-4">
                QR Code Analytics
              </h3>
              
              {analytics ? (
                <div className="space-y-4">
                  {selectedQRCode.type === 'table' ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-sangeet-400/20 p-4 rounded-lg border border-sangeet-400/30">
                          <p className="text-sm text-sangeet-400 font-medium">Total Orders</p>
                          <p className="text-2xl font-bold text-sangeet-neutral-100">{analytics.total_orders || 0}</p>
                        </div>
                        <div className="bg-green-400/20 p-4 rounded-lg border border-green-400/30">
                          <p className="text-sm text-green-400 font-medium">Revenue</p>
                          <p className="text-2xl font-bold text-sangeet-neutral-100">{formatCurrency(analytics.total_revenue)}</p>
                        </div>
                        <div className="bg-yellow-400/20 p-4 rounded-lg border border-yellow-400/30">
                          <p className="text-sm text-yellow-400 font-medium">Completed</p>
                          <p className="text-2xl font-bold text-sangeet-neutral-100">{analytics.completed_orders || 0}</p>
                        </div>
                        <div className="bg-red-400/20 p-4 rounded-lg border border-red-400/30">
                          <p className="text-sm text-red-400 font-medium">Cancelled</p>
                          <p className="text-2xl font-bold text-sangeet-neutral-100">{analytics.cancelled_orders || 0}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-sangeet-neutral-400">Average Order Value:</span>
                          <span className="font-semibold text-sangeet-neutral-100">{formatCurrency(analytics.avg_order_value)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sangeet-neutral-400">Active Days:</span>
                          <span className="font-semibold text-sangeet-neutral-100">{analytics.active_days || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sangeet-neutral-400">First Order:</span>
                          <span className="font-semibold text-xs text-sangeet-neutral-300">
                            {analytics.first_order ? formatDate(analytics.first_order) : 'Never'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sangeet-neutral-400">Last Order:</span>
                          <span className="font-semibold text-xs text-sangeet-neutral-300">
                            {analytics.last_order ? formatDate(analytics.last_order) : 'Never'}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-sangeet-neutral-400">Purpose</p>
                        <p className="font-semibold text-sangeet-neutral-100">{analytics.purpose}</p>
                      </div>
                      <div>
                        <p className="text-sm text-sangeet-neutral-400">Status</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(analytics.status)}`}>
                          {analytics.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-sangeet-neutral-400">Created</p>
                        <p className="font-semibold text-xs text-sangeet-neutral-300">{formatDate(analytics.created_at)}</p>
                      </div>
                      {analytics.expires_at && (
                        <div>
                          <p className="text-sm text-sangeet-neutral-400">Expires</p>
                          <p className="font-semibold text-xs text-sangeet-neutral-300">{formatDate(analytics.expires_at)}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-sangeet-neutral-600 mx-auto mb-4" />
                  <p className="text-sangeet-neutral-400">No analytics data available</p>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowAnalyticsModal(false)}
                  className="px-4 py-2 text-sm font-medium text-sangeet-neutral-300 bg-sangeet-neutral-800 hover:bg-sangeet-neutral-700 rounded-md transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Download Options Modal */}
      {showDownloadModal && downloadTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border border-sangeet-neutral-700 w-96 shadow-xl rounded-xl bg-sangeet-neutral-900">
            <div className="mt-3">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-400/20 rounded-full flex items-center justify-center">
                    <Download className="h-6 w-6 text-green-400" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-sangeet-neutral-100">
                    Download Beautiful QR Code
                  </h3>
                  <p className="text-sm text-sangeet-neutral-400">
                    Table {downloadTarget.table_number}
                  </p>
                </div>
              </div>
              
                                <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
                        Design Style
                      </label>
                      <CustomDropdown
                        value={downloadOptions.design}
                        onChange={(design) => setDownloadOptions({...downloadOptions, design})}
                        options={designOptions}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
                        Color Theme
                      </label>
                      <CustomDropdown
                        value={downloadOptions.theme}
                        onChange={(theme) => setDownloadOptions({...downloadOptions, theme})}
                        options={themeOptions}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
                        Format
                      </label>
                      <CustomDropdown
                        value={downloadOptions.format}
                        onChange={(format) => setDownloadOptions({...downloadOptions, format})}
                        options={formatOptions}
                        className="w-full"
                      />
                    </div>

                <div className="bg-sangeet-neutral-800 rounded-lg p-3 border border-sangeet-neutral-700">
                  <p className="text-xs text-sangeet-neutral-400 mb-2">Preview:</p>
                  <div className="text-sm text-sangeet-neutral-300">
                    <p>• Sangeet logo and branding</p>
                    <p>• Table number prominently displayed</p>
                    <p>• Beautiful border and corner decorations</p>
                    <p>• High-resolution QR code</p>
                    <p>• "Scan to Order" instruction</p>
                    <p>• Professional digital menu design</p>
                    <p>• Premium gradients and shadows</p>
                    <p>• Multiple color themes available</p>
                    <p>• Enhanced typography and spacing</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDownloadModal(false);
                    setDownloadTarget(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-sangeet-neutral-300 bg-sangeet-neutral-800 hover:bg-sangeet-neutral-700 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDownloadQR(downloadTarget, downloadOptions.format, downloadOptions.design, downloadOptions.theme);
                    setShowDownloadModal(false);
                    setDownloadTarget(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-md transition-colors"
                >
                  Download Beautiful QR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border border-sangeet-neutral-700 w-96 shadow-xl rounded-xl bg-sangeet-neutral-900">
            <div className="mt-3">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-400/20 rounded-full flex items-center justify-center">
                    <Trash2 className="h-6 w-6 text-red-400" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-sangeet-neutral-100">
                    Delete QR Code
                  </h3>
                  <p className="text-sm text-sangeet-neutral-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-sangeet-neutral-300 mb-2">
                  Are you sure you want to delete this table QR code?
                </p>
                <div className="bg-sangeet-neutral-800 rounded-lg p-3 border border-sangeet-neutral-700">
                  <p className="text-sm font-medium text-sangeet-neutral-100">
                    Table {deleteTarget.qrCode.table_number}
                  </p>
                  <p className="text-xs text-sangeet-neutral-500 mt-1">
                    {deleteTarget.qrCode.qr_code_url}
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteTarget(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-sangeet-neutral-300 bg-sangeet-neutral-800 hover:bg-sangeet-neutral-700 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
                >
                  Delete QR Code
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRManagementPage; 