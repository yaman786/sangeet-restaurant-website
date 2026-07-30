import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchMenuItems, createOrder } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminAddOrderModal({ isOpen, onClose, tables }: any) {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  // Form State
  const [customerName, setCustomerName] = useState('');
  const [tableId, setTableId] = useState('');
  const [orderType, setOrderType] = useState('dine-in');
  
  // Cart State
  const [cart, setCart] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMenu();
    }
  }, [isOpen]);

  const loadMenu = async () => {
    try {
      setLoading(true);
      const items = await fetchMenuItems();
      // Only keep active items
      const activeItems = items.filter((item: any) => item.is_active !== false);
      setMenuItems(activeItems);
      
      const uniqueCats = Array.from(new Set(activeItems.map((i: any) => i.categories?.name || 'Uncategorized')));
      setCategories(['All', ...uniqueCats]);
    } catch (error) {
      console.error('Failed to load menu items:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = activeCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => (item.categories?.name || 'Uncategorized') === activeCategory);

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1, special_requests: '' }];
    });
  };

  const updateQuantity = (id: any, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQ = Math.max(0, i.quantity + delta);
        return { ...i, quantity: newQ };
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const updateNotes = (id: any, notes: string) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, special_requests: notes } : i));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (orderType === 'dine-in' && !tableId) {
      toast.error('Please select a table for dine-in orders');
      return;
    }
    
    if (!customerName) {
      toast.error('Customer name is required');
      return;
    }

    if (cart.length === 0) {
      toast.error('Please add at least one item to the cart');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        table_id: orderType === 'dine-in' ? Number(tableId) : null,
        customer_name: customerName,
        order_type: orderType,
        status: 'accepted', // Crucial: skip pending queue and go straight to kitchen
        items: cart.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          special_requests: item.special_requests || null
        }))
      };

      await createOrder(orderData as any);
      toast.success('Order successfully placed and sent to kitchen!');
      
      // Reset form
      setCart([]);
      setCustomerName('');
      setTableId('');
      onClose();
    } catch (error: any) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.error || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-sangeet-neutral-900 rounded-2xl border border-sangeet-neutral-700 shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col lg:flex-row overflow-hidden"
          >
            {/* Left Panel - Menu Selection */}
            <div className="flex-1 flex flex-col border-r border-sangeet-neutral-700 max-h-[50vh] lg:max-h-[90vh]">
              <div className="p-4 border-b border-sangeet-neutral-700 bg-sangeet-neutral-900">
                <h3 className="text-xl font-bold text-sangeet-neutral-100 flex items-center gap-2">
                  <span className="text-sangeet-400">🍽️</span> Menu Selection
                </h3>
                {/* Categories */}
                <div className="flex overflow-x-auto gap-2 mt-4 pb-2 scrollbar-thin scrollbar-thumb-sangeet-neutral-700">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        activeCategory === cat 
                          ? 'bg-sangeet-400 text-black' 
                          : 'bg-sangeet-neutral-800 text-sangeet-neutral-300 hover:bg-sangeet-neutral-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 bg-sangeet-neutral-950/50">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-8 h-8 border-4 border-sangeet-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredItems.map(item => (
                      <div 
                        key={item.id} 
                        onClick={() => addToCart(item)}
                        className="bg-sangeet-neutral-800 p-4 rounded-xl border border-sangeet-neutral-700 cursor-pointer hover:border-sangeet-400 hover:bg-sangeet-neutral-750 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <h4 className="font-semibold text-sangeet-neutral-100">{item.name}</h4>
                          <p className="text-sm text-sangeet-neutral-400 line-clamp-2 mt-1">{item.description}</p>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-sangeet-400 font-bold">${Number(item.price).toFixed(2)}</span>
                          <div className="w-8 h-8 rounded-full bg-sangeet-400/10 text-sangeet-400 flex items-center justify-center text-lg">+</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Cart & Checkout */}
            <div className="w-full lg:w-[400px] flex flex-col bg-sangeet-neutral-900 max-h-[50vh] lg:max-h-[90vh]">
              <div className="p-4 border-b border-sangeet-neutral-700 flex justify-between items-center bg-sangeet-neutral-900">
                <h3 className="text-xl font-bold text-sangeet-neutral-100">Order Details</h3>
                <button
                  onClick={onClose}
                  className="text-sangeet-neutral-400 hover:text-white transition-colors p-1"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <form id="manual-order-form" onSubmit={handleSubmit} className="space-y-4">
                  {/* Order Type & Table */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-sangeet-neutral-400 mb-1">Type</label>
                      <select
                        value={orderType}
                        onChange={(e) => {
                          setOrderType(e.target.value);
                          if (e.target.value !== 'dine-in') setTableId('');
                        }}
                        className="w-full bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded-lg px-3 py-2 text-sangeet-neutral-100 text-sm focus:border-sangeet-400 focus:outline-none"
                      >
                        <option value="dine-in">Dine-in</option>
                        <option value="takeaway">Takeaway</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-sangeet-neutral-400 mb-1">Table</label>
                      <select
                        value={tableId}
                        onChange={(e) => setTableId(e.target.value)}
                        disabled={orderType !== 'dine-in'}
                        className="w-full bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded-lg px-3 py-2 text-sangeet-neutral-100 text-sm focus:border-sangeet-400 focus:outline-none disabled:opacity-50"
                      >
                        <option value="">Select...</option>
                        {tables?.map((t: any) => (
                          <option key={t.id} value={t.id}>Table {t.table_number}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Customer Name */}
                  <div>
                    <label className="block text-xs font-medium text-sangeet-neutral-400 mb-1">Customer Name <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. John Walk-in"
                      className="w-full bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded-lg px-3 py-2 text-sangeet-neutral-100 text-sm focus:border-sangeet-400 focus:outline-none"
                    />
                  </div>

                  <div className="border-t border-sangeet-neutral-800 my-4"></div>

                  {/* Cart Items */}
                  <div>
                    <h4 className="text-sm font-semibold text-sangeet-neutral-300 mb-3">Cart ({cart.length} items)</h4>
                    {cart.length === 0 ? (
                      <div className="text-center py-8 bg-sangeet-neutral-800/50 rounded-xl border border-dashed border-sangeet-neutral-700">
                        <p className="text-sangeet-neutral-500 text-sm">Cart is empty</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {cart.map(item => (
                          <div key={item.id} className="bg-sangeet-neutral-800 p-3 rounded-lg border border-sangeet-neutral-700">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h5 className="text-sm font-medium text-sangeet-neutral-100">{item.name}</h5>
                                <span className="text-xs text-sangeet-400">${Number(item.price).toFixed(2)}</span>
                              </div>
                              <div className="flex items-center space-x-2 bg-sangeet-neutral-900 rounded-md border border-sangeet-neutral-700 p-0.5">
                                <button type="button" onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-sangeet-neutral-400 hover:text-white">-</button>
                                <span className="text-xs font-medium w-4 text-center text-sangeet-neutral-100">{item.quantity}</span>
                                <button type="button" onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center text-sangeet-neutral-400 hover:text-white">+</button>
                              </div>
                            </div>
                            <input
                              type="text"
                              placeholder="Notes (e.g. no onions)..."
                              value={item.special_requests}
                              onChange={(e) => updateNotes(item.id, e.target.value)}
                              className="w-full bg-sangeet-neutral-900 border border-sangeet-neutral-700 rounded-md px-2 py-1.5 text-xs text-sangeet-neutral-300 focus:border-sangeet-400 focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-sangeet-neutral-700 bg-sangeet-neutral-900">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sangeet-neutral-300 font-medium">Total</span>
                  <span className="text-2xl font-bold text-white">${totalAmount.toFixed(2)}</span>
                </div>
                <button
                  type="submit"
                  form="manual-order-form"
                  disabled={isSubmitting || cart.length === 0}
                  className="w-full bg-sangeet-400 hover:bg-[#B8972E] text-black font-bold text-lg py-3 rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Submit Order to Kitchen'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
