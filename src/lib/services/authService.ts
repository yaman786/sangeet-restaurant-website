import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db';
import config from '@/lib/utils/env';
import logger from '@/lib/utils/logger';
import { UnauthorizedError, NotFoundError, ConflictError, AppError, ValidationError } from '@/lib/errors';
import type { UserInfo, UserRole, JwtPayload, PaginationQuery, PaginatedResult, ChangePasswordDTO, UpdateUserDTO, UserStats } from '@/lib/types';
import { registerSchema, updateUserSchema, changePasswordSchema, passwordSchema } from '@/lib/validations/auth';
import rbacService from '@/lib/services/rbacService';
import { sendSuperAdminOtpEmail } from '@/lib/utils/emailService';

const SUPER_ADMIN_OTP_SETTING_KEY = 'super_admin_reset_otp';
const SUPER_ADMIN_OTP_TTL_MS = 10 * 60 * 1000;
const SUPER_ADMIN_OTP_MAX_ATTEMPTS = 5;
const DEFAULT_SUPER_ADMIN_RECOVERY_KEY = 'SangeetMasterRecovery!2026';

const MAX_PAGE_SIZE = 100;
const RECENT_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

interface LoginInput {
  email?: string;
  username?: string;
  password: string;
}

class AuthService {
  private async assertCanManageStaff(requesterRole: UserRole): Promise<void> {
    if (requesterRole === 'admin') return;
    const perms = await rbacService.getPermissionsForRole(requesterRole);
    if (!perms.includes('staff')) {
      throw new UnauthorizedError('Only administrators or authorized managers can manage staff');
    }
  }

  private async assertValidRoleKey(roleKey: string): Promise<void> {
    const catalog = await rbacService.getRolesCatalog();
    if (!catalog[roleKey]) {
      throw new ValidationError('Invalid role');
    }
  }

  private normalizePhone(raw?: string | null): string | null {
    if (!raw) return null;
    const cleaned = raw.trim().replace(/[\s\-().]/g, '');
    return cleaned.length > 0 ? cleaned.slice(0, 20) : null;
  }

  private getPhoneLookupVariants(input: string): string[] {
    const trimmed = input.trim();
    if (!trimmed) return [];
    const stripped = trimmed.replace(/[\s\-().]/g, '');
    const digitsOnly = stripped.replace(/\D/g, '');
    if (digitsOnly.length < 6) return [];

    const variants = new Set<string>([trimmed, stripped, digitsOnly, `+${digitsOnly}`]);
    if (digitsOnly.startsWith('852') && digitsOnly.length > 8) {
      const localHk = digitsOnly.slice(3);
      variants.add(localHk);
      variants.add(`+852${localHk}`);
      variants.add(`+852 ${localHk}`);
    } else if (digitsOnly.length === 8) {
      variants.add(`+852${digitsOnly}`);
      variants.add(`852${digitsOnly}`);
      variants.add(`+852 ${digitsOnly}`);
    }
    return Array.from(variants).filter((v) => v.length <= 20);
  }

  private async generateUniqueUsername(fullName: string, phone?: string | null): Promise<string> {
    const baseName = fullName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 28) || 'staff';
    const digits = (phone || '').replace(/\D/g, '');
    const tail = digits.slice(-4) || Math.floor(1000 + Math.random() * 9000).toString();
    const candidateBase = `${baseName}_${tail}`.slice(0, 42);

    for (let attempt = 0; attempt < 20; attempt++) {
      const candidate = attempt === 0 ? candidateBase : `${candidateBase}_${attempt + 1}`;
      const exists = await prisma.users.findFirst({
        where: { username: { equals: candidate, mode: 'insensitive' } },
        select: { id: true }
      });
      if (!exists) return candidate;
    }

    return `staff_${Date.now().toString(36)}`;
  }

  async login(credentials: LoginInput) {
    const { email, username, password } = credentials;
    const identifier = (username || email || '').trim();

    if (!identifier) {
      throw new UnauthorizedError('Mobile number, email, or username is required');
    }

    const phoneVariants = this.getPhoneLookupVariants(identifier);
    const orConditions: any[] = [
      { username: { equals: identifier, mode: 'insensitive' } },
      { email: { equals: identifier, mode: 'insensitive' } }
    ];
    if (phoneVariants.length > 0) {
      orConditions.push({ phone: { in: phoneVariants } });
    }

    const user = await prisma.users.findFirst({
      where: {
        deleted_at: null,
        OR: orConditions
      }
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.is_active) {
      throw new UnauthorizedError('Account is disabled');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!config.JWT_SECRET) {
      throw new AppError('JWT_SECRET is not configured', 500);
    }

    const permissions = await rbacService.getPermissionsForRole(user.role);
    const isSuperAdmin = user.role === 'admin';

    const payload: JwtPayload = {
      id: user.id,
      username: user.username,
      role: user.role as UserRole,
      email: user.email,
      permissions,
      is_super_admin: isSuperAdmin
    };

    const token = jwt.sign(
      payload,
      config.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password_hash: _passwordHash, ...userWithoutPassword } = user;

    return {
      token,
      user: {
        ...userWithoutPassword,
        permissions,
        is_super_admin: isSuperAdmin
      }
    };
  }

  async getProfile(userId: number): Promise<UserInfo> {
    const user = await prisma.users.findFirst({
      where: { id: userId, deleted_at: null },
      select: {
        id: true, username: true, email: true, role: true,
        full_name: true, phone: true,
        is_active: true, created_at: true, updated_at: true
      }
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    const permissions = await rbacService.getPermissionsForRole(user.role);

    return {
      ...user,
      permissions,
      is_super_admin: user.role === 'admin'
    } as unknown as UserInfo;
  }

  async changePassword(userId: number, data: ChangePasswordDTO): Promise<void> {
    const { currentPassword, newPassword } = changePasswordSchema.parse(data);

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { password_hash: true }
    });

    if (!user) {
      throw new NotFoundError('User');
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isMatch) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await prisma.users.update({
      where: { id: userId },
      data: {
        password_hash: newPasswordHash,
        updated_at: new Date()
      }
    });
  }

  private stripTombstoneUsername(username: string): string {
    return username.replace(/(__del(?:_\d+)+)+$/, '');
  }

  private stripTombstoneEmail(email: string): string {
    return email.replace(/^(del_(?:\d+_)+)+/, '');
  }

  async getAllUsers(requesterRole: UserRole, query: PaginationQuery & { role?: string; search?: string; status?: string }): Promise<PaginatedResult<UserInfo>> {
    await this.assertCanManageStaff(requesterRole);

    const { role, search, status } = query;
    const page = Math.max(1, Number.parseInt(String(query.page ?? 1), 10) || 1);
    const take = Math.min(MAX_PAGE_SIZE, Math.max(1, Number.parseInt(String(query.limit ?? 10), 10) || 10));
    const skip = (page - 1) * take;

    const isArchivedView = status === 'archived';
    const where: any = isArchivedView ? { deleted_at: { not: null } } : { deleted_at: null };

    // Stealth Root Mode: Non-Super Admins (e.g. GM, Operations Manager) never see Super Admin accounts
    if (requesterRole !== 'admin') {
      if (role === 'admin') {
        return {
          data: [],
          metadata: { total: 0, page, totalPages: 0, limit: take }
        };
      }
      where.NOT = { role: 'admin' };
    }

    if (role) where.role = role;
    if (!isArchivedView) {
      if (status === 'active') where.is_active = true;
      else if (status === 'inactive') where.is_active = false;
    }
    
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { full_name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await prisma.$transaction([
      prisma.users.count({ where }),
      prisma.users.findMany({
        where,
        select: {
          id: true, username: true, email: true, role: true,
          full_name: true, phone: true,
          is_active: true, created_at: true, updated_at: true, deleted_at: true
        },
        orderBy: isArchivedView ? { deleted_at: 'desc' } : { created_at: 'desc' },
        skip,
        take
      })
    ]);

    const normalizedUsers = users.map((u) =>
      u.deleted_at
        ? {
            ...u,
            username: this.stripTombstoneUsername(u.username),
            email: this.stripTombstoneEmail(u.email)
          }
        : u
    );

    return {
      data: normalizedUsers as any[],
      metadata: {
        total,
        page,
        totalPages: Math.ceil(total / take),
        limit: take
      }
    };
  }

  async createUser(requesterRole: UserRole, data: any): Promise<UserInfo> {
    await this.assertCanManageStaff(requesterRole);

    const validatedData = registerSchema.parse(data);
    const { username, email, password, role = 'waiter', full_name, phone } = validatedData;
    const normalizedPhone = this.normalizePhone(phone);

    await this.assertValidRoleKey(role);

    if (role === 'admin') {
      throw new ConflictError('Only one Super Admin is permitted in the system. Assign General Manager (GM) for executive access.');
    }

    if (!username && !normalizedPhone) {
      throw new ValidationError('Mobile number is required');
    }

    const conflictChecks: any[] = [];
    if (username) {
      conflictChecks.push({ username: { equals: username, mode: 'insensitive' } });
    }
    if (email) {
      conflictChecks.push({ email: { equals: email, mode: 'insensitive' } });
    }
    if (normalizedPhone) {
      const phoneVariants = this.getPhoneLookupVariants(normalizedPhone);
      if (phoneVariants.length > 0) {
        conflictChecks.push({ phone: { in: phoneVariants } });
      }
    }

    if (conflictChecks.length > 0) {
      const existing = await prisma.users.findFirst({
        where: {
          deleted_at: null,
          OR: conflictChecks
        }
      });

      if (existing) {
        throw new ConflictError('Username, mobile number, or email already exists');
      }
    }

    const resolvedUsername = username || (await this.generateUniqueUsername(full_name, normalizedPhone));
    const resolvedEmail = email || `${resolvedUsername}@staff.sangeet.local`;

    // Free any legacy soft-deleted rows that still hold the unique username/email
    const staleDeleted = await prisma.users.findMany({
      where: {
        deleted_at: { not: null },
        OR: [
          { username: { equals: resolvedUsername, mode: 'insensitive' } },
          { email: { equals: resolvedEmail, mode: 'insensitive' } }
        ]
      },
      select: { id: true, username: true, email: true }
    });
    for (const stale of staleDeleted) {
      const suffix = `__del_${stale.id}_${Date.now()}`;
      await prisma.users.update({
        where: { id: stale.id },
        data: {
          username: `${stale.username}${suffix}`.slice(0, 50),
          email: `del_${stale.id}_${Date.now()}_${stale.email}`
        }
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.users.create({
      data: {
        username: resolvedUsername,
        email: resolvedEmail,
        password_hash: passwordHash,
        role,
        full_name,
        phone: normalizedPhone
      },
      select: {
        id: true, username: true, email: true, role: true,
        full_name: true, phone: true,
        is_active: true, created_at: true
      }
    });

    return user as any;
  }

  private parseUserId(userId: string): number {
    const id = Number.parseInt(userId, 10);
    if (!Number.isInteger(id) || id <= 0) {
      throw new ValidationError('Invalid user ID');
    }
    return id;
  }

  /**
   * Guarantees the system always keeps at least one active, non-deleted admin
   * once `excludingId` is removed from the admin pool.
   */
  private async assertAnotherActiveAdminExists(excludingId: number): Promise<void> {
    const remaining = await prisma.users.count({
      where: { role: 'admin', is_active: true, deleted_at: null, NOT: { id: excludingId } }
    });
    if (remaining === 0) {
      throw new ConflictError('At least one active administrator is required');
    }
  }

  async updateUser(requesterId: number, requesterRole: UserRole, userId: string, data: UpdateUserDTO): Promise<UserInfo> {
    await this.assertCanManageStaff(requesterRole);

    const targetId = this.parseUserId(userId);

    // Support either full_name or legacy first_name + last_name payloads
    const { first_name, last_name, ...rest } = data;
    const legacyFullName = first_name || last_name
      ? [first_name, last_name].filter(Boolean).join(' ')
      : undefined;
    const parsed = updateUserSchema.parse({
      ...rest,
      full_name: rest.full_name ?? legacyFullName,
      password: rest.password && rest.password.trim() !== '' ? rest.password : undefined
    });

    if (parsed.role) {
      await this.assertValidRoleKey(parsed.role);
    }

    const target = await prisma.users.findFirst({ where: { id: targetId, deleted_at: null } });
    if (!target) {
      throw new NotFoundError('User');
    }

    if (target.role === 'admin' && requesterRole !== 'admin') {
      throw new UnauthorizedError('Only Super Admin can modify a Super Admin account');
    }

    if (parsed.role === 'admin' && target.role !== 'admin') {
      throw new ConflictError('Cannot promote another account to Super Admin. Only one Super Admin is permitted.');
    }

    const isSelf = requesterId === targetId;
    if (isSelf && parsed.role && parsed.role !== target.role) {
      throw new ConflictError('You cannot change your own role');
    }
    if (isSelf && parsed.is_active === false) {
      throw new ConflictError('You cannot disable your own account');
    }

    const losesAdminAccess = target.role === 'admin' && target.is_active !== false &&
      ((parsed.role !== undefined && parsed.role !== 'admin') || parsed.is_active === false);
    if (losesAdminAccess) {
      await this.assertAnotherActiveAdminExists(targetId);
    }

    const normalizedPhone = parsed.phone !== undefined ? this.normalizePhone(parsed.phone) : undefined;
    const identityConditions: any[] = [];
    if (parsed.username) identityConditions.push({ username: { equals: parsed.username, mode: 'insensitive' } });
    if (parsed.email) identityConditions.push({ email: { equals: parsed.email, mode: 'insensitive' } });
    if (normalizedPhone) {
      const phoneVariants = this.getPhoneLookupVariants(normalizedPhone);
      if (phoneVariants.length > 0) {
        identityConditions.push({ phone: { in: phoneVariants } });
      }
    }
    if (identityConditions.length > 0) {
      const conflict = await prisma.users.findFirst({
        where: { deleted_at: null, OR: identityConditions, NOT: { id: targetId } }
      });
      if (conflict) {
        throw new ConflictError('Username, mobile number, or email already exists');
      }
    }

    const resolvedEmailUpdate =
      data.email !== undefined && String(data.email).trim() === ''
        ? `${parsed.username || target.username}@staff.sangeet.local`
        : parsed.email;

    const updateData: any = {
      username: parsed.username,
      email: resolvedEmailUpdate,
      role: parsed.role,
      full_name: parsed.full_name,
      is_active: parsed.is_active,
      phone: normalizedPhone,
      updated_at: new Date()
    };

    if (parsed.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password_hash = await bcrypt.hash(parsed.password, salt);
    }

    try {
      const user = await prisma.users.update({
        where: { id: targetId },
        data: updateData,
        select: {
          id: true, username: true, email: true, role: true,
          full_name: true, phone: true,
          is_active: true, created_at: true, updated_at: true
        }
      });
      return user as any;
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundError('User');
      if (e.code === 'P2002') throw new ConflictError('Username or email already exists');
      throw e;
    }
  }

  async deleteUser(requesterId: number, requesterRole: UserRole, userId: string, permanent = false): Promise<void> {
    await this.assertCanManageStaff(requesterRole);

    const targetId = this.parseUserId(userId);

    if (requesterId === targetId) {
      throw new ConflictError('You cannot delete your own account');
    }

    if (permanent) {
      const target = await prisma.users.findUnique({ where: { id: targetId } });
      if (!target) {
        throw new NotFoundError('User');
      }
      if (target.role === 'admin' && requesterRole !== 'admin') {
        throw new UnauthorizedError('Only Super Admin can delete a Super Admin account');
      }
      if (target.deleted_at === null && target.role === 'admin' && target.is_active !== false) {
        await this.assertAnotherActiveAdminExists(targetId);
      }
      await prisma.users.delete({ where: { id: targetId } });
      return;
    }

    const target = await prisma.users.findFirst({ where: { id: targetId, deleted_at: null } });
    if (!target) {
      throw new NotFoundError('User');
    }

    if (target.role === 'admin' && requesterRole !== 'admin') {
      throw new UnauthorizedError('Only Super Admin can archive a Super Admin account');
    }

    if (target.role === 'admin' && target.is_active !== false) {
      await this.assertAnotherActiveAdminExists(targetId);
    }

    const tombstone = `__del_${Date.now()}`;
    const result = await prisma.users.updateMany({
      where: { id: targetId, deleted_at: null },
      data: {
        deleted_at: new Date(),
        is_active: false,
        username: `${target.username}${tombstone}`.slice(0, 50),
        email: `del_${Date.now()}_${target.email}`,
        updated_at: new Date()
      }
    });

    if (result.count === 0) {
      throw new NotFoundError('User');
    }
  }

  async restoreUser(requesterRole: UserRole, userId: string): Promise<UserInfo> {
    await this.assertCanManageStaff(requesterRole);

    const targetId = this.parseUserId(userId);
    const target = await prisma.users.findFirst({
      where: { id: targetId, deleted_at: { not: null } }
    });

    if (!target) {
      throw new NotFoundError('Archived user');
    }

    if (target.role === 'admin' && requesterRole !== 'admin') {
      throw new UnauthorizedError('Only Super Admin can restore a Super Admin account');
    }

    const restoredUsername = this.stripTombstoneUsername(target.username);
    const restoredEmail = this.stripTombstoneEmail(target.email);

    const conflict = await prisma.users.findFirst({
      where: {
        deleted_at: null,
        NOT: { id: targetId },
        OR: [
          { username: { equals: restoredUsername, mode: 'insensitive' } },
          { email: { equals: restoredEmail, mode: 'insensitive' } }
        ]
      }
    });

    if (conflict) {
      throw new ConflictError('Cannot restore: username or email is already in use by an active account');
    }

    const restored = await prisma.users.update({
      where: { id: targetId },
      data: {
        deleted_at: null,
        is_active: true,
        username: restoredUsername,
        email: restoredEmail,
        updated_at: new Date()
      },
      select: {
        id: true, username: true, email: true, role: true,
        full_name: true, phone: true,
        is_active: true, created_at: true, updated_at: true, deleted_at: true
      }
    });

    return restored as any;
  }

  async toggleUserStatus(requesterId: number, requesterRole: UserRole, userId: string): Promise<{ status: string, user: UserInfo }> {
    await this.assertCanManageStaff(requesterRole);

    const targetId = this.parseUserId(userId);

    if (requesterId === targetId) {
      throw new ConflictError('You cannot disable your own account');
    }

    const existing = await prisma.users.findFirst({
      where: { id: targetId, deleted_at: null }
    });

    if (!existing) {
      throw new NotFoundError('User');
    }

    if (existing.role === 'admin' && requesterRole !== 'admin') {
      throw new UnauthorizedError('Only Super Admin can enable or disable a Super Admin account');
    }

    if (existing.role === 'admin' && existing.is_active !== false) {
      await this.assertAnotherActiveAdminExists(targetId);
    }

    const user = await prisma.users.update({
      where: { id: targetId },
      data: { is_active: !existing.is_active, updated_at: new Date() },
      select: { id: true, username: true, email: true, role: true, is_active: true }
    });

    return {
      status: user.is_active ? 'enabled' : 'disabled',
      user: user as any
    };
  }

  async getUserStats(requesterRole: UserRole): Promise<UserStats> {
    await this.assertCanManageStaff(requesterRole);

    const hideSuperAdmin = requesterRole !== 'admin';
    const baseFilter = hideSuperAdmin ? { NOT: { role: 'admin' } } : {};

    const [users, archived] = await prisma.$transaction([
      prisma.users.findMany({
        where: { deleted_at: null, ...baseFilter },
        select: { is_active: true, role: true, created_at: true }
      }),
      prisma.users.count({
        where: { deleted_at: { not: null }, ...baseFilter }
      })
    ]);

    const recentCutoff = Date.now() - RECENT_WINDOW_MS;
    const roles: Record<string, number> = {};
    for (const u of users) {
      roles[u.role] = (roles[u.role] || 0) + 1;
    }

    const active = users.filter(u => u.is_active).length;
    const admins = roles.admin || 0;

    return {
      total: users.length,
      active,
      inactive: users.length - active,
      admins,
      staff: users.length - admins,
      recent: users.filter(u => u.created_at && u.created_at.getTime() >= recentCutoff).length,
      archived,
      roles
    };
  }

  async requestPasswordReset(identifier: string): Promise<{ message: string; isSuperAdmin?: boolean }> {
    const trimmed = (identifier || '').trim();
    if (!trimmed) {
      throw new ValidationError('Username or email is required');
    }

    const phoneVariants = this.getPhoneLookupVariants(trimmed);
    const resetOrConditions: any[] = [
      { email: { equals: trimmed, mode: 'insensitive' } },
      { username: { equals: trimmed, mode: 'insensitive' } }
    ];
    if (phoneVariants.length > 0) {
      resetOrConditions.push({ phone: { in: phoneVariants } });
    }

    const user = await prisma.users.findFirst({
      where: {
        OR: resetOrConditions,
        deleted_at: null
      }
    });

    if (user) {
      logger.info(`Password reset assistance requested for user ID ${user.id} (${user.username})`);

      if (user.role === 'admin') {
        const otpCode = crypto.randomInt(100000, 1000000).toString();
        const otpHash = await bcrypt.hash(otpCode, 10);
        const payload = JSON.stringify({
          otpHash,
          expiresAt: Date.now() + SUPER_ADMIN_OTP_TTL_MS,
          attempts: 0
        });

        await prisma.restaurant_settings.upsert({
          where: { setting_key: SUPER_ADMIN_OTP_SETTING_KEY },
          update: {
            setting_value: payload,
            setting_type: 'json',
            updated_at: new Date()
          },
          create: {
            setting_key: SUPER_ADMIN_OTP_SETTING_KEY,
            setting_value: payload,
            setting_type: 'json',
            description: 'Temporary 6-digit OTP for Super Admin self-recovery'
          }
        });

        await sendSuperAdminOtpEmail(user.email, otpCode, user.username);
      }
    }

    return {
      message: 'Password reset request received. If an account matches those details, it has been logged for the on-duty Administrator in Staff Management, or contact management at info@sangeet.hk.',
      isSuperAdmin: user?.role === 'admin'
    };
  }

  async resetSuperAdminPassword(input: {
    method: 'otp' | 'recovery_key';
    code: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    const method = input?.method === 'recovery_key' ? 'recovery_key' : 'otp';
    const trimmedCode = (input?.code || '').trim();
    const rawPassword = input?.newPassword || '';

    if (!trimmedCode) {
      throw new ValidationError(
        method === 'recovery_key'
          ? 'Master Recovery Key is required'
          : '6-digit verification code is required'
      );
    }

    const parsedPassword = passwordSchema.safeParse(rawPassword);
    if (!parsedPassword.success) {
      throw new ValidationError(parsedPassword.error.issues[0]?.message || 'Invalid new password');
    }

    const superAdmin = await prisma.users.findFirst({
      where: { role: 'admin', deleted_at: null }
    });

    if (!superAdmin) {
      throw new NotFoundError('Super Admin account');
    }

    if (method === 'recovery_key') {
      const configuredKey = (process.env.SUPER_ADMIN_RECOVERY_KEY || DEFAULT_SUPER_ADMIN_RECOVERY_KEY).trim();
      const inputDigest = crypto.createHash('sha256').update(trimmedCode).digest();
      const expectedDigest = crypto.createHash('sha256').update(configuredKey).digest();

      if (!crypto.timingSafeEqual(inputDigest, expectedDigest)) {
        throw new UnauthorizedError('Invalid Master Recovery Key');
      }
    } else {
      const otpSetting = await prisma.restaurant_settings.findUnique({
        where: { setting_key: SUPER_ADMIN_OTP_SETTING_KEY }
      });

      if (!otpSetting?.setting_value) {
        throw new UnauthorizedError('No active OTP found. Please request a new 6-digit OTP first.');
      }

      let stored: { otpHash: string; expiresAt: number; attempts: number };
      try {
        stored = JSON.parse(otpSetting.setting_value);
      } catch {
        throw new UnauthorizedError('Invalid or expired 6-digit OTP code');
      }

      if (!stored.otpHash || Date.now() > stored.expiresAt || stored.attempts >= SUPER_ADMIN_OTP_MAX_ATTEMPTS) {
        await prisma.restaurant_settings.deleteMany({
          where: { setting_key: SUPER_ADMIN_OTP_SETTING_KEY }
        });
        throw new UnauthorizedError('OTP has expired or exceeded maximum attempts. Please request a new code.');
      }

      const isOtpMatch = await bcrypt.compare(trimmedCode, stored.otpHash);
      if (!isOtpMatch) {
        const nextAttempts = (stored.attempts || 0) + 1;
        await prisma.restaurant_settings.update({
          where: { setting_key: SUPER_ADMIN_OTP_SETTING_KEY },
          data: {
            setting_value: JSON.stringify({ ...stored, attempts: nextAttempts }),
            updated_at: new Date()
          }
        });
        throw new UnauthorizedError('Invalid 6-digit OTP verification code');
      }
    }

    const password_hash = await bcrypt.hash(parsedPassword.data, 10);

    await prisma.users.update({
      where: { id: superAdmin.id },
      data: {
        password_hash,
        is_active: true,
        updated_at: new Date()
      }
    });

    await prisma.restaurant_settings.deleteMany({
      where: { setting_key: SUPER_ADMIN_OTP_SETTING_KEY }
    });

    logger.info(`Super Admin password reset completed via ${method} for user ID ${superAdmin.id} (${superAdmin.username})`);

    return {
      message: 'Super Admin password has been reset successfully. You can now sign in with your new password.'
    };
  }
}

export default new AuthService();
