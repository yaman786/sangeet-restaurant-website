"use client";
import React from 'react';
import { 
  Download, 
  Trash2, 
  BarChart3, 
  TableProperties, 
  ShieldAlert, 
  AlertTriangle, 
  ArrowRight, 
  Users, 
  Calendar, 
  Clock, 
  Loader2, 
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

const TABLE_TYPE_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'booth', label: 'Booth' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'private', label: 'Private Room' },
  { value: 'bar', label: 'Bar Seating' },
  { value: 'vip', label: 'VIP' },
];

const QRModals = ({
  showGenerateModal,
  setShowGenerateModal,
  showBulkModal,
  setShowBulkModal,
  showAnalyticsModal,
  setShowAnalyticsModal,
  selectedQRCode,
  analytics,
  showDeleteModal,
  setShowDeleteModal,
  deleteTarget,
  setDeleteTarget,
  activeReservationsForDelete = [],
  checkingActiveReservations = false,
  transferToTableId = '',
  setTransferToTableId,
  allTables = [],
  showDownloadModal,
  setShowDownloadModal,
  downloadTarget,
  setDownloadTarget,
  downloadOptions,
  setDownloadOptions,
  formData,
  setFormData,
  bulkFormData,
  setBulkFormData,
  handleGenerateQR,
  handleBulkGenerate,
  confirmDelete,
  handleDownloadQR,
  showAddTableModal,
  setShowAddTableModal,
  addTableFormData,
  setAddTableFormData,
  handleCreateTable
}: any) => {

  const formatCurrency = (amount: any) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString: any) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: any) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/20 border border-green-400/30';
      case 'expired':
        return 'text-red-400 bg-red-400/20 border border-red-400/30';
      default:
        return 'text-sangeet-neutral-400 bg-sangeet-neutral-800 border border-sangeet-neutral-700';
    }
  };

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
    { value: 'jpeg', label: 'JPEG (Smaller Size)' },
    { value: 'svg', label: 'SVG (Infinite Vector Quality)' }
  ];

  return (
    <>
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
                    className="w-full px-3 py-2 border border-sangeet-neutral-600 rounded-md focus:outline-hidden focus:ring-2 focus:ring-sangeet-400 bg-sangeet-neutral-800 text-sangeet-neutral-100 placeholder-sangeet-neutral-500"
                    placeholder="e.g., 1, 2, 3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">
                    Table Capacity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 4})}
                    className="w-full px-3 py-2 border border-sangeet-neutral-600 rounded-md focus:outline-hidden focus:ring-2 focus:ring-sangeet-400 bg-sangeet-neutral-800 text-sangeet-neutral-100 placeholder-sangeet-neutral-500"
                    placeholder="e.g., 4"
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
                    className="w-full px-3 py-2 border border-sangeet-neutral-600 rounded-md focus:outline-hidden focus:ring-2 focus:ring-sangeet-400 bg-sangeet-neutral-800 text-sangeet-neutral-100 placeholder-sangeet-neutral-500"
                    placeholder="https://your-restaurant.com/qr/table-1"
                  />
                  <p className="text-xs text-sangeet-neutral-500 mt-1">
                    Leave empty to use default: https://sangeet.hk/qr/table-[number]
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
                  onClick={handleGenerateQR}
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
                    className="w-full px-3 py-2 border border-sangeet-neutral-600 rounded-md focus:outline-hidden focus:ring-2 focus:ring-sangeet-400 bg-sangeet-neutral-800 text-sangeet-neutral-100 placeholder-sangeet-neutral-500"
                    placeholder="e.g., 1,2,3,4,5 or 1-10"
                  />
                  <p className="text-xs text-sangeet-neutral-500 mt-1">
                    Enter table numbers separated by commas
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">
                    Default Capacity (for all) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={bulkFormData.capacity}
                    onChange={(e) => setBulkFormData({...bulkFormData, capacity: parseInt(e.target.value) || 4})}
                    className="w-full px-3 py-2 border border-sangeet-neutral-600 rounded-md focus:outline-hidden focus:ring-2 focus:ring-sangeet-400 bg-sangeet-neutral-800 text-sangeet-neutral-100 placeholder-sangeet-neutral-500"
                    placeholder="e.g., 4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">
                    Base URL
                  </label>
                  <input
                    type="url"
                    value={bulkFormData.baseUrl}
                    onChange={(e) => setBulkFormData({...bulkFormData, baseUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-sangeet-neutral-600 rounded-md focus:outline-hidden focus:ring-2 focus:ring-sangeet-400 bg-sangeet-neutral-800 text-sangeet-neutral-100 placeholder-sangeet-neutral-500"
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
          <div className="relative top-32 mx-auto p-6 border border-sangeet-neutral-700 w-96 shadow-2xl rounded-2xl bg-sangeet-neutral-900">
            <div className="mt-2 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-sangeet-400/20 mb-4">
                <Download className="h-8 w-8 text-sangeet-400" />
              </div>
              <h3 className="text-xl font-bold text-sangeet-neutral-100 mb-2">
                Download QR Code
              </h3>
              <p className="text-sm text-sangeet-neutral-400 mb-6">
                Table {downloadTarget.table_number}
              </p>
              
              <div className="bg-sangeet-neutral-800 rounded-xl p-4 border border-sangeet-neutral-700 mb-8">
                <p className="text-sm text-sangeet-neutral-300">
                  Your QR code will be exported as a high-resolution, print-ready image featuring the Sangeet premium branding and elegant gold accents.
                </p>
              </div>

              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => {
                    setShowDownloadModal(false);
                    setDownloadTarget(null);
                  }}
                  className="w-full px-4 py-3 text-sm font-bold text-sangeet-neutral-300 bg-sangeet-neutral-800 hover:bg-sangeet-neutral-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Hardcoded to Premium design, Gold theme, PNG format for maximum print quality
                    handleDownloadQR(downloadTarget, 'png', 'premium', 'gold');
                    setShowDownloadModal(false);
                    setDownloadTarget(null);
                  }}
                  className="w-full px-4 py-3 text-sm font-bold text-sangeet-neutral-950 bg-sangeet-400 hover:bg-sangeet-500 rounded-xl transition-colors shadow-lg"
                >
                  Download PNG
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {showAddTableModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border border-sangeet-neutral-700 w-96 shadow-xl rounded-xl bg-sangeet-neutral-900">
            <div className="mt-3">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-sangeet-400/20 rounded-full flex items-center justify-center">
                  <TableProperties className="h-6 w-6 text-sangeet-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-sangeet-neutral-100">
                    Add New Table
                  </h3>
                  <p className="text-sm text-sangeet-neutral-400">
                    Create a physical table for your restaurant
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">
                    Table Number *
                  </label>
                  <input
                    type="text"
                    value={addTableFormData.table_number}
                    onChange={(e) => setAddTableFormData({...addTableFormData, table_number: e.target.value})}
                    className="w-full px-3 py-2 border border-sangeet-neutral-600 rounded-md focus:outline-hidden focus:ring-2 focus:ring-sangeet-400 bg-sangeet-neutral-800 text-sangeet-neutral-100 placeholder-sangeet-neutral-500"
                    placeholder="e.g., 11, 12, VIP-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">
                    Seating Capacity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={addTableFormData.capacity}
                    onChange={(e) => setAddTableFormData({...addTableFormData, capacity: parseInt(e.target.value) || 4})}
                    className="w-full px-3 py-2 border border-sangeet-neutral-600 rounded-md focus:outline-hidden focus:ring-2 focus:ring-sangeet-400 bg-sangeet-neutral-800 text-sangeet-neutral-100 placeholder-sangeet-neutral-500"
                    placeholder="e.g., 4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1">
                    Table Type
                  </label>
                  <select
                    value={addTableFormData.table_type}
                    onChange={(e) => setAddTableFormData({...addTableFormData, table_type: e.target.value})}
                    className="w-full px-3 py-2 border border-sangeet-neutral-600 rounded-md focus:outline-hidden focus:ring-2 focus:ring-sangeet-400 bg-sangeet-neutral-800 text-sangeet-neutral-100"
                  >
                    {TABLE_TYPE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-sangeet-neutral-800 rounded-lg p-3 border border-sangeet-neutral-700 mt-4">
                <p className="text-xs text-sangeet-neutral-400">
                  💡 You can generate a QR code for this table later from the table card.
                </p>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddTableModal(false)}
                  className="px-4 py-2 text-sm font-medium text-sangeet-neutral-300 bg-sangeet-neutral-800 hover:bg-sangeet-neutral-700 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTable}
                  className="px-4 py-2 text-sm font-medium text-sangeet-neutral-950 bg-sangeet-400 hover:bg-sangeet-500 rounded-md transition-colors"
                >
                  Create Table
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation & Safety Interlock Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative mx-auto p-6 border border-sangeet-neutral-700 w-full max-w-xl shadow-2xl rounded-2xl bg-sangeet-neutral-900 text-sangeet-neutral-100 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Loading State */}
            {checkingActiveReservations ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
                <div>
                  <h3 className="text-lg font-semibold text-sangeet-neutral-200">Checking Active Bookings...</h3>
                  <p className="text-sm text-sangeet-neutral-400 mt-1">Verifying safety guardrails for Table {deleteTarget.qrCode.table_number}</p>
                </div>
              </div>
            ) : activeReservationsForDelete.length > 0 ? (
              /* SAFETY CONFLICT INTERLOCK ACTIVE */
              <div>
                {/* Header Badge */}
                <div className="flex items-start space-x-4 mb-5">
                  <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400 flex-shrink-0">
                    <ShieldAlert className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-1.5 uppercase tracking-wider">
                      <AlertTriangle className="w-3 h-3" />
                      Safety Interlock Active
                    </div>
                    <h3 className="text-xl font-bold text-sangeet-neutral-100">
                      Cannot Delete Table {deleteTarget.qrCode.table_number} Directly
                    </h3>
                    <p className="text-sm text-sangeet-neutral-400 mt-1">
                      This table has <span className="text-amber-400 font-semibold">{activeReservationsForDelete.length} active reservation(s)</span> assigned. Deleting it now would leave guests without seating.
                    </p>
                  </div>
                </div>

                {/* List of Affected Bookings */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-sangeet-neutral-400">
                      Assigned Upcoming Guests ({activeReservationsForDelete.length})
                    </span>
                    <a 
                      href="/admin/reservations" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 transition-colors"
                    >
                      Open Reservations <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {activeReservationsForDelete.map((res: any) => {
                      const resDate = res.date ? new Date(res.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown Date';
                      const resTime = res.time ? new Date(res.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Time not set';
                      
                      return (
                        <div 
                          key={res.id}
                          className="bg-sangeet-neutral-800/80 border border-sangeet-neutral-700/70 rounded-xl p-3 flex items-center justify-between text-sm"
                        >
                          <div>
                            <div className="font-semibold text-sangeet-neutral-100 flex items-center gap-2">
                              {res.customer_name}
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                res.status === 'confirmed' 
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}>
                                {res.status}
                              </span>
                            </div>
                            <div className="text-xs text-sangeet-neutral-400 flex items-center gap-3 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-sangeet-neutral-500" /> {resDate}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-sangeet-neutral-500" /> {resTime}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3 text-sangeet-neutral-500" /> {res.guests} Guests
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bulk Transfer Resolution Section */}
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-6">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300 mb-2">
                    Step 1: Choose Replacement Table to Transfer All {activeReservationsForDelete.length} Bookings
                  </label>
                  <select
                    value={transferToTableId}
                    onChange={(e) => setTransferToTableId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                  >
                    <option value="">-- Select Destination Table --</option>
                    {allTables
                      .filter((t: any) => t.id !== deleteTarget.qrCode.id && t.is_active)
                      .map((t: any) => (
                        <option key={t.id} value={t.id}>
                          Table {t.table_number} (Capacity: {t.capacity || 4} Seats • {t.table_type || 'Standard'}{t.table_name ? ` - ${t.table_name}` : ''})
                        </option>
                      ))}
                  </select>
                  <p className="text-xs text-sangeet-neutral-400 mt-2">
                    All assigned guest reservations will be safely shifted to your chosen table before Table {deleteTarget.qrCode.table_number} is {deleteTarget.permanent ? 'permanently removed' : 'archived'}.
                  </p>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-end space-x-3 pt-2 border-t border-sangeet-neutral-800">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteTarget(null);
                      setTransferToTableId('');
                    }}
                    className="px-4 py-2.5 text-sm font-medium text-sangeet-neutral-300 bg-sangeet-neutral-800 hover:bg-sangeet-neutral-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!transferToTableId}
                    onClick={() => confirmDelete()}
                    className={`px-5 py-2.5 text-sm font-semibold rounded-lg flex items-center gap-2 transition-all ${
                      transferToTableId
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-sangeet-neutral-950 shadow-lg shadow-amber-500/20 cursor-pointer'
                        : 'bg-sangeet-neutral-800 text-sangeet-neutral-500 border border-sangeet-neutral-700 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <ArrowRight className="w-4 h-4" />
                    Transfer & {deleteTarget.permanent ? 'Permanently Delete' : 'Archive Table'}
                  </button>
                </div>
              </div>
            ) : (
              /* CLEAN DELETION (NO CONFLICTS) */
              <div>
                <div className="flex items-center mb-5">
                  <div className="w-12 h-12 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center justify-center text-red-400 flex-shrink-0">
                    <Trash2 className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-sangeet-neutral-100">
                      {deleteTarget.permanent ? 'Permanently Delete Table' : 'Archive Table'}
                    </h3>
                    <p className="text-sm text-sangeet-neutral-400">
                      {deleteTarget.permanent ? 'Remove table from database' : 'Move table to inactive archives'}
                    </p>
                  </div>
                </div>
                
                <div className="mb-6 space-y-3">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2.5 flex items-center gap-2 text-xs text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>0 active reservations assigned. Safe to proceed with removal.</span>
                  </div>

                  <p className="text-sm text-sangeet-neutral-300">
                    {deleteTarget.permanent 
                      ? 'Are you sure you want to permanently delete this table? This action cannot be undone.' 
                      : 'Are you sure you want to archive this table? You can restore it anytime from the archived tab.'}
                  </p>

                  <div className="bg-sangeet-neutral-800/80 rounded-xl p-3.5 border border-sangeet-neutral-700">
                    <p className="text-base font-semibold text-sangeet-neutral-100">
                      Table {deleteTarget.qrCode.table_number}
                    </p>
                    <p className="text-xs text-sangeet-neutral-400 mt-1">
                      Capacity: {deleteTarget.qrCode.capacity || 4} seats • Type: {deleteTarget.qrCode.table_type || 'standard'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-2 border-t border-sangeet-neutral-800">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteTarget(null);
                    }}
                    className="px-4 py-2.5 text-sm font-medium text-sangeet-neutral-300 bg-sangeet-neutral-800 hover:bg-sangeet-neutral-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => confirmDelete()}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-lg shadow-red-600/20 transition-all cursor-pointer"
                  >
                    {deleteTarget.permanent ? 'Permanently Delete' : 'Archive Table'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
};

export default QRModals;
