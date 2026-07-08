import React from 'react';

const RoleFilter = ({
  stats,
  searchTerm,
  setSearchTerm,
  filterRole,
  setFilterRole,
  filterStatus,
  setFilterStatus,
  setShowCreateModal
}: any) => {
  return (
    <>
      {/* Enhanced Stats Cards with Better Labels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <div className="bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-xl p-5 border border-sangeet-neutral-700 hover:border-sangeet-400/30 transition-all duration-300 group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-sangeet-400/20 rounded-lg flex items-center justify-center group-hover:bg-sangeet-400/30 transition-colors">
              <span className="text-lg">👥</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-sangeet-400">{stats.total || 0}</div>
              <div className="text-xs text-sangeet-neutral-500">Total</div>
            </div>
          </div>
          <div className="text-sm text-sangeet-neutral-200 font-medium">All Team Members</div>
          <div className="text-xs text-sangeet-neutral-400 mt-1">Everyone in your restaurant</div>
        </div>

        <div className="bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-xl p-5 border border-sangeet-neutral-700 hover:border-green-400/30 transition-all duration-300 group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-green-400/20 rounded-lg flex items-center justify-center group-hover:bg-green-400/30 transition-colors">
              <span className="text-lg">✅</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{stats.active || 0}</div>
              <div className="text-xs text-green-300">Active</div>
            </div>
          </div>
          <div className="text-sm text-sangeet-neutral-200 font-medium">Active Users</div>
          <div className="text-xs text-sangeet-neutral-400 mt-1">Can access the system</div>
        </div>

        <div className="bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-xl p-5 border border-sangeet-neutral-700 hover:border-red-400/30 transition-all duration-300 group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-red-400/20 rounded-lg flex items-center justify-center group-hover:bg-red-400/30 transition-colors">
              <span className="text-lg">🚫</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">{stats.inactive || 0}</div>
              <div className="text-xs text-red-300">Inactive</div>
            </div>
          </div>
          <div className="text-sm text-sangeet-neutral-200 font-medium">Inactive Users</div>
          <div className="text-xs text-sangeet-neutral-400 mt-1">Account disabled</div>
        </div>

        <div className="bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-xl p-5 border border-sangeet-neutral-700 hover:border-purple-400/30 transition-all duration-300 group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-purple-400/20 rounded-lg flex items-center justify-center group-hover:bg-purple-400/30 transition-colors">
              <span className="text-lg">👑</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">{stats.admins || 0}</div>
              <div className="text-xs text-purple-300">Admins</div>
            </div>
          </div>
          <div className="text-sm text-sangeet-neutral-200 font-medium">Administrators</div>
          <div className="text-xs text-sangeet-neutral-400 mt-1">Full system access</div>
        </div>

        <div className="bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-xl p-5 border border-sangeet-neutral-700 hover:border-blue-400/30 transition-all duration-300 group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-400/20 rounded-lg flex items-center justify-center group-hover:bg-blue-400/30 transition-colors">
              <span className="text-lg">👤</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">{stats.staff || 0}</div>
              <div className="text-xs text-blue-300">Staff</div>
            </div>
          </div>
          <div className="text-sm text-sangeet-neutral-200 font-medium">Staff Members</div>
          <div className="text-xs text-sangeet-neutral-400 mt-1">Kitchen & service access</div>
        </div>

        <div className="bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-xl p-5 border border-sangeet-neutral-700 hover:border-orange-400/30 transition-all duration-300 group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-orange-400/20 rounded-lg flex items-center justify-center group-hover:bg-orange-400/30 transition-colors">
              <span className="text-lg">🆕</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-400">{stats.recent || 0}</div>
              <div className="text-xs text-orange-300">New</div>
            </div>
          </div>
          <div className="text-sm text-sangeet-neutral-200 font-medium">Recent Additions</div>
          <div className="text-xs text-sangeet-neutral-400 mt-1">Added in last 30 days</div>
        </div>
      </div>

      {/* Enhanced Controls */}
      <div className="bg-sangeet-neutral-900 rounded-xl p-6 border border-sangeet-neutral-700 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-sangeet-neutral-500">🔍</span>
              </div>
              <input
                type="text"
                placeholder="Search by name, username, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 placeholder-sangeet-neutral-400 focus:border-sangeet-400 focus:ring-2 focus:ring-sangeet-400/20 focus:outline-none transition-all duration-200"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sangeet-neutral-400 hover:text-sangeet-neutral-200"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <div className="relative">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="appearance-none px-4 py-3 pr-8 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 focus:border-sangeet-400 focus:ring-2 focus:ring-sangeet-400/20 focus:outline-none transition-all duration-200 cursor-pointer"
              >
                <option value="all">👥 All Roles</option>
                <option value="admin">👑 Admin</option>
                <option value="staff">👤 Staff</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-sangeet-neutral-400">▼</span>
              </div>
            </div>

            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none px-4 py-3 pr-8 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 focus:border-sangeet-400 focus:ring-2 focus:ring-sangeet-400/20 focus:outline-none transition-all duration-200 cursor-pointer"
              >
                <option value="all">📊 All Status</option>
                <option value="active">✅ Active</option>
                <option value="inactive">⏸️ Inactive</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-sangeet-neutral-400">▼</span>
              </div>
            </div>
          </div>

          {/* Add User Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-sangeet-400 to-sangeet-300 text-sangeet-neutral-950 font-semibold rounded-lg hover:from-sangeet-300 hover:to-sangeet-200 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-sangeet-400/25 flex items-center gap-2 whitespace-nowrap"
          >
            <span className="text-lg">➕</span>
            Add New User
          </button>
        </div>

        {/* Filter Summary */}
        {(searchTerm || filterRole !== 'all' || filterStatus !== 'all') && (
          <div className="mt-4 pt-4 border-t border-sangeet-neutral-700">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-sangeet-neutral-400">Active filters:</span>
              {searchTerm && (
                <span className="px-3 py-1 bg-sangeet-400/20 text-sangeet-400 rounded-full text-sm flex items-center gap-1">
                  🔍 "{searchTerm}"
                  <button onClick={() => setSearchTerm('')} className="hover:text-sangeet-300">✕</button>
                </span>
              )}
              {filterRole !== 'all' && (
                <span className="px-3 py-1 bg-purple-400/20 text-purple-400 rounded-full text-sm flex items-center gap-1">
                  {filterRole === 'admin' ? '👑' : '👤'} {filterRole}
                  <button onClick={() => setFilterRole('all')} className="hover:text-purple-300">✕</button>
                </span>
              )}
              {filterStatus !== 'all' && (
                <span className="px-3 py-1 bg-blue-400/20 text-blue-400 rounded-full text-sm flex items-center gap-1">
                  {filterStatus === 'active' ? '✅' : '⏸️'} {filterStatus}
                  <button onClick={() => setFilterStatus('all')} className="hover:text-blue-300">✕</button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterRole('all');
                  setFilterStatus('all');
                }}
                className="px-3 py-1 bg-sangeet-neutral-700 text-sangeet-neutral-300 rounded-full text-sm hover:bg-sangeet-neutral-600 transition-colors"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default RoleFilter;
