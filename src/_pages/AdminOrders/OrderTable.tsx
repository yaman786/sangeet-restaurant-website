"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Group orders by table and distinct sitting (4 hour gap)
  const groupedOrders = [...currentOrders]
    .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .reduce((acc: any[], order: any) => {
      const tableNumberStr = String(order.table_number || 'Unknown').trim();
      const orderTime = new Date(order.created_at).getTime();
      
      // Check if we should group this order. 
      // Rule: Completed and cancelled orders are ALWAYS distinct (never grouped).
      const isHistorical = order.status === 'completed' || order.status === 'cancelled';
      
      let sittingGroup;
      if (!isHistorical) {
        sittingGroup = acc.find(group => {
          if (group.table_number !== tableNumberStr) return false;
          // Don't group with historical standalone groups
          if (group.orders.some((o: any) => o.status === 'completed' || o.status === 'cancelled')) return false;
          
          // Check if the last order in this group was within 12 hours (lenient sitting duration)
          const lastOrderTime = new Date(group.orders[group.orders.length - 1].created_at).getTime();
          return (orderTime - lastOrderTime) < (12 * 60 * 60 * 1000);
        });
      }
      
      if (!sittingGroup) {
        sittingGroup = {
          key: `${tableNumberStr}_${orderTime}`,
          table_number: tableNumberStr,
          customer_name: order.customer_name && order.customer_name !== 'Guest' ? order.customer_name : 'Guest',
          orders: [],
          total_amount: 0,
          hasReady: false,
          hasPreparing: false,
          hasPending: false,
          allCompleted: true,
        };
        acc.push(sittingGroup);
      }
      
      sittingGroup.orders.push(order);
      sittingGroup.total_amount += Number(order.total_amount || 0);

      // Ensure named customer takes precedence over 'Guest' for the table title
      if (order.customer_name && order.customer_name !== 'Guest' && sittingGroup.customer_name === 'Guest') {
        sittingGroup.customer_name = order.customer_name;
      }
      
      if (order.status === 'ready' || order.status === 'served') sittingGroup.hasReady = true;
      if (order.status === 'preparing' || order.status === 'accepted') sittingGroup.hasPreparing = true;
      if (order.status === 'pending') sittingGroup.hasPending = true;
      if (order.status !== 'completed' && order.status !== 'cancelled') sittingGroup.allCompleted = false;

      return acc;
    }, []);

  // Compute table level payment readiness and annotate true round numbers
  groupedOrders.forEach((group: any) => {
    group.orders.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    // Annotate true original round number for each ticket
    group.orders.forEach((order: any, idx: number) => {
      order.roundNumber = idx + 1;
    });

    const activeTickets = group.orders.filter((o: any) => o.status !== 'completed' && o.status !== 'cancelled');
    const hasUncooked = activeTickets.some((o: any) => o.status === 'pending' || o.status === 'accepted' || o.status === 'preparing');
    const hasReadyOrServed = activeTickets.some((o: any) => o.status === 'ready' || o.status === 'served');
    
    group.canCollectPayment = activeTickets.length > 0 && !hasUncooked && hasReadyOrServed;
  });

  // Filter groups and their visible sub-tickets according to current viewMode tab
  const groups = groupedOrders.map((group: any) => {
    let visibleTickets = group.orders;
    
    if (viewMode === 'pending') {
      // "New Orders" tab shows ONLY tickets with status 'pending'
      visibleTickets = group.orders.filter((o: any) => o.status === 'pending');
    } else if (viewMode === 'preparing') {
      // "In Kitchen" tab shows ONLY tickets that are accepted or preparing
      visibleTickets = group.orders.filter((o: any) => o.status === 'accepted' || o.status === 'preparing');
    } else if (viewMode === 'ready') {
      // "Ready / Served" tab shows ONLY tickets that are ready or served
      visibleTickets = group.orders.filter((o: any) => o.status === 'ready' || o.status === 'served');
    } else if (viewMode === 'completed') {
      visibleTickets = group.orders.filter((o: any) => o.status === 'completed' || o.status === 'cancelled');
    }

    return {
      ...group,
      visibleTickets
    };
  }).filter((group: any) => {
    // Only include table card on the tab if it has visible tickets for that tab view Mode
    if (viewMode === 'all') return true;
    return group.visibleTickets.length > 0;
  });

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-sangeet-neutral-900/90 backdrop-blur-xl rounded-full px-6 py-3 border border-sangeet-neutral-700/50 shadow-2xl flex items-center space-x-6">
            <div className="flex items-center space-x-2 border-r border-sangeet-neutral-700 pr-6">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold">
                {selectedOrders.length}
              </span>
              <p className="text-sm font-medium text-sangeet-neutral-200">
                ticket(s) selected
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {(() => {
                const selectedOrderObjs = currentOrders.filter((o: any) => selectedOrders.includes(o.id));
                const allPending = selectedOrderObjs.every((o: any) => o.status === 'pending');
                const allReady = selectedOrderObjs.every((o: any) => o.status === 'ready' || o.status === 'served');
                
                return (
                  <>
                    {allPending && (
                      <button
                        onClick={() => handleBulkStatusUpdate('preparing')}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-full text-sm font-medium transition-all duration-300 shadow-[0_0_15px_rgba(249,115,22,0.3)] flex items-center space-x-2"
                      >
                        <span>Accept to Kitchen</span>
                      </button>
                    )}

                    {allReady && (
                      <button
                        onClick={() => handleBulkStatusUpdate('completed')}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-full text-sm font-medium transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center space-x-2"
                      >
                        <span>Complete & Paid</span>
                      </button>
                    )}

                    {/* Always show cancel for any active state */}
                    <button
                      onClick={() => handleBulkStatusUpdate('cancelled')}
                      className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                );
              })()}
            </div>
            
            <button 
              onClick={() => setSelectedOrders([])}
              className="ml-4 text-sangeet-neutral-500 hover:text-sangeet-neutral-300 transition-colors flex items-center"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-linear-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-xl border border-sangeet-neutral-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-sangeet-neutral-800">
              <tr>
                <th className="px-6 py-4 text-left w-12">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="rounded-sm border-sangeet-neutral-600 bg-sangeet-neutral-800 text-sangeet-400 focus:ring-sangeet-400"
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
                  if (group.hasPreparing) {
                    groupStatusUI = <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-2"><span>Cooking in Kitchen</span><span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse"></span></span>;
                  } else if (group.hasPending) {
                    groupStatusUI = <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-2"><span>New Orders</span><span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></span></span>;
                  } else if (group.hasReady) {
                    groupStatusUI = <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-xs font-bold">Food Ready / Served</span>;
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
                            <span className="bg-sangeet-neutral-700 text-sangeet-neutral-300 px-2 py-0.5 rounded-sm text-xs">
                              {group.visibleTickets.length} Ticket{group.visibleTickets.length > 1 ? 's' : ''}
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
                            {/* Master Checkout Button - STRICTLY requires ALL tickets to be ready/served with 0 cooking tickets */}
                            {group.canCollectPayment && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Trigger the modal using the first uncompleted order as the target
                                  const targetOrder = group.orders.find((o: any) => o.status !== 'completed' && o.status !== 'cancelled');
                                  if (targetOrder) {
                                    showActiveOrdersModalDetails(targetOrder);
                                  }
                                }}
                                className="bg-blue-500/20 text-blue-400 border border-blue-500/50 hover:bg-blue-500/30 px-4 py-1.5 rounded-lg font-bold text-sm transition-all shadow-xs flex items-center space-x-2 cursor-pointer"
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

                      {/* Sub-Rows (Individual Tickets for current Tab) */}
                      <AnimatePresence>
                        {isExpanded && group.visibleTickets.map((order: any) => (
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
                                <span className="text-sangeet-neutral-400 text-sm font-semibold">Round {order.roundNumber || 1}</span>
                                <span className="text-sangeet-neutral-500 text-xs">#{order.order_number}</span>
                              </div>
                            </td>
                            <td className="px-6 py-3 text-sangeet-neutral-400 text-sm">
                              ${order.total_amount}
                            </td>
                            <td className="px-6 py-3">
                              <div className="flex items-center space-x-3">
                                <span className={`whitespace-nowrap px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  order.status === 'pending' ? 'text-yellow-400' :
                                  order.status === 'accepted' ? 'text-orange-400' :
                                  order.status === 'preparing' ? 'text-blue-400' :
                                  order.status === 'ready' ? 'text-green-400' :
                                  order.status === 'completed' ? 'text-sangeet-neutral-500' :
                                  'text-red-400'
                                }`}>
                                  {statusDisplayNames[order.status] || order.status}
                                </span>
                                {order.status === 'pending' && (
                                  <button
                                    onClick={() => handleStatusUpdate(order.id, 'accepted')}
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

        {groups.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sangeet-neutral-400">No active tables found in this tab</p>
          </div>
        )}
      </div>
    </>
  );
};

export default OrderTable;
