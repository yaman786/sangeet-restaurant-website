"use client";
import React, { useState } from 'react';
import {
  BADGE_COLOR_STYLES,
  type AdminModuleKey,
  type AdminModuleMeta,
  type RoleDefinition,
  type RoleTier,
} from '@/lib/rbac';

interface RolesPermissionsMatrixProps {
  rolesCatalog: Record<string, RoleDefinition>;
  modules: AdminModuleMeta[];
  userCountsByRole: Record<string, number>;
  isSuperAdmin: boolean;
  isUpdating: boolean;
  onToggleModule: (roleKey: string, moduleKey: AdminModuleKey) => void;
  onSaveRole: (data: {
    key?: string;
    label: string;
    icon?: string;
    description?: string;
    tier?: RoleTier;
    badgeColor?: string;
    permissions: string[];
  }) => Promise<unknown>;
  onDeleteCustomRole: (roleKey: string) => Promise<unknown>;
  onResetDefaults: () => Promise<unknown>;
}

const ROLE_ICONS = ['🛡️', '🎩', '⚙️', '📋', '🤝', '🍷', '🍽️', '🍳', '🛎️', '🤵', '👨‍🍳', '🍸', '💼', '🔑', '⭐'];
const BADGE_COLORS = [
  { key: 'purple', label: 'Royal Purple' },
  { key: 'amber', label: 'Executive Gold' },
  { key: 'emerald', label: 'Emerald Green' },
  { key: 'blue', label: 'Ocean Blue' },
  { key: 'cyan', label: 'Cyan Teal' },
  { key: 'orange', label: 'Kitchen Orange' },
  { key: 'rose', label: 'Bar Rose' },
];

const TIER_LABELS: Record<RoleTier, string> = {
  super_admin: 'Root Authority',
  executive: 'Executive Leadership',
  management: 'Floor & Shift Management',
  operational: 'Station & Service Staff',
};

const RolesPermissionsMatrix: React.FC<RolesPermissionsMatrixProps> = ({
  rolesCatalog,
  modules,
  userCountsByRole,
  isSuperAdmin,
  isUpdating,
  onToggleModule,
  onSaveRole,
  onDeleteCustomRole,
  onResetDefaults,
}) => {
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRoleKey, setEditingRoleKey] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const [icon, setIcon] = useState('🛡️');
  const [description, setDescription] = useState('');
  const [tier, setTier] = useState<RoleTier>('operational');
  const [badgeColor, setBadgeColor] = useState('blue');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['orders']);
  const [savingModal, setSavingModal] = useState(false);

  const rolesList = Object.values(rolesCatalog);

  const openCreateRoleModal = () => {
    setEditingRoleKey(null);
    setLabel('');
    setIcon('🛡️');
    setDescription('');
    setTier('operational');
    setBadgeColor('blue');
    setSelectedPermissions(['orders']);
    setShowRoleModal(true);
  };

  const openEditRoleModal = (role: RoleDefinition) => {
    setEditingRoleKey(role.key);
    setLabel(role.label);
    setIcon(role.icon);
    setDescription(role.description);
    setTier(role.tier === 'super_admin' ? 'executive' : role.tier);
    setBadgeColor(role.badgeColor || 'blue');
    setSelectedPermissions([...role.permissions]);
    setShowRoleModal(true);
  };

  const toggleModalPermission = (modKey: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(modKey) ? prev.filter((k) => k !== modKey) : [...prev, modKey]
    );
  };

  const handleRoleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    setSavingModal(true);
    try {
      await onSaveRole({
        key: editingRoleKey || undefined,
        label: label.trim(),
        icon,
        description: description.trim() || 'Custom hospitality role',
        tier,
        badgeColor,
        permissions: selectedPermissions,
      });
      setShowRoleModal(false);
    } finally {
      setSavingModal(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="roles-permissions-matrix">
      {/* Top Action Bar */}
      <div className="bg-sangeet-neutral-900 rounded-xl p-6 border border-sangeet-neutral-700 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="text-2xl">🛡️</span>
            <h2 className="text-xl font-bold text-sangeet-400">
              Hospitality Roles &amp; Dashboard Card Access Matrix
            </h2>
          </div>
          <p className="text-sm text-sangeet-neutral-400">
            Configure which Dashboard Cards and Admin Modules each role can see and access after signing in. Only{' '}
            <span className="text-purple-300 font-semibold">Super Admin</span> can modify permissions or create custom roles.
          </p>
        </div>

        {isSuperAdmin && (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              data-testid="reset-roles-defaults-btn"
              onClick={() => onResetDefaults()}
              disabled={isUpdating}
              className="px-4 py-2.5 bg-sangeet-neutral-800 text-sangeet-neutral-300 hover:text-sangeet-neutral-100 hover:bg-sangeet-neutral-700 border border-sangeet-neutral-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              🔄 Reset System Defaults
            </button>
            <button
              type="button"
              data-testid="create-custom-role-btn"
              onClick={openCreateRoleModal}
              className="px-5 py-2.5 bg-linear-to-r from-sangeet-400 to-sangeet-300 text-sangeet-neutral-950 font-semibold rounded-lg hover:from-sangeet-300 hover:to-sangeet-200 transition-all shadow-lg flex items-center gap-2 text-sm"
            >
              <span>➕</span>
              <span>Create Custom Role</span>
            </button>
          </div>
        )}
      </div>

      {/* Interactive Permission Matrix Table */}
      <div className="bg-sangeet-neutral-900 rounded-xl border border-sangeet-neutral-700 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sangeet-neutral-800/80 border-b border-sangeet-neutral-700">
                <th className="py-4 px-5 text-xs font-semibold text-sangeet-neutral-300 uppercase tracking-wider min-w-[240px] sticky left-0 bg-sangeet-neutral-800 z-10">
                  Role &amp; Hierarchy
                </th>
                {modules.map((mod) => (
                  <th
                    key={mod.key}
                    className="py-3 px-3 text-center text-xs font-semibold text-sangeet-neutral-300 uppercase tracking-wider min-w-[96px]"
                    title={mod.description}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-lg">{mod.icon}</span>
                      <span className="leading-tight text-[11px]">{mod.shortLabel}</span>
                    </div>
                  </th>
                ))}
                {isSuperAdmin && (
                  <th className="py-4 px-4 text-right text-xs font-semibold text-sangeet-neutral-300 uppercase tracking-wider min-w-[130px]">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-sangeet-neutral-800">
              {rolesList.map((role) => {
                const isRoot = role.key === 'admin';
                const badgeStyle = BADGE_COLOR_STYLES[role.badgeColor] || BADGE_COLOR_STYLES.blue;
                const memberCount = userCountsByRole[role.key] || 0;

                return (
                  <tr
                    key={role.key}
                    data-testid={`role-matrix-row-${role.key}`}
                    className="hover:bg-sangeet-neutral-800/40 transition-colors"
                  >
                    {/* Role Identity Column */}
                    <td className="py-4 px-5 sticky left-0 bg-sangeet-neutral-900 z-10 border-r border-sangeet-neutral-800/80">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeStyle}`}
                            >
                              <span>{role.icon}</span>
                              <span>{role.label}</span>
                            </span>
                            {!role.isSystem && (
                              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-sangeet-400/15 text-sangeet-400 border border-sangeet-400/30 rounded-full">
                                Custom
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-sangeet-neutral-400 line-clamp-1 max-w-[220px]">
                            {role.description}
                          </p>
                          <div className="text-[11px] text-sangeet-neutral-500 mt-1 flex items-center gap-2">
                            <span>{TIER_LABELS[role.tier] || 'Operational'}</span>
                            <span>•</span>
                            <span>
                              {memberCount} {memberCount === 1 ? 'member' : 'members'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Module Permission Checkboxes */}
                    {modules.map((mod) => {
                      const hasPerm = isRoot || role.permissions.includes(mod.key);
                      return (
                        <td key={mod.key} className="py-4 px-3 text-center">
                          <button
                            type="button"
                            data-testid={`perm-toggle-${role.key}-${mod.key}`}
                            disabled={!isSuperAdmin || isRoot || isUpdating}
                            onClick={() => onToggleModule(role.key, mod.key)}
                            aria-label={`${role.label} access to ${mod.label}`}
                            aria-pressed={hasPerm}
                            title={
                              isRoot
                                ? 'Super Admin always has unrestricted access to all modules'
                                : `${hasPerm ? 'Revoke' : 'Grant'} ${mod.label} for ${role.label}`
                            }
                            className={`w-9 h-9 rounded-lg inline-flex items-center justify-center text-sm font-bold transition-all ${
                              isRoot
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30 cursor-not-allowed'
                                : hasPerm
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 hover:bg-emerald-500/30 shadow-xs'
                                : 'bg-sangeet-neutral-800/80 text-sangeet-neutral-600 border border-sangeet-neutral-700 hover:border-sangeet-neutral-500 hover:text-sangeet-neutral-300'
                            }`}
                          >
                            {isRoot ? '🔒' : hasPerm ? '✓' : '—'}
                          </button>
                        </td>
                      );
                    })}

                    {/* Actions Column */}
                    {isSuperAdmin && (
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        {isRoot ? (
                          <span className="text-xs text-purple-300/80 font-medium px-2 py-1 bg-purple-500/10 rounded-md">
                            Protected Root
                          </span>
                        ) : (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              data-testid={`edit-role-${role.key}`}
                              onClick={() => openEditRoleModal(role)}
                              className="px-2.5 py-1.5 text-xs font-medium text-sangeet-400 hover:bg-sangeet-400/10 rounded-lg transition-colors"
                            >
                              ✏️ Configure
                            </button>
                            {!role.isSystem && (
                              <button
                                type="button"
                                data-testid={`delete-role-${role.key}`}
                                onClick={() => onDeleteCustomRole(role.key)}
                                className="px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                              >
                                🗑️ Delete
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Custom Role Modal */}
      {showRoleModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          data-testid="custom-role-modal"
        >
          <div className="bg-linear-to-br from-sangeet-neutral-900 to-sangeet-neutral-800 rounded-2xl border border-sangeet-neutral-600 w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-sangeet-neutral-700">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-sangeet-400/20 rounded-xl flex items-center justify-center text-2xl">
                  {icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-sangeet-400">
                    {editingRoleKey ? `Configure Role: ${label}` : 'Create Custom Hospitality Role'}
                  </h3>
                  <p className="text-xs text-sangeet-neutral-400">
                    Choose the role title, badge style, and exact Dashboard Cards unlocked on login
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRoleModal(false)}
                className="p-2 text-sangeet-neutral-400 hover:text-sangeet-neutral-200 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRoleFormSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="custom-role-label" className="block text-sm font-medium text-sangeet-neutral-300 mb-1.5">
                    Role Name *
                  </label>
                  <input
                    id="custom-role-label"
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g., Sous Chef, Sommelier, Shift Lead"
                    required
                    maxLength={50}
                    className="w-full px-4 py-2.5 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 focus:border-sangeet-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label htmlFor="custom-role-tier" className="block text-sm font-medium text-sangeet-neutral-300 mb-1.5">
                    Hierarchy Tier
                  </label>
                  <select
                    id="custom-role-tier"
                    value={tier}
                    onChange={(e) => setTier(e.target.value as RoleTier)}
                    className="w-full px-4 py-2.5 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 focus:border-sangeet-400 focus:outline-hidden"
                  >
                    <option value="executive">Executive Leadership (GM / Ops)</option>
                    <option value="management">Floor &amp; Shift Management</option>
                    <option value="operational">Station &amp; Operational Staff</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="custom-role-description" className="block text-sm font-medium text-sangeet-neutral-300 mb-1.5">
                  Role Responsibilities / Description
                </label>
                <input
                  id="custom-role-description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description shown on the staff portal and dashboard"
                  maxLength={140}
                  className="w-full px-4 py-2.5 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 focus:border-sangeet-400 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-sangeet-neutral-300 mb-1.5">Badge Icon</label>
                  <div className="flex flex-wrap gap-1.5 bg-sangeet-neutral-800/80 p-2.5 rounded-lg border border-sangeet-neutral-700">
                    {ROLE_ICONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setIcon(emoji)}
                        className={`w-8 h-8 rounded-md flex items-center justify-center text-base transition-all ${
                          icon === emoji
                            ? 'bg-sangeet-400 text-sangeet-neutral-950 scale-110 shadow-sm'
                            : 'hover:bg-sangeet-neutral-700'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="custom-role-color" className="block text-sm font-medium text-sangeet-neutral-300 mb-1.5">
                    Badge Color Theme
                  </label>
                  <select
                    id="custom-role-color"
                    value={badgeColor}
                    onChange={(e) => setBadgeColor(e.target.value)}
                    className="w-full px-4 py-2.5 bg-sangeet-neutral-800 border border-sangeet-neutral-600 rounded-lg text-sangeet-neutral-100 focus:border-sangeet-400 focus:outline-hidden"
                  >
                    {BADGE_COLORS.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dashboard Cards & Modules Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-sangeet-neutral-200">
                    Unlocked Dashboard Cards &amp; Modules ({selectedPermissions.length} of {modules.length})
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPermissions(modules.map((m) => m.key))}
                      className="text-xs text-sangeet-400 hover:underline"
                    >
                      Select All
                    </button>
                    <span className="text-sangeet-neutral-600">|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedPermissions([])}
                      className="text-xs text-sangeet-neutral-400 hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-sangeet-neutral-950/60 p-3.5 rounded-xl border border-sangeet-neutral-700">
                  {modules.map((mod) => {
                    const checked = selectedPermissions.includes(mod.key);
                    return (
                      <label
                        key={mod.key}
                        data-testid={`modal-perm-${mod.key}`}
                        className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                          checked
                            ? 'bg-sangeet-400/15 border-sangeet-400/50 text-sangeet-neutral-100'
                            : 'bg-sangeet-neutral-900 border-sangeet-neutral-800 text-sangeet-neutral-400 hover:border-sangeet-neutral-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleModalPermission(mod.key)}
                          className="sr-only"
                        />
                        <span
                          className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${
                            checked
                              ? 'bg-sangeet-400 text-sangeet-neutral-950'
                              : 'bg-sangeet-neutral-800 border border-sangeet-neutral-600'
                          }`}
                        >
                          {checked ? '✓' : ''}
                        </span>
                        <span className="text-lg">{mod.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold truncate">{mod.label}</div>
                          <div className="text-[10px] text-sangeet-neutral-500 truncate">{mod.href}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-sangeet-neutral-700">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="flex-1 px-5 py-2.5 bg-sangeet-neutral-700 text-sangeet-neutral-200 font-semibold rounded-lg hover:bg-sangeet-neutral-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="save-custom-role-btn"
                  disabled={savingModal || !label.trim()}
                  className="flex-1 px-5 py-2.5 bg-linear-to-r from-sangeet-400 to-sangeet-300 text-sangeet-neutral-950 font-semibold rounded-lg hover:from-sangeet-300 hover:to-sangeet-200 transition-all shadow-lg disabled:opacity-50"
                >
                  {savingModal ? 'Saving Role…' : editingRoleKey ? 'Save Role Changes' : 'Create Custom Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPermissionsMatrix;

