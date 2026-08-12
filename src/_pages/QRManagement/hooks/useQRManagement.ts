import { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  getAllQRCodes,
  generateTableQRCode,
  bulkGenerateTableQRCodes,
  getQRCodeAnalytics,
  deleteQRCode,
  downloadPrintableQRCode,
  restoreQRCode,
  createTable,
  deleteTable
} from '../../../services/api';

export const useQRManagement = () => {
  const [qrCodes, setQrCodes] = useState<any>({ tableQRCodes: [] });
  const [loading, setLoading] = useState(true);

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedQRCode, setSelectedQRCode] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadTarget, setDownloadTarget] = useState<any>(null);
  
  // Add Table modal state
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [addTableFormData, setAddTableFormData] = useState({
    table_number: '',
    capacity: 4,
    table_type: 'standard'
  });

  const [downloadOptions, setDownloadOptions] = useState({
    format: 'png',
    design: 'classic',
    theme: 'modern'
  });
  
  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: 4,
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
    capacity: 4,
    baseUrl: 'https://sangeet.hk',
    design: {
      darkColor: '#1d1b16',
      lightColor: '#ffffff',
      width: 300,
      margin: 2
    }
  });

  const [sortConfig, setSortConfig] = useState({
    key: 'table_number',
    direction: 'asc'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('active');

  const loadQRCodes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllQRCodes();
      setQrCodes(response);
    } catch (error: any) {
      console.error('Error loading QR codes:', error);
      toast.error('Failed to load QR codes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadQRCodes();
    });
  }, [loadQRCodes]);

  const sortedAndFilteredQRCodes = useMemo(() => {
    let filtered = qrCodes.tableQRCodes || [];

    if (searchTerm) {
      filtered = filtered.filter((qrCode: any) => {
        return qrCode.table_number.toString().includes(searchTerm);
      });
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((qrCode: any) => {
        switch (filterStatus) {
          case 'active':
            return qrCode.is_active === true;
          case 'inactive':
            return qrCode.is_active === false;
          case 'with_orders':
            return (qrCode.active_orders || 0) > 0;
          case 'without_orders':
            return (qrCode.active_orders || 0) === 0;
          case 'with_qr':
            return !!qrCode.qr_code_data;
          case 'without_qr':
            return !qrCode.qr_code_data;
          default:
            return true;
        }
      });
    }

    filtered.sort((a: any, b: any) => {
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

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [qrCodes, searchTerm, filterStatus, sortConfig]);

  const handleSort = (key: any) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
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
        tableNumber: '', capacity: 4, customUrl: '', purpose: '', targetUrl: '', title: '', description: '', expiresAt: '',
        design: { darkColor: '#1d1b16', lightColor: '#ffffff', width: 300, margin: 2 }
      });
      loadQRCodes();
    } catch (error: any) {
      console.error('Error generating QR code:', error);
      toast.error(error.response?.data?.error || 'Failed to generate QR code');
    }
  };

  const handleBulkGenerate = async () => {
    try {
      const tableNumbers = bulkFormData.tableNumbers.split(',').map(num => num.trim()).filter(num => num);
      if (tableNumbers.length === 0) {
        toast.error('Please enter table numbers');
        return;
      }
      const response = await bulkGenerateTableQRCodes({
        tableNumbers, baseUrl: bulkFormData.baseUrl, design: bulkFormData.design
      });
      if ((response as any).summary.successful > 0) {
        toast.success(`Generated ${(response as any).summary.successful} QR codes successfully!`);
      }
      if ((response as any).errors && (response as any).errors.length > 0) {
        toast.error(`${(response as any).errors.length} QR codes failed to generate`);
      }
      setShowBulkModal(false);
      setBulkFormData({
        tableNumbers: '', capacity: 4, baseUrl: process.env.NEXT_PUBLIC_CLIENT_URL || 'https://sangeet.hk',
        design: { darkColor: '#1d1b16', lightColor: '#ffffff', width: 300, margin: 2 }
      });
      loadQRCodes();
    } catch (error: any) {
      console.error('Error bulk generating QR codes:', error);
      toast.error('Failed to bulk generate QR codes');
    }
  };

  const handleViewAnalytics = async (qrCode: any) => {
    try {
      setSelectedQRCode((prev: any) => ({ ...prev, qrCode }));
      const analyticsData = await getQRCodeAnalytics(qrCode.id);
      setAnalytics(analyticsData);
      setShowAnalyticsModal(true);
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    }
  };

  const handleDeleteQR = async (qrCode: any, permanent = false) => {
    setDeleteTarget({ qrCode, permanent });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.permanent) {
        await deleteTable(deleteTarget.qrCode.id, true);
        toast.success(`Table ${deleteTarget.qrCode.table_number} permanently deleted!`);
      } else {
        await deleteTable(deleteTarget.qrCode.id, false);
        toast.success(`Table ${deleteTarget.qrCode.table_number} archived successfully!`);
      }
      loadQRCodes();
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (error: any) {
      console.error('Error deleting table:', error);
      const errorMessage = error.message || error.response?.data?.error || 'Failed to delete table';
      toast.error(errorMessage);
    }
  };

  const handleDownloadQR = async (qrCode: any, format = 'png', design = 'classic', theme = 'modern') => {
    try {
      await downloadPrintableQRCode(qrCode.id, format, design, theme);
    } catch (error: any) {
      console.error('❌ Error downloading QR code:', error);
      toast.error(`Failed to download QR code: ${error.message}`);
    }
  };

  const handleRestoreQR = async (qrCodeId: string | number) => {
    try {
      await restoreQRCode(qrCodeId);
      toast.success('QR code restored successfully!');
      loadQRCodes();
    } catch (error: any) {
      console.error('Error restoring QR code:', error);
      toast.error('Failed to restore QR code');
    }
  };

  const handleCreateTable = async () => {
    try {
      if (!addTableFormData.table_number) {
        toast.error('Table number is required');
        return;
      }
      const res: any = await createTable(addTableFormData);
      if (res?.message) {
        toast.success(res.message);
      } else {
        toast.success(`Table ${addTableFormData.table_number} created successfully!`);
      }
      setShowAddTableModal(false);
      setAddTableFormData({ table_number: '', capacity: 4, table_type: 'standard' });
      loadQRCodes();
    } catch (error: any) {
      console.error('Error creating table:', error);
      toast.error(error.message || 'Failed to create table');
    }
  };

  return {
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
    showAddTableModal, setShowAddTableModal,
    addTableFormData, setAddTableFormData,
    handleSort,
    handleGenerateQR,
    handleBulkGenerate,
    handleViewAnalytics,
    handleDeleteQR,
    confirmDelete,
    handleDownloadQR,
    handleRestoreQR,
    handleCreateTable
  };
};
