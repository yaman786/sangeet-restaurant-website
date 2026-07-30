import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllTimeSlots, bulkCreateTimeSlots, updateTimeSlot, deleteTimeSlot } from '../services/api';
import toast from 'react-hot-toast';

export default function ShiftManagerModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Default hard-coded values per user request
  const [startTime, setStartTime] = useState('17:00');
  const [endTime, setEndTime] = useState('22:30');
  const [intervalMinutes, setIntervalMinutes] = useState(30);
  const [maxCapacity, setMaxCapacity] = useState(15);

  useEffect(() => {
    if (isOpen) {
      loadSlots();
    }
  }, [isOpen]);

  const loadSlots = async () => {
    try {
      setLoading(true);
      const res: any = await getAllTimeSlots();
      setSlots(res.data || res || []);
    } catch (error) {
      console.error('Failed to load slots:', error);
      toast.error('Failed to load time slots');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm('This will replace all existing time slots. Are you sure you want to generate a new shift?')) {
      return;
    }
    
    setIsGenerating(true);
    try {
      await bulkCreateTimeSlots({
        startTime,
        endTime,
        intervalMinutes,
        maxCapacity
      });
      toast.success('Shift generated successfully!');
      loadSlots();
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.response?.data?.error || 'Failed to generate slots');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleActive = async (slotId: string, currentStatus: boolean) => {
    try {
      await updateTimeSlot(slotId, { is_active: !currentStatus });
      setSlots(prev => prev.map(s => s.id === slotId ? { ...s, is_active: !currentStatus } : s));
      toast.success('Slot updated');
    } catch (error) {
      toast.error('Failed to update slot');
    }
  };

  const handleUpdateCapacity = async (slotId: string, newCapacity: number) => {
    try {
      await updateTimeSlot(slotId, { max_reservations: newCapacity });
      setSlots(prev => prev.map(s => s.id === slotId ? { ...s, max_reservations: newCapacity } : s));
      toast.success('Capacity updated');
    } catch (error) {
      toast.error('Failed to update capacity');
    }
  };

  const handleDelete = async (slotId: string) => {
    if (!confirm('Delete this slot entirely?')) return;
    try {
      await deleteTimeSlot(slotId);
      setSlots(prev => prev.filter(s => s.id !== slotId));
      toast.success('Slot deleted');
    } catch (error) {
      toast.error('Failed to delete slot');
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
            className="bg-sangeet-neutral-900 rounded-2xl border border-sangeet-neutral-700 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            <div className="p-5 border-b border-sangeet-neutral-700 flex justify-between items-center bg-sangeet-neutral-900">
              <div>
                <h3 className="text-2xl font-bold text-sangeet-neutral-100 flex items-center gap-2">
                  <span className="text-sangeet-400">⚙️</span> Shift & Pacing Manager
                </h3>
                <p className="text-sm text-sangeet-neutral-400 mt-1">Configure your active reservation slots and manage kitchen pacing.</p>
              </div>
              <button
                onClick={onClose}
                className="text-sangeet-neutral-400 hover:text-white transition-colors p-2"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              {/* Generator Panel */}
              <div className="w-full lg:w-1/3 p-5 border-r border-sangeet-neutral-700 bg-sangeet-neutral-900/50 flex flex-col">
                <h4 className="text-lg font-semibold text-white mb-4">Bulk Generate</h4>
                <form onSubmit={handleGenerate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-sangeet-neutral-400 mb-1">Start Time</label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded-lg px-3 py-2 text-white focus:border-sangeet-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sangeet-neutral-400 mb-1">End Time</label>
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded-lg px-3 py-2 text-white focus:border-sangeet-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sangeet-neutral-400 mb-1">Interval (minutes)</label>
                    <select
                      value={intervalMinutes}
                      onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                      className="w-full bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded-lg px-3 py-2 text-white focus:border-sangeet-400 focus:outline-none"
                    >
                      <option value={15}>15 mins</option>
                      <option value={30}>30 mins</option>
                      <option value={60}>60 mins</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sangeet-neutral-400 mb-1">Max Guests per Slot</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={maxCapacity}
                      onChange={(e) => setMaxCapacity(Number(e.target.value))}
                      className="w-full bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded-lg px-3 py-2 text-white focus:border-sangeet-400 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full bg-sangeet-400 hover:bg-[#B8972E] text-black font-bold text-sm py-3 rounded-lg shadow-lg transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Generate Shift'
                    )}
                  </button>
                  <p className="text-xs text-sangeet-neutral-500 mt-2 text-center">Note: This replaces all existing slots.</p>
                </form>
              </div>

              {/* Slot Management Panel */}
              <div className="w-full lg:w-2/3 flex flex-col h-[50vh] lg:h-full bg-sangeet-neutral-950">
                <div className="p-4 border-b border-sangeet-neutral-800 flex justify-between items-center sticky top-0 bg-sangeet-neutral-950 z-10">
                  <h4 className="text-lg font-semibold text-white">Current Active Slots</h4>
                  <span className="text-xs bg-sangeet-neutral-800 text-sangeet-neutral-300 px-2 py-1 rounded-full">{slots.length} slots</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="w-8 h-8 border-4 border-sangeet-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-sangeet-neutral-700 rounded-xl">
                      <p className="text-sangeet-neutral-500">No time slots configured.</p>
                      <p className="text-sm text-sangeet-neutral-600 mt-1">Use the generator to create your shift.</p>
                    </div>
                  ) : (
                    slots.map(slot => (
                      <div key={slot.id} className={`flex items-center justify-between p-3 rounded-xl border ${slot.is_active ? 'bg-sangeet-neutral-900 border-sangeet-neutral-700' : 'bg-sangeet-neutral-900/40 border-sangeet-neutral-800 opacity-60'} transition-all`}>
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => handleToggleActive(slot.id, slot.is_active)}
                            className={`w-12 h-6 rounded-full relative transition-colors ${slot.is_active ? 'bg-sangeet-400' : 'bg-sangeet-neutral-700'}`}
                          >
                            <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-black transition-transform ${slot.is_active ? 'translate-x-6' : 'translate-x-0'}`} />
                          </button>
                          <div>
                            <span className="text-lg font-bold text-white font-mono">{slot.time_slot}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-sangeet-neutral-400">Max Guests:</span>
                            <input
                              type="number"
                              value={slot.max_reservations}
                              onChange={(e) => handleUpdateCapacity(slot.id, Number(e.target.value))}
                              className="w-16 bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded px-2 py-1 text-sm text-white text-center focus:border-sangeet-400 focus:outline-none"
                            />
                          </div>
                          <button
                            onClick={() => handleDelete(slot.id)}
                            className="text-sangeet-neutral-500 hover:text-red-400 transition-colors p-1"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
