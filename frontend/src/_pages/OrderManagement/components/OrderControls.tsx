"use client";
import React from 'react';

const OrderControls = ({
  userRole, viewMode, setViewMode, filters, setFilters, tables, completedOrders, clearCompletedOrders, orders
}: any) => {
  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <h2 className="text-lg font-semibold text-sangeet-neutral-900">
            {userRole === 'admin' ? 'Order Management' : 'Kitchen Orders'}
          </h2>
          
          {userRole === 'admin' && (
            <div className="flex space-x-4">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  viewMode === 'list' 
                    ? 'bg-sangeet-400 text-sangeet-neutral-950' 
                    : 'bg-sangeet-neutral-200 text-sangeet-neutral-700'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('detailed')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  viewMode === 'detailed' 
                    ? 'bg-sangeet-400 text-sangeet-neutral-950' 
                    : 'bg-sangeet-neutral-200 text-sangeet-neutral-700'
                }`}
              >
                Detailed View
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="space-y-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-sangeet-neutral-700 mb-3">
              Filter by Status
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilters({ ...filters, status: '' })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                  filters.status === ''
                    ? 'bg-sangeet-400 text-sangeet-neutral-950 shadow-lg'
                    : 'bg-sangeet-neutral-100 text-sangeet-neutral-700 hover:bg-sangeet-neutral-200 border border-sangeet-neutral-300'
                }`}
              >
                📋 All Statuses
              </button>
              <button
                onClick={() => setFilters({ ...filters, status: 'pending' })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                  filters.status === 'pending'
                    ? 'bg-yellow-500 text-white shadow-lg'
                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-300'
                }`}
              >
                ⏳ Pending
              </button>

              <button
                onClick={() => setFilters({ ...filters, status: 'preparing' })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                  filters.status === 'preparing'
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-300'
                }`}
              >
                👨‍🍳 Preparing
              </button>
              <button
                onClick={() => setFilters({ ...filters, status: 'ready' })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                  filters.status === 'ready'
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                }`}
              >
                🎉 Ready
              </button>
              <button
                onClick={() => setFilters({ ...filters, status: 'completed' })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                  filters.status === 'completed'
                    ? 'bg-gray-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                ✅ Completed
                {orders.filter((o: any) => o.status === 'pending').length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500 text-xs font-medium">
                  {orders.filter((o: any) => o.status === 'pending').length}
                  </span>
                )}
              </button>
              {userRole === 'admin' && (
                <button
                  onClick={() => setFilters({ ...filters, status: 'cancelled' })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                    filters.status === 'cancelled'
                      ? 'bg-red-500 text-white shadow-lg'
                      : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
                  }`}
                >
                  ❌ Cancelled
                </button>
              )}
              {filters.status === 'completed' && completedOrders.length > 0 && (
                <button
                  onClick={clearCompletedOrders}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-sangeet-neutral-700 mb-3">
              Filter by Table
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilters({ ...filters, table_id: '' })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                  filters.table_id === ''
                    ? 'bg-sangeet-400 text-sangeet-neutral-950 shadow-lg'
                    : 'bg-sangeet-neutral-100 text-sangeet-neutral-700 hover:bg-sangeet-neutral-200 border border-sangeet-neutral-300'
                }`}
              >
                🏢 All Tables
              </button>
              {tables.map((table: any) => (
                <button
                  key={table.id}
                  onClick={() => setFilters({ ...filters, table_id: table.id })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                    filters.table_id === table.id
                      ? 'bg-sangeet-400 text-sangeet-neutral-950 shadow-lg'
                      : 'bg-sangeet-neutral-100 text-sangeet-neutral-700 hover:bg-sangeet-neutral-200 border border-sangeet-neutral-300'
                  }`}
                >
                  🍽️ Table {table.table_number}
                </button>
              ))}
            </div>
          </div>
          
          {userRole === 'admin' && (
            <div>
              <label className="block text-sm font-medium text-sangeet-neutral-700 mb-3">
                Filter by Date
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilters({ ...filters, date: '' })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                    filters.date === ''
                      ? 'bg-sangeet-400 text-sangeet-neutral-950 shadow-lg'
                      : 'bg-sangeet-neutral-100 text-sangeet-neutral-700 hover:bg-sangeet-neutral-200 border border-sangeet-neutral-300'
                  }`}
                >
                  📅 All Dates
                </button>
                <button
                  onClick={() => setFilters({ ...filters, date: new Date().toISOString().split('T')[0] })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                    filters.date === new Date().toISOString().split('T')[0]
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300'
                  }`}
                >
                  📅 Today
                </button>
                <div className="relative">
                  <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-sangeet-neutral-300 focus:outline-none focus:ring-2 focus:ring-sangeet-400 bg-white hover:bg-sangeet-neutral-50 transition-all duration-200"
                    placeholder="Select Date"
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: '', table_id: '', date: '' })}
              className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 border border-red-300 transition-all duration-200 transform hover:scale-105"
            >
              🗑️ Clear All Filters
            </button>
          </div>
        </div>
      </div>

      {/* Order Status Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="px-6 py-4 border-b border-sangeet-neutral-200">
          <h2 className="text-lg font-semibold text-sangeet-neutral-900 mb-4">
            Order Status Tabs
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilters({ ...filters, status: '' })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                filters.status === ''
                  ? 'bg-sangeet-400 text-sangeet-neutral-950 shadow-lg'
                  : 'bg-sangeet-neutral-100 text-sangeet-neutral-700 hover:bg-sangeet-neutral-200 border border-sangeet-neutral-300'
              }`}
            >
              📋 All ({orders.length})
            </button>
            <button
              onClick={() => setFilters({ ...filters, status: 'pending' })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                filters.status === 'pending'
                  ? 'bg-yellow-500 text-white shadow-lg'
                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-300'
              }`}
            >
              ⏳ Pending ({orders.filter((o: any) => o.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilters({ ...filters, status: 'preparing' })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                filters.status === 'preparing'
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-300'
              }`}
            >
              👨‍🍳 Preparing ({orders.filter((o: any) => o.status === 'preparing').length})
            </button>
            <button
              onClick={() => setFilters({ ...filters, status: 'ready' })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                filters.status === 'ready'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
              }`}
            >
              🎉 Ready ({orders.filter((o: any) => o.status === 'ready').length})
            </button>
            <button
              onClick={() => setFilters({ ...filters, status: 'completed' })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                filters.status === 'completed'
                  ? 'bg-gray-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
              }`}
            >
              ✅ Completed ({orders.filter((o: any) => o.status === 'completed').length})
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderControls;
