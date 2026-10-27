"use client";
import React from 'react';

import { PASSWORD_HINT, ROLE_META } from './utils';

const StaffForm = ({ formData, setFormData, isEditing, handleSubmit, onCancel, isSaving = false, lockRole = false }: any) => {
  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1 overflow-y-auto" data-testid="staff-form">
      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-sangeet-neutral-200 uppercase tracking-wider flex items-center gap-2">
          <span>👤</span> Personal Information
        </h3>
        <div>
          <label htmlFor="staff-full-name" className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
            Full Name *
          </label>
          <input
            id="staff-full-name"
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="w-full px-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 placeholder-sangeet-neutral-400 focus:border-sangeet-400 focus:ring-2 focus:ring-sangeet-400/20 focus:outline-hidden transition-all duration-200"
            placeholder="Enter full name"
            maxLength={100}
            required
          />
        </div>
        <div>
          <label htmlFor="staff-phone" className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
            Phone Number
          </label>
          <input
            id="staff-phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 placeholder-sangeet-neutral-400 focus:border-sangeet-400 focus:ring-2 focus:ring-sangeet-400/20 focus:outline-hidden transition-all duration-200"
            placeholder="Enter phone number (optional)"
            maxLength={20}
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
            <label htmlFor="staff-username" className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
              Username *
            </label>
            <input
              id="staff-username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 placeholder-sangeet-neutral-400 focus:border-sangeet-400 focus:ring-2 focus:ring-sangeet-400/20 focus:outline-hidden transition-all duration-200"
              placeholder="Letters, numbers and underscores"
              minLength={3}
              maxLength={50}
              pattern="[a-zA-Z0-9_]+"
              autoComplete="off"
              required
            />
          </div>
          <div>
            <label htmlFor="staff-email" className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
              Email Address *
            </label>
            <input
              id="staff-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 placeholder-sangeet-neutral-400 focus:border-sangeet-400 focus:ring-2 focus:ring-sangeet-400/20 focus:outline-hidden transition-all duration-200"
              placeholder="Enter email address"
              autoComplete="off"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="staff-password" className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
              {isEditing ? 'New Password (leave blank to keep)' : 'Password *'}
            </label>
            <input
              id="staff-password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 placeholder-sangeet-neutral-400 focus:border-sangeet-400 focus:ring-2 focus:ring-sangeet-400/20 focus:outline-hidden transition-all duration-200"
              placeholder={isEditing ? 'Enter new password' : 'Enter secure password'}
              autoComplete="new-password"
              minLength={formData.password ? 8 : undefined}
              required={!isEditing}
            />
          </div>
          <div>
            <label htmlFor="staff-role" className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
              Role *
            </label>
            <div className="relative">
              <select
                id="staff-role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                disabled={lockRole}
                title={lockRole ? 'You cannot change your own role' : undefined}
                className="w-full px-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 focus:border-sangeet-400 focus:ring-2 focus:ring-sangeet-400/20 focus:outline-hidden transition-all duration-200 appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                required
              >
                {(Object.keys(ROLE_META) as Array<keyof typeof ROLE_META>).map((role) => (
                  <option key={role} value={role}>{ROLE_META[role].icon} {ROLE_META[role].label}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-sangeet-neutral-400">▼</span>
              </div>
            </div>
          </div>
        </div>
        <p className="text-xs text-sangeet-neutral-500">{PASSWORD_HINT}</p>

        {isEditing && (
          <div>
            <label htmlFor="staff-status" className="block text-sm font-medium text-sangeet-neutral-300 mb-2">
              Status *
            </label>
            <div className="relative">
              <select
                id="staff-status"
                value={String(formData.is_active)}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                disabled={lockRole}
                title={lockRole ? 'You cannot disable your own account' : undefined}
                className="w-full px-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 focus:border-sangeet-400 focus:ring-2 focus:ring-sangeet-400/20 focus:outline-hidden transition-all duration-200 appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
          disabled={isSaving}
          className="flex-1 px-6 py-3 bg-sangeet-neutral-700 text-sangeet-neutral-300 font-semibold rounded-lg hover:bg-sangeet-neutral-600 transition-all duration-200 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          id="staff-form-submit"
          disabled={isSaving}
          className="flex-1 px-6 py-3 bg-linear-to-r from-sangeet-400 to-sangeet-300 text-sangeet-neutral-950 font-semibold rounded-lg hover:from-sangeet-300 hover:to-sangeet-200 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving…' : isEditing ? 'Update User' : 'Create User'}
        </button>
      </div>
    </form>
  );
};

export default StaffForm;
