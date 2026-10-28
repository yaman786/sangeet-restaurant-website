import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db';
import config from '@/lib/utils/env';
import logger from '@/lib/utils/logger';
import { UnauthorizedError, NotFoundError, ConflictError, AppError, ValidationError } from '@/lib/errors';
import type { UserInfo, UserRole, JwtPayload, PaginationQuery, PaginatedResult, ChangePasswordDTO, UpdateUserDTO, UserStats } from '@/lib/types';
import { registerSchema, updateUserSchema, changePasswordSchema } from '@/lib/validations/auth';

const MAX_PAGE_SIZE = 100;
const RECENT_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

interface LoginInput {
  email?: string;
  username?: string;
  password: string;
}

class AuthService {
  async login(credentials: LoginInput) {
    const { email, username, password } = credentials;
    const identifier = (username || email || '').trim();

    if (!identifier) {
      throw new UnauthorizedError('Email or username is required');
    }

    const user = await prisma.users.findFirst({
      where: {
        deleted_at: null,
        OR: [
          { username: { equals: identifier, mode: 'insensitive' } },
          { email: { equals: identifier, mode: 'insensitive' } }
        ]
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

    const payload: JwtPayload = {
      id: user.id,
      username: user.username,
      role: user.role as UserRole,
      email: user.email
    };

    const token = jwt.sign(
      payload,
      config.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password_hash: _passwordHash, ...userWithoutPassword } = user;

    return { token, user: userWithoutPassword };
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

    return user as unknown as UserInfo;
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

  async getAllUsers(requesterRole: UserRole, query: PaginationQuery & { role?: string; search?: string; status?: string }): Promise<PaginatedResult<UserInfo>> {
    if (requesterRole !== 'admin') {
      throw new UnauthorizedError('Only administrators can view all users');
    }

    const { role, search, status } = query;
    const page = Math.max(1, Number.parseInt(String(query.page ?? 1), 10) || 1);
    const take = Math.min(MAX_PAGE_SIZE, Math.max(1, Number.parseInt(String(query.limit ?? 10), 10) || 10));
    const skip = (page - 1) * take;

    const where: any = { deleted_at: null };
    
    if (role) where.role = role;
    if (status === 'active') where.is_active = true;
    else if (status === 'inactive') where.is_active = false;
    
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { full_name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await prisma.$transaction([
      prisma.users.count({ where }),
      prisma.users.findMany({
        where,
        select: {
          id: true, username: true, email: true, role: true,
          full_name: true, phone: true,
          is_active: true, created_at: true, updated_at: true
        },
        orderBy: { created_at: 'desc' },
        skip,
        take
      })
    ]);

    return {
      data: users as any[],
      metadata: {
        total,
        page,
        totalPages: Math.ceil(total / take),
        limit: take
      }
    };
  }

  async createUser(requesterRole: UserRole, data: any): Promise<UserInfo> {
    if (requesterRole !== 'admin') {
      throw new UnauthorizedError('Only administrators can create users');
    }

    const validatedData = registerSchema.parse(data);
    const { username, email, password, role = 'waiter', full_name, phone } = validatedData;

    const existing = await prisma.users.findFirst({
      where: {
        deleted_at: null,
        OR: [
          { username: { equals: username, mode: 'insensitive' } },
          { email: { equals: email, mode: 'insensitive' } }
        ]
      }
    });

    if (existing) {
      throw new ConflictError('Username or email already exists');
    }

    // Free any legacy soft-deleted rows that still hold the unique username/email
    const staleDeleted = await prisma.users.findMany({
      where: {
        deleted_at: { not: null },
        OR: [
          { username: { equals: username, mode: 'insensitive' } },
          { email: { equals: email, mode: 'insensitive' } }
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
        username,
        email,
        password_hash: passwordHash,
        role,
        full_name,
        phone: phone || null
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
    if (requesterRole !== 'admin') {
      throw new UnauthorizedError('Only administrators can update users');
    }

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

    const target = await prisma.users.findFirst({ where: { id: targetId, deleted_at: null } });
    if (!target) {
      throw new NotFoundError('User');
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

    const identityConditions: Array<{ username: { equals: string; mode: 'insensitive' } } | { email: { equals: string; mode: 'insensitive' } }> = [];
    if (parsed.username) identityConditions.push({ username: { equals: parsed.username, mode: 'insensitive' } });
    if (parsed.email) identityConditions.push({ email: { equals: parsed.email, mode: 'insensitive' } });
    if (identityConditions.length > 0) {
      const conflict = await prisma.users.findFirst({
        where: { deleted_at: null, OR: identityConditions, NOT: { id: targetId } }
      });
      if (conflict) {
        throw new ConflictError('Username or email already exists');
      }
    }

    const updateData: any = {
      username: parsed.username,
      email: parsed.email,
      role: parsed.role,
      full_name: parsed.full_name,
      is_active: parsed.is_active,
      phone: parsed.phone === undefined ? undefined : (parsed.phone || null),
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

  async deleteUser(requesterId: number, requesterRole: UserRole, userId: string): Promise<void> {
    if (requesterRole !== 'admin') {
      throw new UnauthorizedError('Only administrators can delete users');
    }

    const targetId = this.parseUserId(userId);

    if (requesterId === targetId) {
      throw new ConflictError('You cannot delete your own account');
    }

    const target = await prisma.users.findFirst({ where: { id: targetId, deleted_at: null } });
    if (!target) {
      throw new NotFoundError('User');
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

  async toggleUserStatus(requesterId: number, requesterRole: UserRole, userId: string): Promise<{ status: string, user: UserInfo }> {
    if (requesterRole !== 'admin') {
      throw new UnauthorizedError('Only administrators can update users');
    }

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
    if (requesterRole !== 'admin') {
      throw new UnauthorizedError('Only administrators can view stats');
    }

    const users = await prisma.users.findMany({
      where: { deleted_at: null },
      select: { is_active: true, role: true, created_at: true }
    });

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
      roles
    };
  }

  async requestPasswordReset(identifier: string): Promise<{ message: string }> {
    const trimmed = (identifier || '').trim();
    if (!trimmed) {
      throw new ValidationError('Username or email is required');
    }

    const user = await prisma.users.findFirst({
      where: {
        OR: [
          { email: { equals: trimmed, mode: 'insensitive' } },
          { username: { equals: trimmed, mode: 'insensitive' } }
        ],
        deleted_at: null
      }
    });

    if (user) {
      logger.info(`Password reset assistance requested for user ID ${user.id} (${user.username})`);
    }

    return {
      message: 'Password reset request received. If an account matches those details, it has been logged for the on-duty Administrator in Staff Management, or contact management at info@sangeet.hk.'
    };
  }
}

export default new AuthService();
