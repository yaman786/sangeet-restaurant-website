import type { UserRole } from '@/lib/types';
import {
  BADGE_COLOR_STYLES,
  DEFAULT_SYSTEM_ROLES,
  type RoleDefinition,
} from '@/lib/rbac';

export interface StaffFormData {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  full_name: string;
  phone: string;
  is_active: boolean;
}

export const EMPTY_STAFF_FORM: StaffFormData = {
  username: '',
  email: '',
  password: '',
  role: 'floor_staff',
  full_name: '',
  phone: '',
  is_active: true,
};

export const ROLE_META: Record<
  string,
  { label: string; icon: string; description: string; badgeColor: string }
> = Object.fromEntries(
  Object.entries(DEFAULT_SYSTEM_ROLES).map(([key, def]) => [
    key,
    {
      label: def.label,
      icon: def.icon,
      description: def.description,
      badgeColor: def.badgeColor,
    },
  ])
);

export function getRoleMeta(
  roleKey: string,
  rolesCatalog?: Record<string, RoleDefinition>
): { label: string; icon: string; description: string; badgeColor: string; badgeClass: string; isSystem: boolean } {
  const fromCatalog = rolesCatalog?.[roleKey] || DEFAULT_SYSTEM_ROLES[roleKey];
  if (fromCatalog) {
    return {
      label: fromCatalog.label,
      icon: fromCatalog.icon,
      description: fromCatalog.description,
      badgeColor: fromCatalog.badgeColor,
      badgeClass: BADGE_COLOR_STYLES[fromCatalog.badgeColor] || BADGE_COLOR_STYLES.blue,
      isSystem: fromCatalog.isSystem,
    };
  }
  return {
    label: roleKey,
    icon: '🛡️',
    description: 'Custom staff role',
    badgeColor: 'blue',
    badgeClass: BADGE_COLOR_STYLES.blue,
    isSystem: false,
  };
}

export const PASSWORD_HINT =
  'At least 8 characters with an uppercase letter, a lowercase letter, a number and a special character.';

export const getInitials = (fullName?: string | null): string => {
  const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return `${first}${last}`.toUpperCase();
};

/**
 * Extracts the most useful message from an ApiError (message + optional Zod details)
 * so toasts tell the admin exactly which field was rejected.
 */
export const getErrorMessage = (error: unknown, fallback: string): string => {
  const apiError = error as {
    message?: string;
    originalError?: { response?: { data?: { details?: Array<{ message?: string }> } } };
  } | null;

  const detail = apiError?.originalError?.response?.data?.details?.[0]?.message;
  if (detail) return detail;
  return apiError?.message || fallback;
};
