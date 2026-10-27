import type { UserRole } from '@/lib/types';

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
  role: 'waiter',
  full_name: '',
  phone: '',
  is_active: true
};

export const ROLE_META: Record<UserRole, { label: string; icon: string; description: string }> = {
  admin: { label: 'Administrator', icon: '👑', description: 'Full system access' },
  kitchen: { label: 'Kitchen Staff', icon: '🍳', description: 'Kitchen display and orders' },
  reception: { label: 'Reception', icon: '🛎️', description: 'Reservations and tables' },
  waiter: { label: 'Waiter', icon: '🍽️', description: 'Table service and orders' }
};

export const PASSWORD_HINT = 'At least 8 characters with an uppercase letter, a lowercase letter, a number and a special character.';

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
