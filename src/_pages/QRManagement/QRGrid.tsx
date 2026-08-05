"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  QrCode, 
  Download, 
  Trash2, 
  Smartphone,
  Edit2,
  ArchiveRestore,
  Users,
  Armchair
} from 'lucide-react';

const TABLE_TYPE_LABELS: Record<string, string> = {
  standard: 'Standard',
  booth: 'Booth',
  outdoor: 'Outdoor',
  private: 'Private Room',
  bar: 'Bar Seating',
  vip: 'VIP',
};

const TABLE_TYPE_COLORS: Record<string, string> = {
  standard: 'bg-sangeet-neutral-700 text-sangeet-neutral-200',
  booth: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
  outdoor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  private: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  bar: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  vip: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
};

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
          Showing {sortedAndFilteredQRCodes.length} of {qrCodes.tableQRCodes?.length || 0} tables
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
          <Armchair className="h-16 w-16 text-sangeet-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-sangeet-neutral-400 mb-2">
            No tables found
          </h3>
          <p className="text-sangeet-neutral-500">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Click "Add Table" to create your first table'
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
                {/* QR Code / Empty State Area */}
                <div className="relative w-full overflow-hidden aspect-[3/4] bg-sangeet-neutral-950 flex flex-col items-center justify-center">
                  {qrCode.qr_code_data ? (
                    <Image
                      src={qrCode.qr_code_data}
                      alt={`QR Code for Table ${qrCode.table_number}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full w-full">
                      <div className="p-6 bg-sangeet-neutral-800/50 rounded-2xl border border-dashed border-sangeet-neutral-600 mb-4">
                        <QrCode className="h-16 w-16 text-sangeet-neutral-500" />
                      </div>
                      <p className="text-sangeet-neutral-400 text-sm mb-4">No QR code generated</p>
                      {qrCode.is_active && (
                        <button
                          onClick={() => {
                            setFormData({
                              tableNumber: qrCode.table_number,
                              capacity: qrCode.capacity || 4,
                              customUrl: ''
                            });
                            setShowGenerateModal(true);
                          }}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-sangeet-neutral-950 bg-sangeet-400 hover:bg-sangeet-500 rounded-lg transition-colors"
                        >
                          <QrCode className="h-4 w-4 mr-2" />
                          Generate QR Code
                        </button>
                      )}
                    </div>
                  )}
                  
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-sangeet-neutral-900 to-transparent opacity-80"></div>
                  
                  {/* Status badges */}
                  {!qrCode.is_active ? (
                    <div className="absolute top-3 left-3 px-3 py-1.5 text-xs font-bold bg-sangeet-neutral-800/90 backdrop-blur-xs text-sangeet-neutral-300 rounded-full shadow-lg border border-sangeet-neutral-600/50">
                      Archived
                    </div>
                  ) : (qrCode.active_orders || 0) > 0 && (
                    <div className="absolute top-3 right-3 px-3 py-1.5 text-xs font-bold bg-orange-500/90 backdrop-blur-xs text-white rounded-full shadow-lg border border-orange-400/50">
                      {qrCode.active_orders} active
                    </div>
                  )}
                </div>

                {/* Details & Actions Area */}
                <div className="p-5 flex flex-col justify-between grow bg-sangeet-neutral-900 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-sangeet-neutral-950 rounded-xl shadow-inner border border-sangeet-neutral-800">
                        <Smartphone className="h-5 w-5 text-sangeet-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-sangeet-neutral-50 tracking-wide">
                          Table {qrCode.table_number}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="inline-flex items-center text-xs text-sangeet-neutral-400">
                            <Users className="h-3 w-3 mr-1" />
                            {qrCode.capacity || 4} seats
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full ${TABLE_TYPE_COLORS[qrCode.table_type || 'standard'] || TABLE_TYPE_COLORS.standard}`}>
                            {TABLE_TYPE_LABELS[qrCode.table_type || 'standard'] || qrCode.table_type || 'Standard'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1 bg-sangeet-neutral-950 p-1.5 rounded-xl border border-sangeet-neutral-800 shadow-inner">
                      {!qrCode.is_active ? (
                        <>
                          <button
                            onClick={() => handleRestoreQR(qrCode.id)}
                            className="flex items-center px-3 py-1.5 text-sangeet-400 hover:text-sangeet-300 hover:bg-sangeet-neutral-800 rounded-lg transition-all text-xs font-medium"
                            title="Restore Table"
                          >
                            <ArchiveRestore className="h-4 w-4 mr-1.5" />
                            Restore
                          </button>
                          <button
                            onClick={() => handleDeleteQR(qrCode, true)}
                            className="p-1.5 text-sangeet-neutral-400 hover:text-red-400 hover:bg-sangeet-neutral-800 rounded-lg transition-all"
                            title="Permanently Delete Table"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
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
                            title={qrCode.qr_code_data ? 'Regenerate QR Code' : 'Generate QR Code'}
                          >
                            {qrCode.qr_code_data ? <Edit2 className="h-4 w-4" /> : <QrCode className="h-4 w-4" />}
                          </button>
                          {qrCode.qr_code_data && (
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
                          )}
                          <button
                            onClick={() => handleDeleteQR(qrCode)}
                            className={`p-2 rounded-lg transition-all ${
                              (qrCode.active_orders || 0) > 0 
                                ? 'text-red-400/30 cursor-not-allowed' 
                                : 'text-sangeet-neutral-400 hover:text-red-400 hover:bg-sangeet-neutral-800'
                            }`}
                            title={(qrCode.active_orders || 0) > 0 
                              ? `Cannot archive: ${qrCode.active_orders} active orders` 
                              : 'Archive Table'
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
