"use client";
import React from 'react';

const StaffTable = ({ 
  filteredUsers, 
  users, 
  currentUser, 
  openEditModal, 
  handleToggleStatus, 
  handleDeleteUser 
}: any) => {
  return (
    <div className="bg-sangeet-neutral-900 rounded-xl border border-sangeet-neutral-700 overflow-hidden shadow-xl">
      {/* Table Header */}
      <div className="bg-gradient-to-r from-sangeet-neutral-800 to-sangeet-neutral-750 px-6 py-4 border-b border-sangeet-neutral-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-sangeet-neutral-100 flex items-center gap-2">
            <span>👥</span>
            Team Members
            <span className="text-sm font-normal text-sangeet-neutral-400">
              ({filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'})
            </span>
          </h3>
          {filteredUsers.length > 0 && (
            <div className="text-sm text-sangeet-neutral-400">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-sangeet-neutral-800/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-sangeet-neutral-300 uppercase tracking-wider">
                User Details
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-sangeet-neutral-300 uppercase tracking-wider">
                Role & Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-sangeet-neutral-300 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-sangeet-neutral-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sangeet-neutral-700/50">
            {filteredUsers.map((user: any) => (
              <tr key={user.id} className="hover:bg-sangeet-neutral-800/30 transition-colors duration-200 group">
                {/* User Details */}
                <td className="px-6 py-5">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-sangeet-400/20 to-sangeet-400/10 rounded-full flex items-center justify-center border border-sangeet-400/20">
                        <span className="text-lg font-semibold text-sangeet-400">
                          {user.first_name[0]}{user.last_name[0]}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-sangeet-neutral-100 truncate">
                          {user.first_name} {user.last_name}
                        </p>
                        {user.id === currentUser?.id && (
                          <span className="px-2 py-0.5 text-xs bg-sangeet-400/20 text-sangeet-400 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-sangeet-neutral-400 truncate">
                        @{user.username} • {user.email}
                      </p>
                      {user.phone && (
                        <p className="text-xs text-sangeet-neutral-500 mt-1 flex items-center gap-1">
                          <span>📞</span> {user.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Role & Status */}
                <td className="px-6 py-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${user.role === 'admin'
                          ? 'bg-purple-400/20 text-purple-400 border border-purple-400/30'
                          : 'bg-blue-400/20 text-blue-400 border border-blue-400/30'
                        }`}>
                        <span className="mr-1">
                          {user.role === 'admin' ? '👑' : user.role === 'kitchen' ? '🍳' : user.role === 'reception' ? '🛎️' : '🍽️'}
                        </span>
                        {user.role === 'admin' ? 'Administrator' : user.role === 'kitchen' ? 'Kitchen Staff' : user.role === 'reception' ? 'Reception' : 'Waiter'}
                      </span>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${user.is_active
                          ? 'bg-green-400/20 text-green-400 border border-green-400/30'
                          : 'bg-red-400/20 text-red-400 border border-red-400/30'
                        }`}>
                        <span className="mr-1">{user.is_active ? '✅' : '🚫'}</span>
                        {user.is_active ? 'Active Account' : 'Disabled Account'}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Created Date */}
                <td className="px-6 py-5">
                  <div className="text-sm text-sangeet-neutral-400">
                    <div>{new Date(user.created_at).toLocaleDateString()}</div>
                    <div className="text-xs text-sangeet-neutral-500 mt-1">
                      {new Date(user.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-5">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="px-3 py-2 text-sangeet-400 hover:text-sangeet-300 hover:bg-sangeet-400/10 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                    >
                      <span>✏️</span>
                      Edit
                    </button>

                    <button
                      onClick={() => handleToggleStatus(user.id)}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium ${user.is_active
                          ? 'text-red-400 hover:text-red-300 hover:bg-red-400/10'
                          : 'text-green-400 hover:text-green-300 hover:bg-green-400/10'
                        } ${user.id === currentUser?.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={user.id === currentUser?.id}
                    >
                      <span>{user.is_active ? '🚫' : '✅'}</span>
                      {user.is_active ? 'Disable' : 'Enable'}
                    </button>

                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className={`px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium ${user.id === currentUser?.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      disabled={user.id === currentUser?.id}
                    >
                      <span>🗑️</span>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffTable;
