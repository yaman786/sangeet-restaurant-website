import React from 'react';
import { RefreshCw } from 'lucide-react';
import AdminHeader from '../../components/AdminHeader';
import QRFilters from './QRFilters';
import QRGrid from './QRGrid';
import QRModals from './QRModals';
import { useQRManagement } from './hooks/useQRManagement';

const QRManagement = () => {
  const {
    qrCodes,
    loading,
    sortedAndFilteredQRCodes,
    showGenerateModal, setShowGenerateModal,
    showBulkModal, setShowBulkModal,
    showAnalyticsModal, setShowAnalyticsModal,
    selectedQRCode, setSelectedQRCode,
    analytics, setAnalytics,
    showDeleteModal, setShowDeleteModal,
    deleteTarget, setDeleteTarget,
    showDownloadModal, setShowDownloadModal,
    downloadTarget, setDownloadTarget,
    downloadOptions, setDownloadOptions,
    formData, setFormData,
    bulkFormData, setBulkFormData,
    sortConfig, setSortConfig,
    searchTerm, setSearchTerm,
    filterStatus, setFilterStatus,
    handleSort,
    handleGenerateQR,
    handleBulkGenerate,
    handleViewAnalytics,
    handleDeleteQR,
    confirmDelete,
    handleDownloadQR
  } = useQRManagement();

  const getSortIcon = (key: any) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
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
      <AdminHeader title="QR Management" subtitle="Manage QR codes" onBackClick={() => {}} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <QRFilters 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          setShowBulkModal={setShowBulkModal}
          setShowGenerateModal={setShowGenerateModal}
        />

        <QRGrid 
          sortedAndFilteredQRCodes={sortedAndFilteredQRCodes}
          qrCodes={qrCodes}
          searchTerm={searchTerm}
          filterStatus={filterStatus}
          handleSort={handleSort}
          getSortIcon={getSortIcon}
          handleViewAnalytics={handleViewAnalytics}
          setDownloadTarget={setDownloadTarget}
          setShowDownloadModal={setShowDownloadModal}
          handleDeleteQR={handleDeleteQR}
          setSearchTerm={setSearchTerm}
          setFilterStatus={setFilterStatus}
        />
      </div>

      <QRModals 
        showGenerateModal={showGenerateModal} setShowGenerateModal={setShowGenerateModal}
        showBulkModal={showBulkModal} setShowBulkModal={setShowBulkModal}
        showAnalyticsModal={showAnalyticsModal} setShowAnalyticsModal={setShowAnalyticsModal}
        selectedQRCode={selectedQRCode}
        analytics={analytics}
        showDeleteModal={showDeleteModal} setShowDeleteModal={setShowDeleteModal}
        deleteTarget={deleteTarget} setDeleteTarget={setDeleteTarget}
        showDownloadModal={showDownloadModal} setShowDownloadModal={setShowDownloadModal}
        downloadTarget={downloadTarget} setDownloadTarget={setDownloadTarget}
        downloadOptions={downloadOptions} setDownloadOptions={setDownloadOptions}
        formData={formData} setFormData={setFormData}
        bulkFormData={bulkFormData} setBulkFormData={setBulkFormData}
        handleGenerateQR={handleGenerateQR}
        handleBulkGenerate={handleBulkGenerate}
        confirmDelete={confirmDelete}
        handleDownloadQR={handleDownloadQR}
      />
    </div>
  );
};

export default QRManagement;
