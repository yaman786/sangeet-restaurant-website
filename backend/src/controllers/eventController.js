const eventService = require('../services/eventService');

const getAllEvents = async (req, res, next) => {
  try {
    const events = await eventService.getAllEvents();
    res.json(events);
  } catch (error) {
    next(error);
  }
};

const getFeaturedEvents = async (req, res, next) => {
  try {
    const events = await eventService.getFeaturedEvents();
    res.json(events);
  } catch (error) {
    next(error);
  }
};

const getUpcomingEvents = async (req, res, next) => {
  try {
    const events = await eventService.getUpcomingEvents();
    res.json(events);
  } catch (error) {
    next(error);
  }
};

const getEventById = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    res.json(event);
  } catch (error) {
    next(error);
  }
};

const createEvent = async (req, res, next) => {
  try {
    const event = await eventService.createEvent(req.body);
    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const event = await eventService.updateEvent(req.params.id, req.body);
    res.json({
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    await eventService.deleteEvent(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getEventsByDateRange = async (req, res, next) => {
  try {
    const events = await eventService.getEventsByDateRange(req.query.start_date, req.query.end_date);
    res.json(events);
  } catch (error) {
    next(error);
  }
};

const getEventStats = async (req, res, next) => {
  try {
    const stats = await eventService.getEventStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllEvents,
  getFeaturedEvents,
  getUpcomingEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsByDateRange,
  getEventStats
};