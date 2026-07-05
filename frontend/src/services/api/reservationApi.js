import api, { apiCallWrapper } from './client';

export const createReservation = async (reservationData) => {
  return apiCallWrapper(async () => {
    return await api.post('/reservations', reservationData);
  }, 'createReservation', false);
};

export const getAvailableTables = async (date, time, guests) => {
  return apiCallWrapper(async () => {
    const params = new URLSearchParams({
      date: date,
      time: time,
      guests: guests.toString()
    });
    return await api.get(`/reservations/available-tables?${params.toString()}`);
  }, 'getAvailableTables');
};

export const getAvailableTimeSlots = async (date, guests = 4) => {
  return apiCallWrapper(async () => {
    const params = new URLSearchParams({
      date: date,
      guests: guests.toString()
    });
    return await api.get(`/reservations/available-times?${params.toString()}`);
  }, 'getAvailableTimeSlots');
};

export const fetchAllReservations = async (filters = {}) => {
  return apiCallWrapper(async () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    const url = queryString ? `/reservations?${queryString}` : '/reservations';
    return await api.get(url);
  }, 'fetchAllReservations');
};

export const fetchReservationById = async (id) => {
  return apiCallWrapper(async () => {
    return await api.get(`/reservations/${encodeURIComponent(id)}`);
  }, 'fetchReservationById');
};

export const updateReservation = async (id, reservationData) => {
  return apiCallWrapper(async () => {
    return await api.put(`/reservations/${encodeURIComponent(id)}`, reservationData);
  }, 'updateReservation', false);
};

export const updateReservationStatus = async (id, status) => {
  return apiCallWrapper(async () => {
    return await api.patch(`/reservations/${encodeURIComponent(id)}/status`, { status });
  }, 'updateReservationStatus', false);
};

export const deleteReservation = async (id) => {
  return apiCallWrapper(async () => {
    return await api.delete(`/reservations/${encodeURIComponent(id)}`);
  }, 'deleteReservation', false);
};

export const checkTableAvailability = async (tableId, date, time, guests) => {
  return apiCallWrapper(async () => {
    const params = new URLSearchParams({
      tableId: tableId.toString(),
      date: date,
      time: time,
      guests: guests.toString()
    });
    return await api.get(`/reservations/check-availability?${params.toString()}`);
  }, 'checkTableAvailability');
};

export const fetchReservationStats = async (date = null) => {
  return apiCallWrapper(async () => {
    const url = date ? `/reservations/stats?date=${encodeURIComponent(date)}` : '/reservations/stats';
    return await api.get(url);
  }, 'fetchReservationStats');
};
