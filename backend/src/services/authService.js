const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const config = require('../config/env');
const { UnauthorizedError, NotFoundError, ValidationError, ForbiddenError } = require('../utils/errors');

class AuthService {
  async login({ username, email, password }) {
    const loginInput = username || email;

    if (!password || !loginInput) {
      throw new ValidationError('Username or email and password are required');
    }

    if (password.length > 100 || loginInput.length > 100) {
      throw new ValidationError('Input length exceeds maximum allowed limit');
    }

    const isEmail = loginInput.includes('@');
    const query = isEmail 
      ? 'SELECT * FROM users WHERE email = $1 AND is_active = true AND deleted_at IS NULL'
      : 'SELECT * FROM users WHERE username = $1 AND is_active = true AND deleted_at IS NULL';
      
    const userResult = await pool.query(query, [loginInput]);

    if (userResult.rows.length === 0) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const user = userResult.rows[0];

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email
      },
      config.JWT_SECRET,
      { expiresIn: '12h' }
    );

    const { password_hash, ...userInfo } = user;
    return { user: userInfo, token };
  }

  async getProfile(userId) {
    const userResult = await pool.query(
      'SELECT id, username, email, role, first_name, last_name, phone, created_at FROM users WHERE id = $1 AND deleted_at IS NULL',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new NotFoundError('User');
    }

    return userResult.rows[0];
  }

  async changePassword(userId, { currentPassword, newPassword }) {
    if (!currentPassword || !newPassword) {
      throw new ValidationError('Current password and new password are required');
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      throw new ValidationError('New password must be at least 8 characters long and contain at least one letter and one number');
    }

    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1 AND deleted_at IS NULL',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new NotFoundError('User');
    }

    const isValidPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, userId]
    );
  }

  async getAllUsers(currentUserRole) {
    if (currentUserRole !== 'admin') {
      throw new ForbiddenError('Access denied. Admin role required.');
    }

    const usersResult = await pool.query(
      'SELECT id, username, email, role, first_name, last_name, phone, is_active, created_at FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC'
    );
    return usersResult.rows;
  }

  async createUser(currentUserRole, data) {
    if (currentUserRole !== 'admin') {
      throw new ForbiddenError('Access denied. Admin role required.');
    }

    const { username, email, password, role, first_name, last_name, phone } = data;

    if (!username || !email || !password || !first_name || !last_name) {
      throw new ValidationError('Username, email, password, first_name, and last_name are required');
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new ValidationError('Password must be at least 8 characters long and contain at least one letter and one number');
    }

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE (username = $1 OR email = $2) AND deleted_at IS NULL',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      throw new ValidationError('Username or email already exists');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUserResult = await pool.query(
      'INSERT INTO users (username, email, password_hash, role, first_name, last_name, phone) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, username, email, role, first_name, last_name, phone, created_at',
      [username, email, passwordHash, role || 'waiter', first_name, last_name, phone]
    );

    return newUserResult.rows[0];
  }

  async updateUser(currentUserRole, userId, data) {
    if (currentUserRole !== 'admin') {
      throw new ForbiddenError('Access denied. Admin role required.');
    }

    const { username, email, password, role, first_name, last_name, phone, is_active } = data;

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL',
      [userId]
    );

    if (existingUser.rows.length === 0) {
      throw new NotFoundError('User');
    }

    const duplicateCheck = await pool.query(
      'SELECT id FROM users WHERE (username = $1 OR email = $2) AND id != $3 AND deleted_at IS NULL',
      [username, email, userId]
    );

    if (duplicateCheck.rows.length > 0) {
      throw new ValidationError('Username or email already exists');
    }

    let updateQuery, updateParams;
    if (password && password.trim() !== '') {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      updateQuery = 'UPDATE users SET username = $1, email = $2, password_hash = $3, role = $4, first_name = $5, last_name = $6, phone = $7, is_active = $8, updated_at = CURRENT_TIMESTAMP WHERE id = $9 RETURNING id, username, email, role, first_name, last_name, phone, is_active, created_at';
      updateParams = [username, email, passwordHash, role, first_name, last_name, phone, is_active, userId];
    } else {
      updateQuery = 'UPDATE users SET username = $1, email = $2, role = $3, first_name = $4, last_name = $5, phone = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8 RETURNING id, username, email, role, first_name, last_name, phone, is_active, created_at';
      updateParams = [username, email, role, first_name, last_name, phone, is_active, userId];
    }

    const updateResult = await pool.query(updateQuery, updateParams);
    return updateResult.rows[0];
  }

  async deleteUser(currentUserId, currentUserRole, userId) {
    if (currentUserRole !== 'admin') {
      throw new ForbiddenError('Access denied. Admin role required.');
    }

    if (parseInt(userId) === currentUserId) {
      throw new ValidationError('Cannot delete your own account');
    }

    const existingUser = await pool.query(
      'SELECT id, role FROM users WHERE id = $1 AND deleted_at IS NULL',
      [userId]
    );

    if (existingUser.rows.length === 0) {
      throw new NotFoundError('User');
    }

    if (existingUser.rows[0].role === 'admin') {
      const adminCount = await pool.query(
        'SELECT COUNT(*) FROM users WHERE role = $1 AND is_active = true AND deleted_at IS NULL',
        ['admin']
      );

      if (parseInt(adminCount.rows[0].count) <= 1) {
        throw new ValidationError('Cannot delete the last admin user');
      }
    }

    await pool.query(
      'UPDATE users SET deleted_at = CURRENT_TIMESTAMP, is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [userId]
    );
  }

  async toggleUserStatus(currentUserId, currentUserRole, userId) {
    if (currentUserRole !== 'admin') {
      throw new ForbiddenError('Access denied. Admin role required.');
    }

    if (parseInt(userId) === currentUserId) {
      throw new ValidationError('Cannot deactivate your own account');
    }

    const existingUser = await pool.query(
      'SELECT id, role, is_active FROM users WHERE id = $1 AND deleted_at IS NULL',
      [userId]
    );

    if (existingUser.rows.length === 0) {
      throw new NotFoundError('User');
    }

    const newStatus = !existingUser.rows[0].is_active;

    if (existingUser.rows[0].role === 'admin' && newStatus === false) {
      const adminCount = await pool.query(
        'SELECT COUNT(*) FROM users WHERE role = $1 AND is_active = true AND deleted_at IS NULL',
        ['admin']
      );

      if (parseInt(adminCount.rows[0].count) <= 1) {
        throw new ValidationError('Cannot deactivate the last admin user');
      }
    }

    const updateResult = await pool.query(
      'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, username, email, role, first_name, last_name, phone, is_active, created_at',
      [newStatus, userId]
    );

    return {
      status: newStatus ? 'activated' : 'deactivated',
      user: updateResult.rows[0]
    };
  }

  async getUserStats(currentUserRole) {
    if (currentUserRole !== 'admin') {
      throw new ForbiddenError('Access denied. Admin role required.');
    }

    const totalUsers = await pool.query('SELECT COUNT(*) FROM users WHERE deleted_at IS NULL');
    const activeUsers = await pool.query('SELECT COUNT(*) FROM users WHERE is_active = true AND deleted_at IS NULL');
    const adminUsers = await pool.query('SELECT COUNT(*) FROM users WHERE role = $1 AND is_active = true AND deleted_at IS NULL', ['admin']);
    const staffUsers = await pool.query('SELECT COUNT(*) FROM users WHERE role IN ($1, $2, $3) AND is_active = true AND deleted_at IS NULL', ['kitchen', 'reception', 'waiter']);
    const recentUsers = await pool.query('SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL \'30 days\' AND deleted_at IS NULL');

    const totalCount = parseInt(totalUsers.rows[0].count);
    const activeCount = parseInt(activeUsers.rows[0].count);

    return {
      total: totalCount,
      active: activeCount,
      inactive: totalCount - activeCount,
      admins: parseInt(adminUsers.rows[0].count),
      staff: parseInt(staffUsers.rows[0].count),
      recent: parseInt(recentUsers.rows[0].count)
    };
  }
}

module.exports = new AuthService();
