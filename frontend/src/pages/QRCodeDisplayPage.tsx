import React, { useState, useEffect } from 'react';
import { fetchTables } from '../services/api';
import { Printer } from 'lucide-react';
import { motion } from 'framer-motion';

const QRCodeDisplayPage = () => {
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      const response = await fetchTables();
      setQrCodes(response);
    } catch (error) {
      console.error('Error loading tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (tableNumber: any) => {
    const qrUrl = `https://sangeetrestauranthk.netlify.app/qr/table-${tableNumber}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sangeet-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-sangeet-400">Loading QR codes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sangeet-neutral-950">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-sangeet-400 mb-8">QR Codes for Tables</h1>
        <p className="text-sangeet-neutral-400 mb-8">
          Print these QR codes and place them on each table for customers to scan and order.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {qrCodes.map((table: any) => (
            <motion.div
              key={table.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-sangeet-neutral-900 rounded-lg p-6 text-center"
            >
              <h2 className="text-xl font-bold text-sangeet-400 mb-4">Table {table.table_number}</h2>
              <div className="bg-white p-4 rounded-lg inline-block mb-4 relative group">
                <img 
                  src={table.qr_code_url ? table.qr_code_url : handlePrint(table.table_number)} 
                  alt={`QR Code for Table ${table.table_number}`}
                  className="w-48 h-48"
                />
                <button
                  onClick={() => handlePrint(table.table_number)}
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg text-white font-medium gap-2"
                >
                  <Printer className="w-5 h-5" />
                  Print QR Code
                </button>
              </div>
              <p className="text-sangeet-neutral-400 text-sm">
                Scan to view menu and order for Table {table.table_number}
              </p>
              {table.qr_code_url && (
                <p className="text-xs text-sangeet-400 mt-2">
                  <a href={table.qr_code_url} target="_blank" rel="noopener noreferrer">Download QR Code</a>
                </p>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-12 bg-sangeet-neutral-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-sangeet-400 mb-4">Instructions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sangeet-400 font-semibold mb-2">For Customers:</h3>
              <ul className="text-sangeet-neutral-400 text-sm space-y-1">
                <li>• Scan QR code with phone camera</li>
                <li>• Browse menu and add items to cart</li>
                <li>• Enter name and special instructions</li>
                <li>• Place order and get order number</li>
                <li>• Track order status in real-time</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sangeet-400 font-semibold mb-2">For Staff:</h3>
              <ul className="text-sangeet-neutral-400 text-sm space-y-1">
                <li>• Monitor orders at /admin/orders</li>
                <li>• Update order status as needed</li>
                <li>• View order statistics and revenue</li>
                <li>• Filter orders by status or table</li>
                <li>• Track kitchen workflow</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeDisplayPage; 