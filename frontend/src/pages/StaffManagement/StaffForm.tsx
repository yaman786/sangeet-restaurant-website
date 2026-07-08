import React from 'react';

const StaffForm = ({ formData, setFormData, isEditing, handleSubmit, onCancel }: any) => {
  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1 overflow-y-auto">
      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-sangeet-neutral-200 uppercase tracking-wider flex items-center gap-2">
          <span>👤</span> Personal Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className="w-full px-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 placeholder-sangeet-neutral-400 focus:border-sangeet-400 focus:ring-2 focus:ring-sangeet-400/20 focus:outline-none transition-all duration-200"
              placeholder="Enter first name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="w-full px-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 placeholder-sangeet-neutral-400 focus:border-sangeet-400 focus:ring-2 focus:ring-sangeet-400/20 focus:outline-none transition-all duration-200"
              placeholder="Enter last name"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 placeholder-sangeet-neutral-400 focus:border-sangeet-400 focus:ring-2 focus:ring-sangeet-400/20 focus:outline-none transition-all duration-200"
            placeholder="Enter phone number (optional)"
          />
        </div>
      </div>

      {/* Account Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-sangeet-neutral-200 uppercase tracking-wider flex items-center gap-2">
          <span>🔐</span> Account Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
              Username *
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 placeholder-sangeet-neutral-400 focus:border-sangeet-400 focus:ring-2 focus:ring-sangeet-400/20 focus:outline-none transition-all duration-200"
              placeholder="Enter username"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 placeholder-sangeet-neutral-400 focus:border-sangeet-400 focus:ring-2 focus:ring-sangeet-400/20 focus:outline-none transition-all duration-200"
              placeholder="Enter email address"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
              {isEditing ? 'New Password (leave blank to keep)' : 'Password *'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 placeholder-sangeet-neutral-400 focus:border-sangeet-400 focus:ring-2 focus:ring-sangeet-400/20 focus:outline-none transition-all duration-200"
              placeholder={isEditing ? 'Enter new password' : 'Enter secure password'}
              required={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
              Role *
            </label>
            <div className="relative">
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 focus:border-sangeet-400 focus:ring-2 focus:ring-sangeet-400/20 focus:outline-none transition-all duration-200 appearance-none cursor-pointer"
                required
              >
                <option value="waiter">🍽️ Waiter</option>
                <option value="reception">🛎️ Reception</option>
                <option value="kitchen">🍳 Kitchen Staff</option>
                <option value="admin">👑 Administrator</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-sangeet-neutral-400">▼</span>
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div>
            <label className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
              Status *
            </label>
            <div className="relative">
              <select
                value={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                className="w-full px-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 focus:border-sangeet-400 focus:ring-2 focus:ring-sangeet-400/20 focus:outline-none transition-all duration-200 appearance-none cursor-pointer"
                required
              >
                <option value="true">✅ Active</option>
                <option value="false">🚫 Inactive</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-sangeet-neutral-400">▼</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-sangeet-neutral-700 flex-shrink-0">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 bg-sangeet-neutral-700 text-sangeet-neutral-300 font-semibold rounded-lg hover:bg-sangeet-neutral-600 transition-all duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-gradient-to-r from-sangeet-400 to-sangeet-300 text-sangeet-neutral-950 font-semibold rounded-lg hover:from-sangeet-300 hover:to-sangeet-200 transform hover:scale-105 transition-all duration-200 shadow-lg"
        >
          {isEditing ? 'Update User' : 'Create User'}
        </button>
      </div>
    </form>
  );
};

export default StaffForm;
