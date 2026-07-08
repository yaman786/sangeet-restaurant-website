import api, { apiCallWrapper, API_CONFIG } from './client';
import { QRCodeRow } from '../../types';
import toast from 'react-hot-toast';

export const getAllQRCodes = async (): Promise<QRCodeRow[]> => {
  return apiCallWrapper(async () => {
    return await api.get('/qr-codes');
  }, 'getAllQRCodes');
};

export const generateTableQRCode = async (qrData: any) => {
  return apiCallWrapper(async () => {
    return await api.post('/qr-codes/generate/table', qrData);
  }, 'generateTableQRCode', false);
};

export const bulkGenerateTableQRCodes = async (qrData: any) => {
  return apiCallWrapper(async () => {
    return await api.post('/qr-codes/generate/bulk', qrData);
  }, 'bulkGenerateTableQRCodes', false);
};

export const getQRCodeAnalytics = async (qrCodeId: string | number) => {
  return apiCallWrapper(async () => {
    return await api.get(`/qr-codes/analytics/${encodeURIComponent(qrCodeId)}`);
  }, 'getQRCodeAnalytics');
};

export const updateQRCodeDesign = async (qrCodeId: string | number, design: any) => {
  return apiCallWrapper(async () => {
    return await api.put(`/qr-codes/${encodeURIComponent(qrCodeId)}/design`, design);
  }, 'updateQRCodeDesign', false);
};

export const deleteQRCode = async (qrCodeId: string | number) => {
  return apiCallWrapper(async () => {
    return await api.delete(`/qr-codes/${encodeURIComponent(qrCodeId)}`);
  }, 'deleteQRCode', false);
};

export const downloadPrintableQRCode = async (qrCodeId: string | number, format = 'png', design = 'classic', theme = 'modern') => {
  try {
    const timestamp = Date.now();

    const token = getAuthToken();

    const response = await fetch(`${API_CONFIG.BASE_URL}/qr-codes/print/${qrCodeId}/${format}?design=${design}&theme=${theme}&t=${timestamp}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response error:', response.status, errorText);
      throw new Error(`Failed to download QR code: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');

    if (!contentType || !contentType.startsWith('image/')) {
      console.error('Invalid content type:', contentType);
      throw new Error('Server did not return an image');
    }

    const blob = await response.blob();

    if (blob.size === 0) {
      throw new Error('Downloaded file is empty');
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sangeet-table-${qrCodeId}-qr.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast.success('Beautiful QR code downloaded successfully!');
  } catch (error) {
    console.error('Error downloading QR code:', error);
    toast.error(`Failed to download QR code: ${(error as Error).message}`);
  }
};
