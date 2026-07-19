"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomDropdown from '../../components/CustomDropdown';
import { hasMultipleSessions } from '../../utils/itemUtils';

const OrderTable = ({
  orders,
  completedOrders,
  viewMode,
  selectedOrders,
  handleSelectAll,
  handleOrderSelection,
  handleStatusUpdate,
  canCompleteOrder,
  showActiveOrdersModalDetails,
  handleViewOrderDetails,
  handleDeleteOrderClick,
  handleBulkStatusUpdate
}: any) => {
  const currentOrders = viewMode === 'completed' ? completedOrders : orders;
  const selectableOrders = currentOrders.filter((order: any) =>
    order.status !== 'completed' && order.status !== 'cancelled'
  );
  
  const isAllSelected = selectedOrders.length === selectableOrders.length && selectableOrders.length > 0;

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const getStatusColor = (status: any) => {
    const colors = {
      pending: 'bg-yellow-500',
      confirmed: 'bg-blue-500',
      preparing: 'bg-orange-500',
      ready: 'bg-green-500',
      completed: 'bg-gray-500',
      cancelled: 'bg-red-500'
    };
    return (colors as any)[status] || 'bg-gray-500';
  };

  const formatDate = (dateString: any) => {
    return new Date(dateString).toLocaleString();
  };

  const statusDisplayNames: { [key: string]: string } = {
    'pending': 'New Order',
    'preparing': 'In Kitchen',
    'ready': 'Ready / Served',
    'completed': 'Paid & Completed',
    'cancelled': 'Cancelled'
  };

  const bulkActionLabels: { [key: string]: string } = {
    'preparing': 'Accept Orders',
    'ready': 'Mark Ready',
    'completed': 'Mark Paid & Completed',
    'cancelled': 'Cancel Orders'
  };

  // Group orders by table and customer
  const groupedOrders = currentOrders.reduce((acc: any, order: any) => {
    // We group by table number AND customer name to represent a distinct "Tab"
    const key = `${order.table_number}_${order.customer_name}`;
    if (!acc[key]) {
      acc[key] = {
        key,
        table_number: order.table_number,
        customer_name: order.customer_name,
        orders: [],
        total_amount: 0,
        hasReady: false,
        hasPreparing: false,
        hasPending: false,
        allCompleted: true,
      };
    }
    acc[key].orders.push(order);
    acc[key].total_amount += Number(order.total_amount || 0);
    
    if (order.status === 'ready') acc[key].hasReady = true;
    if (order.status === 'preparing') acc[key].hasPreparing = true;
    if (order.status === 'pending') acc[key].hasPending = true;
    if (order.status !== 'completed' && order.status !== 'cancelled') acc[key].allCompleted = false;

    return acc;
  }, {});

  // Sort sub-orders by created_at ascending
  Object.values(groupedOrders).forEach((group: any) => {
    group.orders.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  });

  const groups = Object.values(groupedOrders) as any[];

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-xl p-4 mb-6 border border-sangeet-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sangeet-neutral-400">
                {selectedOrders.length} order(s) selected
              </p>
              <p className="text-xs text-sangeet-neutral-500 mt-1">
                💡 Completed and cancelled orders cannot be modified
              </p>
            </div>
            <div className="flex space-x-2">
              {['preparing', 'ready', 'completed', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleBulkStatusUpdate(status)}
                  className="px-3 py-1 bg-sangeet-400 text-sangeet-neutral-950 rounded text-sm font-medium hover:bg-sangeet-300 transition-colors"
                >
                  {bulkActionLabels[status] || `Mark ${status}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-xl border border-sangeet-neutral-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-sangeet-neutral-800">
              <tr>
                <th className="px-6 py-4 text-left w-12">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="rounded border-sangeet-neutral-600 bg-sangeet-neutral-800 text-sangeet-400 focus:ring-sangeet-400"
                  />
                </th>
                <th className="px-6 py-4 text-left text-sangeet-neutral-400 font-medium">Table Tab</th>
                <th className="px-6 py-4 text-left text-sangeet-neutral-400 font-medium">Customer</th>
                <th className="px-6 py-4 text-left text-sangeet-neutral-400 font-medium">Total Amount</th>
                <th className="px-6 py-4 text-left text-sangeet-neutral-400 font-medium">Status Overview</th>
                <th className="px-6 py-4 text-right text-sangeet-neutral-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sangeet-neutral-700">
              <AnimatePresence mode="popLayout">
                {groups.map((group: any) => {
                  const isExpanded = expandedGroups[group.key];
                  
                  // Determine aggregated status display
                  let groupStatusUI;
                  if (group.hasReady) {
                    groupStatusUI = <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-xs font-bold">Food Ready</span>;
                  } else if (group.hasPreparing) {
                    groupStatusUI = <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-2"><span>Cooking</span><span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse"></span></span>;
                  } else if (group.hasPending) {
                    groupStatusUI = <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-bold">New Orders</span>;
                  } else {
                    groupStatusUI = <span className="bg-sangeet-neutral-700/50 text-sangeet-neutral-400 border border-sangeet-neutral-600 px-3 py-1 rounded-full text-xs font-bold">Completed</span>;
                  }

                  return (
                    <React.Fragment key={group.key}>
                      {/* Master Row */}
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`hover:bg-sangeet-neutral-800 transition-colors cursor-pointer ${isExpanded ? 'bg-sangeet-neutral-800/80' : ''}`}
                        onClick={() => toggleGroup(group.key)}
                      >
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          {/* We don't render a checkbox on the master row to keep bulk selection tied to specific tickets */}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-sangeet-400 font-bold text-lg">Table {group.table_number}</span>
                            <span className="bg-sangeet-neutral-700 text-sangeet-neutral-300 px-2 py-0.5 rounded text-xs">
                              {group.orders.length} Ticket{group.orders.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sangeet-neutral-300 font-medium">
                          {group.customer_name}
                        </td>
                        <td className="px-6 py-4 text-sangeet-400 font-bold">
                          ${group.total_amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          {groupStatusUI}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end items-center space-x-4">
                            {/* Master Checkout Button */}
                            {group.hasReady && !group.allCompleted && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Trigger the modal using the first uncompleted order as the target
                                  const targetOrder = group.orders.find((o: any) => o.status !== 'completed' && o.status !== 'cancelled');
                                  if (targetOrder) {
                                    showActiveOrdersModalDetails(targetOrder);
                                  }
                                }}
                                className="bg-blue-500/20 text-blue-400 border border-blue-500/50 hover:bg-blue-500/30 px-4 py-1.5 rounded-lg font-bold text-sm transition-all shadow-sm flex items-center space-x-2"
                              >
                                <span>Collect Payment</span>
                                <span>💵</span>
                              </button>
                            )}
                            <div className="text-sangeet-neutral-500">
                              {isExpanded ? '▲' : '▼'}
                            </div>
                          </div>
                        </td>
                      </motion.tr>

                      {/* Sub-Rows (Individual Tickets) */}
                      <AnimatePresence>
                        {isExpanded && group.orders.map((order: any, index: number) => (
                          <motion.tr
                            key={order.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-sangeet-neutral-900/50 border-t border-sangeet-neutral-800/50"
                          >
                            <td className="px-6 py-3 pl-8">
                              <input
                                type="checkbox"
                                checked={selectedOrders.includes(order.id)}
                                onChange={() => handleOrderSelection(order.id)}
                                disabled={order.status === 'completed' || order.status === 'cancelled'}
                                className={`rounded border-sangeet-neutral-600 focus:ring-sangeet-400 ${order.status === 'completed' || order.status === 'cancelled'
                                    ? 'bg-sangeet-neutral-700 text-sangeet-neutral-500 cursor-not-allowed'
                                    : 'bg-sangeet-neutral-800 text-sangeet-400'
                                  }`}
                              />
                            </td>
                            <td className="px-6 py-3" colSpan={2}>
                              <div className="flex items-center space-x-3 ml-4">
                                <span className="text-sangeet-neutral-400 text-sm">Round {index + 1}</span>
                                <span className="text-sangeet-neutral-500 text-xs">#{order.order_number}</span>
                                {order.items && hasMultipleSessions(order.items) && (
                                  <span className="bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded text-xs border border-blue-500/30">
                                    Merged
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-3 text-sangeet-neutral-400 text-sm">
                              ${order.total_amount}
                            </td>
                            <td className="px-6 py-3">
                              <div className="flex items-center space-x-3">
                                <span className={`whitespace-nowrap px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  order.status === 'pending' ? 'text-yellow-400' :
                                  order.status === 'preparing' ? 'text-orange-400' :
                                  order.status === 'ready' ? 'text-green-400' :
                                  order.status === 'completed' ? 'text-sangeet-neutral-500' :
                                  'text-red-400'
                                }`}>
                                  {statusDisplayNames[order.status] || order.status}
                                </span>
                                {order.status === 'pending' && (
                                  <button
                                    onClick={() => handleStatusUpdate(order.id, 'preparing')}
                                    className="text-xs text-green-400 hover:text-green-300 font-medium underline"
                                  >
                                    Accept →
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-3 text-right">
                              <div className="flex justify-end items-center space-x-3">
                                <span className="text-sangeet-neutral-500 text-xs mr-4">{formatDate(order.created_at)}</span>
                                <button
                                  onClick={() => handleViewOrderDetails(order.id)}
                                  className="text-sangeet-neutral-400 hover:text-blue-400 transition-colors"
                                  title="View Details"
                                >
                                  👁️
                                </button>
                                <button
                                  onClick={() => handleDeleteOrderClick(order.id)}
                                  className="text-sangeet-neutral-500 hover:text-red-400 transition-colors"
                                  title="Delete Ticket"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {currentOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sangeet-neutral-400">No active tables found</p>
          </div>
        )}
      </div>
    </>
  );
};

export default OrderTable;
