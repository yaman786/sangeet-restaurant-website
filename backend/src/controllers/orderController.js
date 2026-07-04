const orderService = require('../services/orderService');

const getAllTables = async (req, res, next) => {
  try {
    const tables = await orderService.getAllTables();
    res.json(tables);
  } catch (error) {
    next(error);
  }
};

const getTableByQRCode = async (req, res, next) => {
  try {
    const table = await orderService.getTableByQRCode(req.params.qrCode);
    res.json(table);
  } catch (error) {
    next(error);
  }
};

const createOrder = async (req, res, next) => {
  try {
    const result = await orderService.createOrder(req.body);
    res.status(201).json({
      message: result.merged ? 'Items added to existing order successfully!' : 'Order placed successfully!',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.query.tableNumber);
    res.json(order);
  } catch (error) {
    next(error);
  }
};

const getOrdersByTable = async (req, res, next) => {
  try {
    const orders = await orderService.getOrdersByTable(req.params.tableId);
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

const getOrdersByTableNumber = async (req, res, next) => {
  try {
    const orders = await orderService.getOrdersByTableNumber(req.params.tableNumber);
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getAllOrders(req.query);
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

const getOrderStats = async (req, res, next) => {
  try {
    const stats = await orderService.getOrderStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

const generateTableQRCode = async (req, res, next) => {
  try {
    const qrCode = await orderService.generateTableQRCode(req.params.tableNumber);
    res.json(qrCode);
  } catch (error) {
    next(error);
  }
};

const generateAllTableQRCodes = async (req, res, next) => {
  try {
    const qrCodes = await orderService.generateAllTableQRCodes();
    res.json(qrCodes);
  } catch (error) {
    next(error);
  }
};

const deleteOrder = async (req, res, next) => {
  try {
    const result = await orderService.deleteOrder(req.params.id);
    res.json({
      message: 'Order deleted successfully',
      order: result.order,
      tableNumber: result.tableNumber
    });
  } catch (error) {
    next(error);
  }
};

const bulkUpdateOrderStatus = async (req, res, next) => {
  try {
    const updatedOrders = await orderService.bulkUpdateOrderStatus(req.body.orderIds, req.body.status);
    res.json({
      message: `${updatedOrders.length} orders updated successfully`,
      updatedOrders
    });
  } catch (error) {
    next(error);
  }
};

const searchOrders = async (req, res, next) => {
  try {
    const orders = await orderService.searchOrders(req.query);
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTables,
  getTableByQRCode,
  createOrder,
  getOrderById,
  getOrdersByTable,
  getOrdersByTableNumber,
  updateOrderStatus,
  getAllOrders,
  getOrderStats,
  generateTableQRCode,
  generateAllTableQRCodes,
  deleteOrder,
  bulkUpdateOrderStatus,
  searchOrders
};