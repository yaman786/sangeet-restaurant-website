"use client";
import React from 'react';
import { Trash2 } from 'lucide-react';
import CustomDropdown from '../../components/CustomDropdown';

const OrderFilters = ({
  viewMode,
  setViewMode,
  completedOrders,
  handleClearCompletedOrders,
  filters,
  setFilters,
  tables
}: any) => {
  const [localQuery, setLocalQuery] = React.useState(filters.query || '');

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (filters.query !== localQuery) {
        setFilters((prev: any) => ({ ...prev, query: localQuery }));
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [localQuery, setFilters, filters.query]);

  return (
    <>
      {/* Live Updates Indicator */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 mb-6 text-center">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <p className="text-blue-300 text-sm">
            🔄 Order list updates automatically in real-time
          </p>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-xl p-6 mb-6 border border-sangeet-neutral-700">
        {/* Status Filter Buttons Row */}
        <div className="flex flex-wrap gap-2 mb-4">
          {['all', 'pending', 'preparing', 'ready', 'completed'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === mode
                  ? 'bg-sangeet-400 text-sangeet-neutral-950'
                  : 'bg-sangeet-neutral-800 text-sangeet-neutral-400 hover:bg-sangeet-neutral-700'
                }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
              {mode === 'completed' && completedOrders.length > 0 && (
                <span className="ml-1 bg-sangeet-neutral-700 text-sangeet-neutral-300 px-1.5 py-0.5 rounded-full text-xs">
                  {completedOrders.length}
                </span>
              )}
            </button>
          ))}
          {viewMode === 'completed' && completedOrders.length > 0 && (
            <button
              onClick={handleClearCompletedOrders}
              className="px-4 py-2 flex items-center gap-2 bg-red-500/10 text-red-500 border border-red-500/30 rounded-lg text-sm font-medium hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-200"
              title="Clear all completed orders from screen"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Completed</span>
            </button>
          )}
        </div>

        {/* Search and Table Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className={viewMode === 'completed' ? "md:col-span-2" : "md:col-span-3"}>
            <input
              type="text"
              placeholder="Search by customer name or order number..."
              value={localQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalQuery(e.target.value)}
              className="w-full px-4 py-2 bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded-lg text-sangeet-neutral-300 focus:outline-none focus:border-sangeet-400"
            />
          </div>

          {/* Table Filter - Only visible in completed tab */}
          {viewMode === 'completed' && (
            <div>
              <CustomDropdown
                value={filters.table_id}
                onChange={(tableId: any) => setFilters((prev: any) => ({ ...prev, table_id: tableId }))}
                options={[
                  { value: '', label: 'All Tables' },
                  ...tables.map((table: any) => ({
                    value: table.id,
                    label: `Table ${table.table_number}`
                  }))
                ]}
                className="w-full"
              />
            </div>
          )}
        </div>

      </div>
    </>
  );
};

export default OrderFilters;
