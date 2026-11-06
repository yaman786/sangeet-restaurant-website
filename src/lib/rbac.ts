export type AdminModuleKey =
  | 'orders'
  | 'kitchen'
  | 'bar'
  | 'menu'
  | 'tables'
  | 'reservations'
  | 'staff'
  | 'history'
  | 'analytics'
  | 'website';

export interface AdminModuleMeta {
  key: AdminModuleKey;
  label: string;
  shortLabel: string;
  icon: string;
  badgeText: string;
  description: string;
  ctaLabel: string;
  href: string;
  routePrefixes: string[];
  accentClass: string;
  iconBgClass: string;
}

export const ADMIN_MODULES: AdminModuleMeta[] = [
  {
    key: 'orders',
    label: 'Order Management',
    shortLabel: 'Orders & POS',
    icon: '📋',
    badgeText: 'Orders',
    description: 'View all orders, customer data, and current operational status',
    ctaLabel: 'Manage Orders',
    href: '/admin/orders',
    routePrefixes: ['/admin/orders'],
    accentClass: 'hover:border-sangeet-400/50',
    iconBgClass: 'bg-sangeet-400/20 group-hover:bg-sangeet-400/30',
  },
  {
    key: 'kitchen',
    label: 'Kitchen Display (KOT)',
    shortLabel: 'Kitchen (KOT)',
    icon: '🍳',
    badgeText: 'KOT • Food',
    description: 'Real-time Kitchen Order Tickets (KOT) for Starters, Curries, Tandoor, and Breads',
    ctaLabel: 'Open Kitchen KOT',
    href: '/admin/kitchen',
    routePrefixes: ['/admin/kitchen', '/kitchen'],
    accentClass: 'hover:border-orange-400/50',
    iconBgClass: 'bg-orange-400/20 group-hover:bg-orange-400/30',
  },
  {
    key: 'bar',
    label: 'Bar Display (BOT)',
    shortLabel: 'Bar (BOT)',
    icon: '🍷',
    badgeText: 'BOT • Drinks',
    description: 'Real-time Bar Order Tickets (BOT) for Beers, Whisky, Spirits, Cocktails & Soft Drinks',
    ctaLabel: 'Open Bar BOT',
    href: '/admin/bar',
    routePrefixes: ['/admin/bar'],
    accentClass: 'hover:border-purple-400/50',
    iconBgClass: 'bg-purple-500/20 group-hover:bg-purple-500/30',
  },
  {
    key: 'menu',
    label: 'Menu Management',
    shortLabel: 'Menu & Pricing',
    icon: '🍽️',
    badgeText: 'Menu',
    description: "Add, edit, and organize menu items, categories, and manage your restaurant's offerings",
    ctaLabel: 'Manage Menu',
    href: '/admin/menu-management',
    routePrefixes: ['/admin/menu-management'],
    accentClass: 'hover:border-sangeet-400/50',
    iconBgClass: 'bg-sangeet-400/20 group-hover:bg-sangeet-400/30',
  },
  {
    key: 'tables',
    label: 'Table Management',
    shortLabel: 'Tables & QR',
    icon: '📱',
    badgeText: 'Tables',
    description: 'Manage restaurant tables, generate QR codes, track usage analytics, and customize QR experiences',
    ctaLabel: 'Manage Tables',
    href: '/admin/qr-management',
    routePrefixes: ['/admin/qr-management'],
    accentClass: 'hover:border-sangeet-400/50',
    iconBgClass: 'bg-sangeet-400/20 group-hover:bg-sangeet-400/30',
  },
  {
    key: 'reservations',
    label: 'Reservation Management',
    shortLabel: 'Reservations',
    icon: '📅',
    badgeText: 'Reservations',
    description: 'Manage table reservations, confirm bookings, and track customer appointments',
    ctaLabel: 'Manage Reservations',
    href: '/admin/reservations',
    routePrefixes: ['/admin/reservations'],
    accentClass: 'hover:border-green-400/50',
    iconBgClass: 'bg-green-400/20 group-hover:bg-green-400/30',
  },
  {
    key: 'staff',
    label: 'Staff Management',
    shortLabel: 'Staff & Roles',
    icon: '👥',
    badgeText: 'Staff',
    description: 'Manage admin and staff accounts, roles, permissions, and user activity tracking',
    ctaLabel: 'Manage Staff',
    href: '/admin/staff-management',
    routePrefixes: ['/admin/staff-management'],
    accentClass: 'hover:border-sangeet-400/50',
    iconBgClass: 'bg-sangeet-400/20 group-hover:bg-sangeet-400/30',
  },
  {
    key: 'history',
    label: 'History & Archives',
    shortLabel: 'Order History',
    icon: '🗄️',
    badgeText: 'History',
    description: 'Browse archived records, search past orders, and view historical reservations',
    ctaLabel: 'Browse History',
    href: '/admin/history',
    routePrefixes: ['/admin/history'],
    accentClass: 'hover:border-sangeet-400/50',
    iconBgClass: 'bg-sangeet-400/20 group-hover:bg-sangeet-400/30',
  },
  {
    key: 'analytics',
    label: 'Analytics & Reports',
    shortLabel: 'Analytics',
    icon: '📊',
    badgeText: 'Analytics',
    description: 'View sales reports, order analytics, performance metrics, and business insights',
    ctaLabel: 'View Analytics',
    href: '/admin/analytics',
    routePrefixes: ['/admin/analytics'],
    accentClass: 'hover:border-sangeet-400/50',
    iconBgClass: 'bg-sangeet-400/20 group-hover:bg-sangeet-400/30',
  },
  {
    key: 'website',
    label: 'Restaurant Website',
    shortLabel: 'Website CMS',
    icon: '🌐',
    badgeText: 'Website',
    description: 'Manage your main restaurant website, menu display, and customer-facing content',
    ctaLabel: 'Manage Website',
    href: '/admin/website-management',
    routePrefixes: ['/admin/website-management'],
    accentClass: 'hover:border-sangeet-400/50',
    iconBgClass: 'bg-sangeet-400/20 group-hover:bg-sangeet-400/30',
  },
];

export const ALL_MODULE_KEYS: AdminModuleKey[] = ADMIN_MODULES.map((m) => m.key);

export type RoleTier = 'super_admin' | 'executive' | 'management' | 'operational';

export interface RoleDefinition {
  key: string;
  label: string;
  icon: string;
  description: string;
  tier: RoleTier;
  badgeColor: string; // e.g., 'purple' | 'amber' | 'emerald' | 'blue' | 'orange' | 'rose' | 'cyan'
  isSystem: boolean;
  permissions: AdminModuleKey[];
}

export const DEFAULT_SYSTEM_ROLES: Record<string, RoleDefinition> = {
  admin: {
    key: 'admin',
    label: 'Super Admin',
    icon: '👑',
    description: 'Full system authority, custom role creation & permission control',
    tier: 'super_admin',
    badgeColor: 'purple',
    isSystem: true,
    permissions: [...ALL_MODULE_KEYS],
  },
  gm: {
    key: 'gm',
    label: 'General Manager (GM)',
    icon: '🎩',
    description: 'Executive oversight across operations, analytics, staff & website',
    tier: 'executive',
    badgeColor: 'amber',
    isSystem: true,
    permissions: [
      'orders',
      'kitchen',
      'bar',
      'menu',
      'tables',
      'reservations',
      'staff',
      'history',
      'analytics',
      'website',
    ],
  },
  operations_manager: {
    key: 'operations_manager',
    label: 'Operations Manager',
    icon: '⚙️',
    description: 'Floor, kitchen, bar, menu, staff roster & operational analytics',
    tier: 'executive',
    badgeColor: 'emerald',
    isSystem: true,
    permissions: [
      'orders',
      'kitchen',
      'bar',
      'menu',
      'tables',
      'reservations',
      'staff',
      'history',
      'analytics',
    ],
  },
  manager: {
    key: 'manager',
    label: 'Manager',
    icon: '📋',
    description: 'Daily restaurant management, orders, menu, bookings & reports',
    tier: 'management',
    badgeColor: 'blue',
    isSystem: true,
    permissions: [
      'orders',
      'kitchen',
      'bar',
      'menu',
      'tables',
      'reservations',
      'history',
      'analytics',
    ],
  },
  assistant_manager: {
    key: 'assistant_manager',
    label: 'Assistant Manager',
    icon: '🤝',
    description: 'Shift supervision, live orders, reservations, tables & stations',
    tier: 'management',
    badgeColor: 'cyan',
    isSystem: true,
    permissions: ['orders', 'kitchen', 'bar', 'tables', 'reservations', 'history'],
  },
  bar_staff: {
    key: 'bar_staff',
    label: 'Bar Staff',
    icon: '🍷',
    description: 'Bar Order Tickets (BOT) display and active beverage orders',
    tier: 'operational',
    badgeColor: 'rose',
    isSystem: true,
    permissions: ['bar', 'orders'],
  },
  floor_staff: {
    key: 'floor_staff',
    label: 'Floor Staff',
    icon: '🍽️',
    description: 'Table service, live orders, reservations & QR table management',
    tier: 'operational',
    badgeColor: 'blue',
    isSystem: true,
    permissions: ['orders', 'tables', 'reservations', 'bar'],
  },
  kitchen: {
    key: 'kitchen',
    label: 'Kitchen Staff',
    icon: '🍳',
    description: 'Kitchen display (KOT) and food preparation queue',
    tier: 'operational',
    badgeColor: 'orange',
    isSystem: true,
    permissions: ['kitchen', 'bar'],
  },
  reception: {
    key: 'reception',
    label: 'Reception',
    icon: '🛎️',
    description: 'Guest bookings, table assignments, orders & order history',
    tier: 'operational',
    badgeColor: 'emerald',
    isSystem: true,
    permissions: ['orders', 'reservations', 'history', 'bar'],
  },
  waiter: {
    key: 'waiter',
    label: 'Waiter',
    icon: '🤵',
    description: 'Table service, dine-in orders & beverage status',
    tier: 'operational',
    badgeColor: 'blue',
    isSystem: true,
    permissions: ['orders', 'bar'],
  },
};

export const BADGE_COLOR_STYLES: Record<string, string> = {
  purple: 'bg-purple-400/20 text-purple-300 border border-purple-400/30',
  amber: 'bg-amber-400/20 text-amber-300 border border-amber-400/30',
  emerald: 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30',
  blue: 'bg-blue-400/20 text-blue-300 border border-blue-400/30',
  cyan: 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30',
  orange: 'bg-orange-400/20 text-orange-300 border border-orange-400/30',
  rose: 'bg-rose-400/20 text-rose-300 border border-rose-400/30',
};

export function isSuperAdminRole(role?: string | null): boolean {
  return role === 'admin';
}

export function normalizeRoleKey(rawName: string): string {
  return rawName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
}

export function resolveRolePermissions(
  role?: string | null,
  rolesCatalog: Record<string, RoleDefinition> = DEFAULT_SYSTEM_ROLES,
  explicitPermissions?: string[] | null
): AdminModuleKey[] {
  if (!role) return [];
  if (role === 'admin') {
    return [...ALL_MODULE_KEYS];
  }
  const roleDef = rolesCatalog[role] || DEFAULT_SYSTEM_ROLES[role];
  if (roleDef) {
    return roleDef.permissions.filter((p): p is AdminModuleKey =>
      ALL_MODULE_KEYS.includes(p as AdminModuleKey)
    );
  }
  if (Array.isArray(explicitPermissions) && explicitPermissions.length > 0) {
    return explicitPermissions.filter((p): p is AdminModuleKey =>
      ALL_MODULE_KEYS.includes(p as AdminModuleKey)
    );
  }
  return [];
}

export function hasModulePermission(
  user: { role?: string | null; permissions?: string[] | null } | null | undefined,
  moduleKey: AdminModuleKey,
  rolesCatalog: Record<string, RoleDefinition> = DEFAULT_SYSTEM_ROLES
): boolean {
  if (!user || !user.role) return false;
  if (user.role === 'admin') return true;
  if (Array.isArray(user.permissions)) {
    return user.permissions.includes(moduleKey);
  }
  const resolved = resolveRolePermissions(user.role, rolesCatalog);
  return resolved.includes(moduleKey);
}

export function getRequiredModuleForPathname(pathname: string): AdminModuleKey | 'dashboard' | null {
  if (pathname === '/admin' || pathname.startsWith('/admin/dashboard')) {
    return 'dashboard';
  }
  for (const mod of ADMIN_MODULES) {
    if (mod.routePrefixes.some((prefix) => pathname.startsWith(prefix))) {
      return mod.key;
    }
  }
  return null;
}

