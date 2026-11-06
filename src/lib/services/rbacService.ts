import { prisma } from '@/lib/db';
import { ConflictError, NotFoundError, UnauthorizedError, ValidationError } from '@/lib/errors';
import {
  ALL_MODULE_KEYS,
  DEFAULT_SYSTEM_ROLES,
  isSuperAdminRole,
  normalizeRoleKey,
  type AdminModuleKey,
  type RoleDefinition,
  type RoleTier,
} from '@/lib/rbac';

const RBAC_SETTING_KEY = 'rbac_roles_config';

interface StoredRbacConfig {
  roles: Record<string, RoleDefinition>;
  updatedAt?: string;
}

class RbacService {
  async getRolesCatalog(): Promise<Record<string, RoleDefinition>> {
    const baseCatalog: Record<string, RoleDefinition> = {};
    for (const [k, v] of Object.entries(DEFAULT_SYSTEM_ROLES)) {
      baseCatalog[k] = { ...v, permissions: [...v.permissions] };
    }

    try {
      const row = await prisma.restaurant_settings.findUnique({
        where: { setting_key: RBAC_SETTING_KEY },
      });

      if (!row || !row.setting_value) {
        return baseCatalog;
      }

      const parsed = JSON.parse(row.setting_value) as StoredRbacConfig;
      if (!parsed || typeof parsed.roles !== 'object') {
        return baseCatalog;
      }

      for (const [roleKey, storedRole] of Object.entries(parsed.roles)) {
        if (!storedRole || typeof storedRole !== 'object') continue;
        if (roleKey === 'admin') {
          // Super Admin always retains 100% module permissions
          baseCatalog.admin = {
            ...DEFAULT_SYSTEM_ROLES.admin,
            permissions: [...ALL_MODULE_KEYS],
          };
          continue;
        }

        const validPermissions = Array.isArray(storedRole.permissions)
          ? storedRole.permissions.filter((p): p is AdminModuleKey =>
              ALL_MODULE_KEYS.includes(p as AdminModuleKey)
            )
          : [];

        if (DEFAULT_SYSTEM_ROLES[roleKey]) {
          baseCatalog[roleKey] = {
            ...DEFAULT_SYSTEM_ROLES[roleKey],
            label: storedRole.label || DEFAULT_SYSTEM_ROLES[roleKey].label,
            icon: storedRole.icon || DEFAULT_SYSTEM_ROLES[roleKey].icon,
            description: storedRole.description ?? DEFAULT_SYSTEM_ROLES[roleKey].description,
            badgeColor: storedRole.badgeColor || DEFAULT_SYSTEM_ROLES[roleKey].badgeColor,
            isSystem: true,
            permissions: validPermissions,
          };
        } else {
          baseCatalog[roleKey] = {
            key: roleKey,
            label: String(storedRole.label || roleKey).slice(0, 60),
            icon: String(storedRole.icon || '🛡️').slice(0, 8),
            description: String(storedRole.description || 'Custom staff role').slice(0, 160),
            tier: (['executive', 'management', 'operational'].includes(storedRole.tier)
              ? storedRole.tier
              : 'operational') as RoleTier,
            badgeColor: String(storedRole.badgeColor || 'blue'),
            isSystem: false,
            permissions: validPermissions,
          };
        }
      }
    } catch {
      // Fallback to default system roles if JSON is malformed
    }

    return baseCatalog;
  }

  async getValidRoleKeys(): Promise<string[]> {
    const catalog = await this.getRolesCatalog();
    return Object.keys(catalog);
  }

  async getPermissionsForRole(roleKey: string): Promise<AdminModuleKey[]> {
    if (roleKey === 'admin') return [...ALL_MODULE_KEYS];
    const catalog = await this.getRolesCatalog();
    const roleDef = catalog[roleKey];
    return roleDef ? [...roleDef.permissions] : [];
  }

  private async saveCatalog(actorUserId: number, catalog: Record<string, RoleDefinition>): Promise<void> {
    const payload: StoredRbacConfig = {
      roles: catalog,
      updatedAt: new Date().toISOString(),
    };
    const jsonValue = JSON.stringify(payload);

    await prisma.restaurant_settings.upsert({
      where: { setting_key: RBAC_SETTING_KEY },
      update: {
        setting_value: jsonValue,
        setting_type: 'json',
        description: 'RBAC Roles & Module Permissions Matrix',
        updated_at: new Date(),
        updated_by: actorUserId,
      },
      create: {
        setting_key: RBAC_SETTING_KEY,
        setting_value: jsonValue,
        setting_type: 'json',
        description: 'RBAC Roles & Module Permissions Matrix',
        updated_at: new Date(),
        updated_by: actorUserId,
      },
    });
  }

  async upsertRole(
    actorUserId: number,
    actorRole: string,
    input: {
      key?: string;
      label: string;
      icon?: string;
      description?: string;
      tier?: RoleTier;
      badgeColor?: string;
      permissions: string[];
    }
  ): Promise<RoleDefinition> {
    if (!isSuperAdminRole(actorRole)) {
      throw new UnauthorizedError('Only Super Admin can create or modify roles and permissions');
    }

    const label = (input.label || '').trim();
    if (!label || label.length < 2 || label.length > 60) {
      throw new ValidationError('Role label must be between 2 and 60 characters');
    }

    const roleKey = input.key ? normalizeRoleKey(input.key) : normalizeRoleKey(label);
    if (!roleKey || roleKey.length < 2) {
      throw new ValidationError('Invalid role key');
    }

    if (roleKey === 'admin') {
      throw new ConflictError('Super Admin permissions cannot be restricted');
    }

    const validPermissions = Array.from(
      new Set(
        (input.permissions || []).filter((p): p is AdminModuleKey =>
          ALL_MODULE_KEYS.includes(p as AdminModuleKey)
        )
      )
    );

    const catalog = await this.getRolesCatalog();
    const existing = catalog[roleKey];
    const isSystem = Boolean(DEFAULT_SYSTEM_ROLES[roleKey]);

    const updatedRole: RoleDefinition = {
      key: roleKey,
      label,
      icon: (input.icon || existing?.icon || '🛡️').trim().slice(0, 8),
      description: (input.description ?? existing?.description ?? 'Custom hospitality role').trim().slice(0, 160),
      tier: (['executive', 'management', 'operational'].includes(input.tier || '')
        ? input.tier
        : existing?.tier || 'operational') as RoleTier,
      badgeColor: input.badgeColor || existing?.badgeColor || 'blue',
      isSystem,
      permissions: validPermissions,
    };

    catalog[roleKey] = updatedRole;
    await this.saveCatalog(actorUserId, catalog);
    return updatedRole;
  }

  async updateRolePermissions(
    actorUserId: number,
    actorRole: string,
    roleKey: string,
    permissions: string[]
  ): Promise<RoleDefinition> {
    if (!isSuperAdminRole(actorRole)) {
      throw new UnauthorizedError('Only Super Admin can modify role permissions');
    }

    if (roleKey === 'admin') {
      throw new ConflictError('Super Admin always has full access to all modules');
    }

    const catalog = await this.getRolesCatalog();
    const existing = catalog[roleKey];
    if (!existing) {
      throw new NotFoundError(`Role '${roleKey}'`);
    }

    const validPermissions = Array.from(
      new Set(
        (permissions || []).filter((p): p is AdminModuleKey =>
          ALL_MODULE_KEYS.includes(p as AdminModuleKey)
        )
      )
    );

    const updatedRole: RoleDefinition = {
      ...existing,
      permissions: validPermissions,
    };

    catalog[roleKey] = updatedRole;
    await this.saveCatalog(actorUserId, catalog);
    return updatedRole;
  }

  async deleteCustomRole(actorUserId: number, actorRole: string, roleKey: string): Promise<void> {
    if (!isSuperAdminRole(actorRole)) {
      throw new UnauthorizedError('Only Super Admin can delete custom roles');
    }

    if (DEFAULT_SYSTEM_ROLES[roleKey]) {
      throw new ConflictError('System roles cannot be deleted. You can customize their permissions instead.');
    }

    const catalog = await this.getRolesCatalog();
    if (!catalog[roleKey]) {
      throw new NotFoundError(`Custom role '${roleKey}'`);
    }

    const assignedCount = await prisma.users.count({
      where: { role: roleKey, deleted_at: null },
    });

    if (assignedCount > 0) {
      throw new ConflictError(
        `Cannot delete role '${catalog[roleKey].label}' while ${assignedCount} active team member(s) are assigned to it. Reassign them first.`
      );
    }

    delete catalog[roleKey];
    await this.saveCatalog(actorUserId, catalog);
  }

  async resetSystemRolesToDefaults(actorUserId: number, actorRole: string): Promise<Record<string, RoleDefinition>> {
    if (!isSuperAdminRole(actorRole)) {
      throw new UnauthorizedError('Only Super Admin can reset role permissions');
    }

    const currentCatalog = await this.getRolesCatalog();
    const nextCatalog: Record<string, RoleDefinition> = {};

    // Reset all system roles to factory defaults
    for (const [key, def] of Object.entries(DEFAULT_SYSTEM_ROLES)) {
      nextCatalog[key] = { ...def, permissions: [...def.permissions] };
    }

    // Preserve custom roles created by Super Admin
    for (const [key, def] of Object.entries(currentCatalog)) {
      if (!def.isSystem && !DEFAULT_SYSTEM_ROLES[key]) {
        nextCatalog[key] = def;
      }
    }

    await this.saveCatalog(actorUserId, nextCatalog);
    return nextCatalog;
  }
}

const rbacService = new RbacService();
export default rbacService;

