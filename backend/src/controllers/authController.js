const authService = require('../services/authService');

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json({
      message: 'Login successful',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.id);
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    await authService.changePassword(req.user.id, req.body);
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await authService.getAllUsers(req.user.role);
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const user = await authService.createUser(req.user.role, req.body);
    res.status(201).json({
      message: 'User created successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await authService.updateUser(req.user.role, req.params.id, req.body);
    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await authService.deleteUser(req.user.id, req.user.role, req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const result = await authService.toggleUserStatus(req.user.id, req.user.role, req.params.id);
    res.json({
      message: `User ${result.status} successfully`,
      user: result.user
    });
  } catch (error) {
    next(error);
  }
};

const getUserStats = async (req, res, next) => {
  try {
    const stats = await authService.getUserStats(req.user.role);
    res.json({ stats });
  } catch (error) {
    next(error);
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