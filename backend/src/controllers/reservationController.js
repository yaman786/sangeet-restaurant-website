const reservationService = require('../services/reservationService');

const getAllReservations = async (req, res, next) => {
  try {
    const reservations = await reservationService.getAllReservations(req.query);
    res.json(reservations);
  } catch (error) {
    next(error);
  }
};

const getReservationById = async (req, res, next) => {
  try {
    const reservation = await reservationService.getReservationById(req.params.id);
    res.json(reservation);
  } catch (error) {
    next(error);
  }
};

const getAvailableTables = async (req, res, next) => {
  try {
    const { date, time, guests } = req.query;
    const result = await reservationService.getAvailableTables(date, time, guests);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getAvailableTimeSlots = async (req, res, next) => {
  try {
    const result = await reservationService.getAvailableTimeSlots(req.query.date);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const createReservation = async (req, res, next) => {
  try {
    const reservation = await reservationService.createReservation(req.body);
    res.status(201).json({
      message: 'Reservation created successfully',
      reservation
    });
  } catch (error) {
    next(error);
  }
};

const updateReservation = async (req, res, next) => {
  try {
    const reservation = await reservationService.updateReservation(req.params.id, req.body);
    res.json({
      message: 'Reservation updated successfully',
      reservation
    });
  } catch (error) {
    next(error);
  }
};

const updateReservationStatus = async (req, res, next) => {
  try {
    const reservation = await reservationService.updateReservationStatus(req.params.id, req.body.status);
    res.json({
      message: 'Reservation status updated successfully',
      reservation
    });
  } catch (error) {
    next(error);
  }
};

const deleteReservation = async (req, res, next) => {
  try {
    const reservation = await reservationService.deleteReservation(req.params.id);
    res.json({
      message: 'Reservation deleted successfully',
      reservation
    });
  } catch (error) {
    next(error);
  }
};

const checkAvailability = async (req, res, next) => {
  try {
    const { table_id, date, time, guests } = req.query;
    const available = await reservationService.checkAvailability(table_id, date, time, guests);
    res.json({ available });
  } catch (error) {
    next(error);
  }
};

const getReservationStats = async (req, res, next) => {
  try {
    const stats = await reservationService.getReservationStats(req.query.date);
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservation,
  updateReservationStatus,
  deleteReservation,
  checkAvailability,
  getReservationStats,
  getAvailableTables,
  getAvailableTimeSlots
};