import React from 'react';
import AdminHeader from '../../components/AdminHeader';
import StaffTable from './StaffTable';
import StaffForm from './StaffForm';
import RoleFilter from './RoleFilter';
import { useStaffManagement } from './hooks/useStaffManagement';

const StaffManagement = () => {
  const {
    users,
    stats,
    loading,
    currentUser,
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    editingUser,
    showConfirmModal,
    setShowConfirmModal,
    confirmAction,
    setConfirmAction,
    formData,
    setFormData,
    searchTerm,
    setSearchTerm,
    filterRole,
    setFilterRole,
    filterStatus,
    setFilterStatus,
    filteredUsers,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    handleToggleStatus,
    openEditModal,
    resetForm
  } = useStaffManagement();

  if (loading) {
    return (
      <div className="min-h-screen bg-sangeet-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-sangeet-400">Loading staff management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sangeet-neutral-950">
      <AdminHeader showBackButton={true} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-sangeet-400 mb-2">Staff Management</h1>
          <p className="text-sangeet-neutral-400">
            Manage admin and staff accounts, roles, and permissions
          </p>
        </div>

        <RoleFilter 
          stats={stats}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterRole={filterRole}
          setFilterRole={setFilterRole}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          setShowCreateModal={setShowCreateModal}
        />

        {filteredUsers.length > 0 ? (
          <StaffTable 
            filteredUsers={filteredUsers}
            users={users}
            currentUser={currentUser}
            openEditModal={openEditModal}
            handleToggleStatus={handleToggleStatus}
            handleDeleteUser={handleDeleteUser}
          />
        ) : (
          <div className="bg-sangeet-neutral-900 rounded-xl border border-sangeet-neutral-700 overflow-hidden shadow-xl p-8">
            <div className="text-center py-16">
              <div className="text-6xl mb-6">
                {searchTerm || filterRole !== 'all' || filterStatus !== 'all' ? '🔍' : '👥'}
              </div>
              <h3 className="text-xl font-semibold text-sangeet-neutral-200 mb-3">
                {searchTerm || filterRole !== 'all' || filterStatus !== 'all'
                  ? 'No matching users found'
                  : 'No team members yet'
                }
              </h3>
              <p className="text-sangeet-neutral-400 mb-6 max-w-md mx-auto">
                {searchTerm || filterRole !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your search terms or filters to find the team member you\'re looking for.'
                  : 'Start building your team by adding administrators and staff members who will help manage your restaurant operations.'
                }
              </p>
              {(!searchTerm && filterRole === 'all' && filterStatus === 'all') ? (
                <div className="space-y-4">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-8 py-3 bg-gradient-to-r from-sangeet-400 to-sangeet-300 text-sangeet-neutral-950 font-semibold rounded-lg hover:from-sangeet-300 hover:to-sangeet-200 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center gap-2 mx-auto"
                  >
                    <span>➕</span>
                    Add Your First Team Member
                  </button>
                  <div className="text-xs text-sangeet-neutral-500 max-w-sm mx-auto">
                    You can add administrators (full access) or staff members (kitchen access)
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterRole('all');
                    setFilterStatus('all');
                  }}
                  className="px-6 py-2 bg-sangeet-neutral-700 text-sangeet-neutral-300 rounded-lg hover:bg-sangeet-neutral-600 transition-colors flex items-center gap-2 mx-auto"
                >
                  <span>🔄</span>
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Enhanced Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-2xl border border-sangeet-neutral-600 w-full max-w-lg mx-4 shadow-2xl transform transition-all duration-300 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-sangeet-neutral-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sangeet-400/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">👤</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-sangeet-400">Create New User</h2>
                  <p className="text-sm text-sangeet-neutral-400">Add a new team member to your restaurant</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="p-2 text-sangeet-neutral-400 hover:text-sangeet-neutral-200 hover:bg-sangeet-neutral-700 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <StaffForm 
              formData={formData} 
              setFormData={setFormData} 
              isEditing={false} 
              handleSubmit={handleCreateUser} 
              onCancel={() => { setShowCreateModal(false); resetForm(); }} 
            />
          </div>
        </div>
      )}

      {/* Enhanced Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-2xl border border-sangeet-neutral-600 w-full max-w-2xl mx-4 shadow-2xl transform transition-all duration-300 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-sangeet-neutral-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-sangeet-400/20 to-sangeet-400/10 rounded-full flex items-center justify-center border border-sangeet-400/20">
                  <span className="text-lg font-semibold text-sangeet-400">
                    {editingUser.first_name[0]}{editingUser.last_name[0]}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-sangeet-400">Edit User</h2>
                  <p className="text-sm text-sangeet-neutral-400">Update {editingUser.first_name}'s information</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
                className="p-2 text-sangeet-neutral-400 hover:text-sangeet-neutral-200 hover:bg-sangeet-neutral-700 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <StaffForm 
              formData={formData} 
              setFormData={setFormData} 
              isEditing={true} 
              handleSubmit={handleUpdateUser} 
              onCancel={() => { setShowEditModal(false); resetForm(); }} 
            />
          </div>
        </div>
      )}

      {/* Professional Confirmation Modal */}
      {showConfirmModal && confirmAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-2xl border border-sangeet-neutral-600 w-full max-w-md mx-4 shadow-2xl transform transition-all duration-300">
            <div className="flex items-center gap-4 p-6 border-b border-sangeet-neutral-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-sangeet-400/20 to-sangeet-400/10 rounded-full flex items-center justify-center border border-sangeet-400/20">
                  <span className="text-lg font-semibold text-sangeet-400">
                    {confirmAction.user?.first_name[0]}{confirmAction.user?.last_name[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-sangeet-400">{confirmAction.title}</h3>
                  <p className="text-sm text-sangeet-neutral-400">
                    {confirmAction.user?.first_name} {confirmAction.user?.last_name}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-sangeet-neutral-300 leading-relaxed">
                {confirmAction.message}
              </p>

              {confirmAction.type === 'delete' && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
                    <span>⚠️</span>
                    Warning: This action cannot be undone
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t border-sangeet-neutral-700">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmAction(null);
                }}
                className="flex-1 px-6 py-3 bg-sangeet-neutral-700 text-sangeet-neutral-300 font-semibold rounded-lg hover:bg-sangeet-neutral-600 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowConfirmModal(false);
                  await confirmAction.onConfirm();
                  setConfirmAction(null);
                }}
                className={`flex-1 px-6 py-3 text-white font-semibold rounded-lg transition-all duration-200 ${confirmAction.confirmStyle}`}
              >
                {confirmAction.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
