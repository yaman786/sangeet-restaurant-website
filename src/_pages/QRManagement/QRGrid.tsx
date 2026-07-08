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
  ArrowUp,
  ArrowDown
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
  setFilterStatus
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

                <div className="bg-sangeet-neutral-800 rounded-lg p-4 mb-4 flex justify-center">
                  <img
                    src={qrCode.qr_code_data}
                    alt={`QR Code for Table ${qrCode.table_number}`}
                    className="w-32 h-32"
                  />
                </div>

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
          ))}
        </div>
      )}
    </>
  );
};

export default QRGrid;
