import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllTimeSlots, bulkCreateTimeSlots, updateTimeSlot, deleteTimeSlot } from '../services/api';
import toast from 'react-hot-toast';
import { Trash2, AlertTriangle, Clock, RefreshCw, X, Sparkles } from 'lucide-react';

export default function ShiftManagerModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerateConfirm, setShowGenerateConfirm] = useState(false);
  const [deleteConfirmSlot, setDeleteConfirmSlot] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Default shift values
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

  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowGenerateConfirm(true);
  };

  const executeBulkGenerate = async () => {
    setIsGenerating(true);
    try {
      await bulkCreateTimeSlots({
        startTime,
        endTime,
        intervalMinutes,
        maxCapacity
      });
      toast.success('New shift & pacing generated successfully!');
      setShowGenerateConfirm(false);
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
      toast.success('Slot status updated');
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

  const executeDeleteSlot = async () => {
    if (!deleteConfirmSlot) return;
    setIsDeleting(true);
    try {
      await deleteTimeSlot(deleteConfirmSlot.id);
      setSlots(prev => prev.filter(s => s.id !== deleteConfirmSlot.id));
      toast.success('Time slot deleted');
      setDeleteConfirmSlot(null);
    } catch (error) {
      toast.error('Failed to delete slot');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-sangeet-neutral-900 rounded-2xl border border-sangeet-neutral-700 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-sangeet-neutral-800 flex justify-between items-center bg-sangeet-neutral-950">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sangeet-400/15 border border-sangeet-400/30 flex items-center justify-center text-sangeet-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-sangeet-neutral-100 flex items-center gap-2">
                    Shift & Pacing Settings
                  </h3>
                  <p className="text-xs text-sangeet-neutral-400">Configure online reservation intervals, shifts, and kitchen seating capacity.</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-sangeet-neutral-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-sangeet-neutral-800 cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              {/* Generator Panel */}
              <div className="w-full lg:w-1/3 p-6 border-r border-sangeet-neutral-800 bg-sangeet-neutral-950/60 flex flex-col justify-between overflow-y-auto">
                <div>
                  <div className="flex items-center gap-2 text-sangeet-400 font-semibold text-sm mb-4">
                    <Sparkles className="w-4 h-4" />
                    <span>Bulk Shift Generator</span>
                  </div>

                  <form onSubmit={handleGenerateSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-sangeet-neutral-300 mb-1.5">Start Time</label>
                      <input
                        type="time"
                        required
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full bg-sangeet-neutral-900 border border-sangeet-neutral-700 rounded-xl px-3.5 py-2.5 text-white focus:border-sangeet-400 focus:outline-hidden text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-sangeet-neutral-300 mb-1.5">End Time</label>
                      <input
                        type="time"
                        required
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full bg-sangeet-neutral-900 border border-sangeet-neutral-700 rounded-xl px-3.5 py-2.5 text-white focus:border-sangeet-400 focus:outline-hidden text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-sangeet-neutral-300 mb-1.5">Interval (Pacing)</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[15, 30, 60].map((mins) => (
                          <button
                            key={mins}
                            type="button"
                            onClick={() => setIntervalMinutes(mins)}
                            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                              intervalMinutes === mins
                                ? 'bg-sangeet-400 text-sangeet-neutral-950 border-sangeet-400 shadow-md'
                                : 'bg-sangeet-neutral-900 text-sangeet-neutral-300 border-sangeet-neutral-700 hover:border-sangeet-500'
                            }`}
                          >
                            {mins} mins
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-sangeet-neutral-300 mb-1.5">Max Guests per Slot</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="100"
                        value={maxCapacity}
                        onChange={(e) => setMaxCapacity(Number(e.target.value))}
                        className="w-full bg-sangeet-neutral-900 border border-sangeet-neutral-700 rounded-xl px-3.5 py-2.5 text-white focus:border-sangeet-400 focus:outline-hidden text-sm font-semibold"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-linear-to-r from-sangeet-400 to-sangeet-300 hover:from-sangeet-300 hover:to-sangeet-200 text-sangeet-neutral-950 font-bold text-sm py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-6"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Generate Shift Slots</span>
                    </button>
                  </form>
                </div>

                <p className="text-[11px] text-sangeet-neutral-500 mt-6 text-center">
                  💡 Pacing slots limits online guest bookings to prevent kitchen overload.
                </p>
              </div>

              {/* Slot Management Panel */}
              <div className="w-full lg:w-2/3 flex flex-col h-[50vh] lg:h-full bg-sangeet-neutral-950">
                <div className="p-4 border-b border-sangeet-neutral-800 flex justify-between items-center sticky top-0 bg-sangeet-neutral-950 z-10">
                  <h4 className="text-sm font-bold text-sangeet-neutral-200 uppercase tracking-wider">Active Reservation Pacing Slots</h4>
                  <span className="text-xs bg-sangeet-neutral-800 text-sangeet-400 font-semibold px-3 py-1 rounded-full border border-sangeet-neutral-700">{slots.length} slots</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                  {loading ? (
                    <div className="flex items-center justify-center h-48">
                      <div className="w-8 h-8 border-3 border-sangeet-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-sangeet-neutral-800 rounded-2xl p-6">
                      <div className="text-3xl mb-2">⏰</div>
                      <p className="text-sangeet-neutral-400 font-medium">No time slots configured</p>
                      <p className="text-xs text-sangeet-neutral-500 mt-1">Use the generator on the left to create your dining shifts.</p>
                    </div>
                  ) : (
                    slots.map(slot => (
                      <div 
                        key={slot.id} 
                        className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                          slot.is_active 
                            ? 'bg-sangeet-neutral-900 border-sangeet-neutral-800 shadow-sm' 
                            : 'bg-sangeet-neutral-950/80 border-sangeet-neutral-800/40 opacity-50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => handleToggleActive(slot.id, slot.is_active)}
                            className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${slot.is_active ? 'bg-emerald-600' : 'bg-sangeet-neutral-700'}`}
                            title={slot.is_active ? 'Click to disable slot' : 'Click to enable slot'}
                          >
                            <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${slot.is_active ? 'translate-x-6' : 'translate-x-0'}`} />
                          </button>
                          <div>
                            <span className="text-base font-bold text-white font-mono">{slot.time_slot}</span>
                            <span className={`ml-2 text-[10px] uppercase font-bold px-2 py-0.5 rounded ${slot.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-sangeet-neutral-800 text-sangeet-neutral-500'}`}>
                              {slot.is_active ? 'Active' : 'Disabled'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-sangeet-neutral-400 font-medium">Max Diners:</span>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={slot.max_reservations}
                              onChange={(e) => handleUpdateCapacity(slot.id, Number(e.target.value))}
                              className="w-16 bg-sangeet-neutral-800 border border-sangeet-neutral-700 rounded-lg px-2 py-1 text-xs text-white font-bold text-center focus:border-sangeet-400 focus:outline-hidden"
                            />
                          </div>
                          <button
                            onClick={() => setDeleteConfirmSlot(slot)}
                            className="p-1.5 text-sangeet-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Delete slot"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-sangeet-neutral-800 bg-sangeet-neutral-950 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-sangeet-neutral-800 hover:bg-sangeet-neutral-700 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* CONFIRM BULK GENERATE MODAL */}
      {showGenerateConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-60 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-sangeet-neutral-900 border border-sangeet-neutral-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-sangeet-neutral-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Generate New Shift</h4>
                <p className="text-xs text-sangeet-neutral-400">Pacing & slot configuration</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-sangeet-neutral-300 leading-relaxed">
                Generating a new shift will <strong className="text-amber-400">replace all existing time slots</strong> with the new interval schedule ({startTime} – {endTime}, every {intervalMinutes} mins, max {maxCapacity} guests).
              </p>
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300">
                ⚠️ Existing customer reservations will remain intact, but future slot availability will update.
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-sangeet-neutral-800 bg-sangeet-neutral-950/60">
              <button
                type="button"
                disabled={isGenerating}
                onClick={() => setShowGenerateConfirm(false)}
                className="flex-1 px-5 py-2.5 rounded-xl bg-sangeet-neutral-800 hover:bg-sangeet-neutral-700 text-sangeet-neutral-200 font-medium text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isGenerating}
                onClick={executeBulkGenerate}
                className="flex-1 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? 'Generating...' : 'Confirm & Replace'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* CONFIRM DELETE SLOT MODAL */}
      {deleteConfirmSlot && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-60 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-sangeet-neutral-900 border border-sangeet-neutral-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-sangeet-neutral-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Delete Time Slot</h4>
                <p className="text-xs text-sangeet-neutral-400">Remove reservation window</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-sangeet-neutral-300">
                Are you sure you want to permanently delete slot <span className="font-mono font-bold text-amber-400">{deleteConfirmSlot.time_slot}</span>? Guests will no longer be able to book for this time.
              </p>
            </div>

            <div className="flex gap-3 p-6 border-t border-sangeet-neutral-800 bg-sangeet-neutral-950/60">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteConfirmSlot(null)}
                className="flex-1 px-5 py-2.5 rounded-xl bg-sangeet-neutral-800 hover:bg-sangeet-neutral-700 text-sangeet-neutral-200 font-medium text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={executeDeleteSlot}
                className="flex-1 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Slot'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
