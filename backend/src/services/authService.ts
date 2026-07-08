import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import config from '../config/env';
import { UnauthorizedError, NotFoundError, ConflictError, AppError } from '../utils/errors';
import type { UserRow, UserInfo, UserRole, JwtPayload, PaginationQuery, PaginatedResult } from '../types';

class AuthService {
  async login(credentials: Record<string, any>) {
    const { email, username, password } = credentials;

    let query = '';
    let params: any[] = [];

    if (email) {
      query = 'SELECT * FROM users WHERE email = $1';
      params = [email];
    } else if (username) {
      query = 'SELECT * FROM users WHERE username = $1';
      params = [username];
    } else {
      throw new UnauthorizedError('Email or username is required');
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const user: UserRow = result.rows[0];

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
      role: user.role,
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
    const result = await pool.query(
      'SELECT id, username, email, role, first_name, last_name, phone, is_active, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('User');
    }

    return result.rows[0];
  }

  async changePassword(userId: number, data: Record<string, any>): Promise<void> {
    const { currentPassword, newPassword } = data;

    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);

    if (result.rows.length === 0) {
      throw new NotFoundError('User');
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isMatch) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, userId]
    );
  }

  async getAllUsers(requesterRole: UserRole, query: PaginationQuery & { role?: string; search?: string; status?: string }): Promise<PaginatedResult<UserInfo>> {
    if (requesterRole !== 'admin') {
      throw new UnauthorizedError('Only administrators can view all users');
    }

    const { page = 1, limit = 10, role, search, status } = query;
    const offset = (Number(page) - 1) * Number(limit);
    
    let whereClause = 'WHERE deleted_at IS NULL';
    const params: any[] = [];
    let paramIndex = 1;

    if (role) {
      whereClause += ` AND role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }

    if (status === 'active') {
      whereClause += ` AND is_active = true`;
    } else if (status === 'inactive') {
      whereClause += ` AND is_active = false`;
    }

    if (search) {
      whereClause += ` AND (username ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await pool.query(`SELECT COUNT(*) FROM users ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count, 10);

    const queryStr = `
      SELECT id, username, email, role, first_name, last_name, phone, is_active, created_at, updated_at 
      FROM users 
      ${whereClause} 
      ORDER BY created_at DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    params.push(limit, offset);
    const result = await pool.query(queryStr, params);

    return {
      data: result.rows,
      metadata: {
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    };
  }

  async createUser(requesterRole: UserRole, data: Record<string, any>): Promise<UserInfo> {
    if (requesterRole !== 'admin') {
      throw new UnauthorizedError('Only administrators can create users');
    }

    const { username, email, password, role = 'waiter', first_name, last_name, phone } = data;

    const existingResult = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingResult.rows.length > 0) {
      throw new ConflictError('Username or email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, role, first_name, last_name, phone) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, username, email, role, first_name, last_name, phone, is_active, created_at`,
      [username, email, passwordHash, role, first_name, last_name, phone || null]
    );

    return result.rows[0];
  }

  async updateUser(requesterRole: UserRole, userId: string, data: Record<string, any>): Promise<UserInfo> {
    if (requesterRole !== 'admin') {
      throw new UnauthorizedError('Only administrators can update users');
    }

    const { username, email, password, role, first_name, last_name, phone, is_active } = data;

    const existingResult = await pool.query(
      'SELECT id FROM users WHERE (username = $1 OR email = $2) AND id != $3',
      [username, email, userId]
    );

    if (existingResult.rows.length > 0) {
      throw new ConflictError('Username or email already exists');
    }

    let passwordUpdate = '';
    const params: any[] = [username, email, role, first_name, last_name, phone || null, is_active, userId];
    let paramIndex = 9;

    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      passwordUpdate = `, password_hash = $${paramIndex}`;
      params.push(passwordHash);
    }

    const result = await pool.query(
      `UPDATE users 
       SET username = $1, email = $2, role = $3, first_name = $4, last_name = $5, 
           phone = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP ${passwordUpdate}
       WHERE id = $8 
       RETURNING id, username, email, role, first_name, last_name, phone, is_active, created_at, updated_at`,
      params
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('User');
    }

    return result.rows[0];
  }

  async deleteUser(requesterId: number, requesterRole: UserRole, userId: string): Promise<void> {
    if (requesterRole !== 'admin') {
      throw new UnauthorizedError('Only administrators can delete users');
    }

    if (requesterId.toString() === userId) {
      throw new ConflictError('You cannot delete your own account');
    }

    const result = await pool.query(
      'UPDATE users SET deleted_at = CURRENT_TIMESTAMP, is_active = false WHERE id = $1 AND deleted_at IS NULL RETURNING id',
      [userId]
    );

    if (result.rows.length === 0) {
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

    const result = await pool.query(
      'UPDATE users SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL RETURNING id, username, email, role, is_active',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('User');
    }

    return {
      status: result.rows[0].is_active ? 'enabled' : 'disabled',
      user: result.rows[0]
    };
  }

  async getUserStats(requesterRole: UserRole): Promise<Record<string, number>> {
    if (requesterRole !== 'admin') {
      throw new UnauthorizedError('Only administrators can view stats');
    }

    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
        COUNT(CASE WHEN role = 'kitchen' THEN 1 END) as kitchen_users,
        COUNT(CASE WHEN role = 'reception' THEN 1 END) as reception_users,
        COUNT(CASE WHEN role = 'waiter' THEN 1 END) as waiter_users
      FROM users
      WHERE deleted_at IS NULL
    `);

    const stats = result.rows[0];
    return {
      total_users: parseInt(stats.total_users, 10),
      active_users: parseInt(stats.active_users, 10),
      admin_users: parseInt(stats.admin_users, 10),
      kitchen_users: parseInt(stats.kitchen_users, 10),
      reception_users: parseInt(stats.reception_users, 10),
      waiter_users: parseInt(stats.waiter_users, 10)
    };
  }
}

export default new AuthService();
