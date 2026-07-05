import React from 'react';
import { Search, Plus } from 'lucide-react';
import CustomDropdown from '../../components/CustomDropdown';

const filterOptions = [
  { value: 'all', label: 'All QR Codes' },
  { value: 'active', label: 'Active Only' },
  { value: 'inactive', label: 'Inactive Only' },
  { value: 'with_orders', label: 'With Active Orders' },
  { value: 'without_orders', label: 'Without Orders' }
];

const QRFilters = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  setShowBulkModal,
  setShowGenerateModal
}) => {
  return (
    <>
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-sangeet-neutral-100 mb-2">
          Table QR Code Management
        </h1>
        <p className="text-sangeet-neutral-400">
          Manage QR codes for table ordering system
        </p>
      </div>
      <div className="mb-6 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sangeet-neutral-400" />
            <input
              type="text"
              placeholder="Search by table number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-sangeet-neutral-900 border border-sangeet-neutral-700 rounded-lg text-sangeet-neutral-100 placeholder-sangeet-neutral-500 focus:outline-none focus:border-sangeet-400 transition-colors"
            />
          </div>
          <div className="w-64">
            <CustomDropdown
              value={filterStatus}
              onChange={setFilterStatus}
              options={filterOptions}
              className="bg-sangeet-neutral-900"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default QRFilters;
