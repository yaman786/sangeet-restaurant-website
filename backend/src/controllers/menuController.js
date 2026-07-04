const menuService = require('../services/menuService');

const getAllMenuItems = async (req, res, next) => {
  try {
    const items = await menuService.getAllMenuItems(req.query);
    res.json(items);
  } catch (error) {
    next(error);
  }
};

const getMenuItemById = async (req, res, next) => {
  try {
    const item = await menuService.getMenuItemById(req.params.id);
    res.json(item);
  } catch (error) {
    next(error);
  }
};

const createMenuItem = async (req, res, next) => {
  try {
    const item = await menuService.createMenuItem(req.body);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

const updateMenuItem = async (req, res, next) => {
  try {
    const item = await menuService.updateMenuItem(req.params.id, req.body);
    res.json(item);
  } catch (error) {
    next(error);
  }
};

const deleteMenuItem = async (req, res, next) => {
  try {
    await menuService.deleteMenuItem(req.params.id);
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await menuService.getAllCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const category = await menuService.createCategory(req.body);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await menuService.updateCategory(req.params.id, req.body);
    res.json(category);
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    await menuService.deleteCategory(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getMenuStats = async (req, res, next) => {
  try {
    const stats = await menuService.getMenuStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getMenuStats
};