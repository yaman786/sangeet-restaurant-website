import React from 'react';
import { Download, Trash2, BarChart3 } from 'lucide-react';
import CustomDropdown from '../../components/CustomDropdown';

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
  handleDownloadQR
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
    { value: 'jpeg', label: 'JPEG (Smaller Size)' }
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
                    className="w-full px-3 py-2 border border-sangeet-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sangeet-400 bg-sangeet-neutral-800 text-sangeet-neutral-100 placeholder-sangeet-neutral-500"
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
                    className="w-full px-3 py-2 border border-sangeet-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sangeet-400 bg-sangeet-neutral-800 text-sangeet-neutral-100 placeholder-sangeet-neutral-500"
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
                    className="w-full px-3 py-2 border border-sangeet-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sangeet-400 bg-sangeet-neutral-800 text-sangeet-neutral-100 placeholder-sangeet-neutral-500"
                    placeholder="https://your-restaurant.com/qr/table-1"
                  />
                  <p className="text-xs text-sangeet-neutral-500 mt-1">
                    Leave empty to use default: https://sangeetrestauranthk.netlify.app/qr/table-[number]
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
                    className="w-full px-3 py-2 border border-sangeet-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sangeet-400 bg-sangeet-neutral-800 text-sangeet-neutral-100 placeholder-sangeet-neutral-500"
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
                    className="w-full px-3 py-2 border border-sangeet-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sangeet-400 bg-sangeet-neutral-800 text-sangeet-neutral-100 placeholder-sangeet-neutral-500"
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
                    onChange={(design: any) => setDownloadOptions({...downloadOptions, design})}
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
                    onChange={(theme: any) => setDownloadOptions({...downloadOptions, theme})}
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
                    onChange={(format: any) => setDownloadOptions({...downloadOptions, format})}
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
    </>
  );
};

export default QRModals;
