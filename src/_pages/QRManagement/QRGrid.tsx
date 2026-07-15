"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { 
  QrCode, 
  Download, 
  Trash2, 
  BarChart3, 
  Smartphone,
  ArrowUpDown,
  ArrowDown,
  Edit2,
  ArchiveRestore
} from 'lucide-react';

const QRGrid = ({
  sortedAndFilteredQRCodes,
  qrCodes,
  searchTerm,
  filterStatus,
  handleSort,
  getSortIcon,
  handleViewAnalytics,
  setDownloadTarget,
  setShowDownloadModal,
  handleDeleteQR,
  setSearchTerm,
  setFilterStatus,
  setFormData,
  setShowGenerateModal,
  handleRestoreQR
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

  return (
    <>
      <div className="flex items-center space-x-2 mb-4">
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

      <div className="flex items-center justify-between text-sm text-sangeet-neutral-400 mb-4">
        <span>
          Showing {sortedAndFilteredQRCodes.length} of {qrCodes.tableQRCodes?.length || 0} QR codes
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
          {sortedAndFilteredQRCodes.map((qrCode: any) => (
            <motion.div
              key={qrCode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-sangeet-neutral-900 rounded-xl shadow-lg border border-sangeet-neutral-700 overflow-hidden transition-all duration-300 ${!qrCode.is_active ? 'opacity-60 grayscale' : 'hover:border-sangeet-400/50'}`}
            >
              <div className="flex flex-col h-full group relative">
                {/* QR Code Poster Area - Perfect 3:4 Aspect Ratio */}
                <div className="relative w-full overflow-hidden aspect-[3/4] bg-sangeet-neutral-950 flex items-center justify-center">
                  <img
                    src={qrCode.qr_code_data}
                    alt={`QR Code for Table ${qrCode.table_number}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Subtle gradient overlay to blend with the bottom bar */}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-sangeet-neutral-900 to-transparent opacity-80"></div>
                  
                  {!qrCode.is_active ? (
                    <div className="absolute top-3 left-3 px-3 py-1.5 text-xs font-bold bg-sangeet-neutral-800/90 backdrop-blur-sm text-sangeet-neutral-300 rounded-full shadow-lg border border-sangeet-neutral-600/50">
                      Archived
                    </div>
                  ) : (qrCode.active_orders || 0) > 0 && (
                    <div className="absolute top-3 right-3 px-3 py-1.5 text-xs font-bold bg-orange-500/90 backdrop-blur-sm text-white rounded-full shadow-lg border border-orange-400/50">
                      {qrCode.active_orders} active
                    </div>
                  )}
                </div>

                {/* Details & Actions Area */}
                <div className="p-5 flex flex-col justify-between flex-grow bg-sangeet-neutral-900 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-sangeet-neutral-950 rounded-xl shadow-inner border border-sangeet-neutral-800">
                        <Smartphone className="h-5 w-5 text-sangeet-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-sangeet-neutral-50 tracking-wide">
                          Table {qrCode.table_number}
                        </h3>
                        <p className="text-[10px] text-sangeet-neutral-500 truncate max-w-[100px] sm:max-w-[120px] uppercase tracking-wider mt-0.5">
                          {qrCode.qr_code_url ? qrCode.qr_code_url.replace(/^https?:\/\//, '') : 'No URL'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1 bg-sangeet-neutral-950 p-1.5 rounded-xl border border-sangeet-neutral-800 shadow-inner">
                      {!qrCode.is_active ? (
                        <button
                          onClick={() => handleRestoreQR(qrCode.id)}
                          className="flex items-center px-4 py-2 text-sangeet-400 hover:text-sangeet-300 hover:bg-sangeet-neutral-800 rounded-lg transition-all text-sm font-medium"
                          title="Restore QR Code"
                        >
                          <ArchiveRestore className="h-4 w-4 mr-2" />
                          Restore
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setFormData({
                                tableNumber: qrCode.table_number,
                                capacity: qrCode.capacity || 4,
                                customUrl: qrCode.qr_code_url || ''
                              });
                              setShowGenerateModal(true);
                            }}
                            className="p-2 text-sangeet-neutral-400 hover:text-sangeet-400 hover:bg-sangeet-neutral-800 rounded-lg transition-all"
                            title="Edit Configuration"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDownloadTarget(qrCode);
                              setShowDownloadModal(true);
                            }}
                            className="p-2 text-sangeet-neutral-400 hover:text-green-400 hover:bg-sangeet-neutral-800 rounded-lg transition-all"
                            title="Download Poster"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteQR(qrCode)}
                            className={`p-2 rounded-lg transition-all ${
                              (qrCode.active_orders || 0) > 0 
                                ? 'text-red-400/30 cursor-not-allowed' 
                                : 'text-sangeet-neutral-400 hover:text-red-400 hover:bg-sangeet-neutral-800'
                            }`}
                            title={(qrCode.active_orders || 0) > 0 
                              ? `Cannot delete: ${qrCode.active_orders} active orders` 
                              : 'Delete'
                            }
                            disabled={(qrCode.active_orders || 0) > 0}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
};

export default QRGrid;
