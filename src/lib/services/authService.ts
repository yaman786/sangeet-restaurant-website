import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db';
import config from '@/lib/utils/env';
import { UnauthorizedError, NotFoundError, ConflictError, AppError } from '@/lib/errors';
import type { UserRow, UserInfo, UserRole, JwtPayload, PaginationQuery, PaginatedResult } from '@/lib/types';
import { registerSchema, RegisterInput } from '@/lib/validations/auth';

interface LoginInput {
  email?: string;
  username?: string;
  password: string;
}

class AuthService {
  async login(credentials: LoginInput) {
    const { email, username, password } = credentials;

    if (!email && !username) {
      throw new UnauthorizedError('Email or username is required');
    }

    const user = await prisma.users.findFirst({
      where: email ? { email } : { username }
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
      role: user.role as any,
      email: user.email
    };

    const token = jwt.sign(
      payload,
      config.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password_hash, ...userWithoutPassword } = user;

    return { token, user: userWithoutPassword };
  }

  async getProfile(userId: number): Promise<UserInfo> {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true, username: true, email: true, role: true,
        full_name: true, phone: true,
        is_active: true, created_at: true, updated_at: true
      }
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    return user as any;
  }

  async changePassword(userId: number, data: Record<string, any>): Promise<void> {
    const { currentPassword, newPassword } = data;

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

    const { page = 1, limit = 10, role, search, status } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = { deleted_at: null };
    
    if (role) where.role = role;
    if (status === 'active') where.is_active = true;
    else if (status === 'inactive') where.is_active = false;
    
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { first_name: { contains: search, mode: 'insensitive' } },
        { last_name: { contains: search, mode: 'insensitive' } },
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
        page: Number(page),
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
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existing) {
      throw new ConflictError('Username or email already exists');
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

  async updateUser(requesterRole: UserRole, userId: string, data: Record<string, any>): Promise<UserInfo> {
    if (requesterRole !== 'admin') {
      throw new UnauthorizedError('Only administrators can update users');
    }

    const { username, email, password, role, first_name, last_name, phone, is_active } = data;

    const existing = await prisma.users.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ],
        NOT: { id: parseInt(userId, 10) }
      }
    });

    if (existing) {
      throw new ConflictError('Username or email already exists');
    }

    const updateData: any = {
      username, email, role, first_name, last_name, 
      phone: phone || null, is_active, updated_at: new Date()
    };

    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updateData.password_hash = await bcrypt.hash(password, salt);
    }

    try {
      const user = await prisma.users.update({
        where: { id: parseInt(userId, 10) },
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
      throw e;
    }
  }

  async deleteUser(requesterId: number, requesterRole: UserRole, userId: string): Promise<void> {
    if (requesterRole !== 'admin') {
      throw new UnauthorizedError('Only administrators can delete users');
    }

    if (requesterId.toString() === userId) {
      throw new ConflictError('You cannot delete your own account');
    }

    const result = await prisma.users.updateMany({
      where: { id: parseInt(userId, 10), deleted_at: null },
      data: { deleted_at: new Date(), is_active: false }
    });

    if (result.count === 0) {
      throw new NotFoundError('User');
    }
  }

  async toggleUserStatus(requesterId: number, requesterRole: UserRole, userId: string): Promise<{ status: string, user: UserInfo }> {
    if (requesterRole !== 'admin') {
      throw new UnauthorizedError('Only administrators can update users');
    }

    if (requesterId.toString() === userId) {
      throw new ConflictError('You cannot disable your own account');
    }

    const existing = await prisma.users.findFirst({
      where: { id: parseInt(userId, 10), deleted_at: null }
    });

    if (!existing) {
      throw new NotFoundError('User');
    }

    const user = await prisma.users.update({
      where: { id: parseInt(userId, 10) },
      data: { is_active: !existing.is_active, updated_at: new Date() },
      select: { id: true, username: true, email: true, role: true, is_active: true }
    });

    return {
      status: user.is_active ? 'enabled' : 'disabled',
      user: user as any
    };
  }

  async getUserStats(requesterRole: UserRole): Promise<Record<string, number>> {
    if (requesterRole !== 'admin') {
      throw new UnauthorizedError('Only administrators can view stats');
    }

    const users = await prisma.users.findMany({
      where: { deleted_at: null },
      select: { is_active: true, role: true }
    });

    return {
      total_users: users.length,
      active_users: users.filter(u => u.is_active).length,
      admin_users: users.filter(u => u.role === 'admin').length,
      kitchen_users: users.filter(u => u.role === 'kitchen').length,
      reception_users: users.filter(u => u.role === 'reception').length,
      waiter_users: users.filter(u => u.role === 'waiter').length
    };
  }
}

export default new AuthService();
