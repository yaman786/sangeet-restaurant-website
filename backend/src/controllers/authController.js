const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'development' ? 'sangeet-restaurant-secret-key' : null);
if (!JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET is not defined in production.');
}

// Login admin/staff
const login = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // The frontend sends the login input in the 'username' field.
    // If it contains an '@', it's actually an email.
    const loginInput = username || email;

    if (!password || !loginInput) {
      return res.status(400).json({
        error: 'Username or email and password are required'
      });
    }

    // Input length validation to prevent CPU exhaustion
    if (password.length > 100 || loginInput.length > 100) {
      return res.status(400).json({
        error: 'Input length exceeds maximum allowed limit'
      });
    }

    const isEmail = loginInput.includes('@');

    // Find user by username or email
    let userResult;
    if (isEmail) {
      userResult = await pool.query(
        'SELECT * FROM users WHERE email = $1 AND is_active = true AND deleted_at IS NULL',
        [loginInput]
      );
    } else {
      userResult = await pool.query(
        'SELECT * FROM users WHERE username = $1 AND is_active = true AND deleted_at IS NULL',
        [loginInput]
      );
    }

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    const user = userResult.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '12h' }
    );

    // Return user info (without password) and token
    const { password_hash, ...userInfo } = user;

    res.json({
      message: 'Login successful',
      user: userInfo,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const userResult = await pool.query(
      'SELECT id, username, email, role, first_name, last_name, phone, created_at FROM users WHERE id = $1 AND deleted_at IS NULL',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      user: userResult.rows[0]
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Current password and new password are required'
      });
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        error: 'New password must be at least 8 characters long and contain at least one letter and one number'
      });
    }

    // Get current user
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1 AND deleted_at IS NULL',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, userId]
    );

    res.json({
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied. Admin role required.'
      });
    }

    const usersResult = await pool.query(
      'SELECT id, username, email, role, first_name, last_name, phone, is_active, created_at FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC'
    );

    res.json({
      users: usersResult.rows
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Create new user (admin only)
const createUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied. Admin role required.'
      });
    }

    const { username, email, password, role, first_name, last_name, phone } = req.body;

    if (!username || !email || !password || !first_name || !last_name) {
      return res.status(400).json({
        error: 'Username, email, password, first_name, and last_name are required'
      });
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long and contain at least one letter and one number'
      });
    }

    // Check if username or email already exists (excluding deleted users?)
    // Ideally we should allow reusing emails if the user was deleted, OR enforce uniqueness globally.
    // For safety, let's enforce uniqueness globally to avoid confusion, or check deleted_at IS NULL.
    // Let's check ONLY active/non-deleted users for conflict.
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE (username = $1 OR email = $2) AND deleted_at IS NULL',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: 'Username or email already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const newUserResult = await pool.query(
      'INSERT INTO users (username, email, password_hash, role, first_name, last_name, phone) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, username, email, role, first_name, last_name, phone, created_at',
      [username, email, passwordHash, role || 'staff', first_name, last_name, phone]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: newUserResult.rows[0]
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Update user (admin only)
const updateUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied. Admin role required.'
      });
    }

    const { id } = req.params;
    const { username, email, password, role, first_name, last_name, phone, is_active } = req.body;

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Check if username or email already exists for other users
    const duplicateCheck = await pool.query(
      'SELECT id FROM users WHERE (username = $1 OR email = $2) AND id != $3 AND deleted_at IS NULL',
      [username, email, id]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(400).json({
        error: 'Username or email already exists'
      });
    }

    // Handle password update if provided
    let updateQuery, updateParams;
    if (password && password.trim() !== '') {
      const bcrypt = require('bcryptjs');
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      updateQuery = 'UPDATE users SET username = $1, email = $2, password_hash = $3, role = $4, first_name = $5, last_name = $6, phone = $7, is_active = $8, updated_at = CURRENT_TIMESTAMP WHERE id = $9 RETURNING id, username, email, role, first_name, last_name, phone, is_active, created_at';
      updateParams = [username, email, passwordHash, role, first_name, last_name, phone, is_active, id];
    } else {
      updateQuery = 'UPDATE users SET username = $1, email = $2, role = $3, first_name = $4, last_name = $5, phone = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8 RETURNING id, username, email, role, first_name, last_name, phone, is_active, created_at';
      updateParams = [username, email, role, first_name, last_name, phone, is_active, id];
    }

    // Update user
    const updateResult = await pool.query(updateQuery, updateParams);

    res.json({
      message: 'User updated successfully',
      user: updateResult.rows[0]
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied. Admin role required.'
      });
    }

    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        error: 'Cannot delete your own account'
      });
    }

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id, role FROM users WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Prevent deletion of the last admin
    if (existingUser.rows[0].role === 'admin') {
      const adminCount = await pool.query(
        'SELECT COUNT(*) FROM users WHERE role = $1 AND is_active = true AND deleted_at IS NULL',
        ['admin']
      );

      if (parseInt(adminCount.rows[0].count) <= 1) {
        return res.status(400).json({
          error: 'Cannot delete the last admin user'
        });
      }
    }

    // Soft delete by setting deleted_at to NOW() (and is_active to false for good measure)
    await pool.query(
      'UPDATE users SET deleted_at = CURRENT_TIMESTAMP, is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    res.json({
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Toggle user status (admin only)
const toggleUserStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied. Admin role required.'
      });
    }

    const { id } = req.params;

    // Prevent admin from deactivating themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        error: 'Cannot deactivate your own account'
      });
    }

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id, role, is_active FROM users WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const currentStatus = existingUser.rows[0].is_active;
    const newStatus = !currentStatus;

    // Prevent deactivation of the last admin
    if (existingUser.rows[0].role === 'admin' && newStatus === false) {
      const adminCount = await pool.query(
        'SELECT COUNT(*) FROM users WHERE role = $1 AND is_active = true AND deleted_at IS NULL',
        ['admin']
      );

      if (parseInt(adminCount.rows[0].count) <= 1) {
        return res.status(400).json({
          error: 'Cannot deactivate the last admin user'
        });
      }
    }

    // Toggle status
    const updateResult = await pool.query(
      'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, username, email, role, first_name, last_name, phone, is_active, created_at',
      [newStatus, id]
    );

    res.json({
      message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
      user: updateResult.rows[0]
    });

  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Get user activity stats (admin only)
const getUserStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied. Admin role required.'
      });
    }

    // Get total users count (excluding deleted)
    const totalUsers = await pool.query('SELECT COUNT(*) FROM users WHERE deleted_at IS NULL');

    // Get active users count
    const activeUsers = await pool.query('SELECT COUNT(*) FROM users WHERE is_active = true AND deleted_at IS NULL');

    // Get users by role
    const adminUsers = await pool.query('SELECT COUNT(*) FROM users WHERE role = $1 AND is_active = true AND deleted_at IS NULL', ['admin']);
    const staffUsers = await pool.query('SELECT COUNT(*) FROM users WHERE role = $1 AND is_active = true AND deleted_at IS NULL', ['staff']);

    // Get recent users (last 30 days)
    const recentUsers = await pool.query(
      'SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL \'30 days\' AND deleted_at IS NULL'
    );

    res.json({
      stats: {
        total: parseInt(totalUsers.rows[0].count),
        active: parseInt(activeUsers.rows[0].count),
        inactive: parseInt(totalUsers.rows[0].count) - parseInt(activeUsers.rows[0].count),
        admins: parseInt(adminUsers.rows[0].count),
        staff: parseInt(staffUsers.rows[0].count),
        recent: parseInt(recentUsers.rows[0].count)
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

module.exports = {
  login,
  getProfile,
  changePassword,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUserStats
}; 