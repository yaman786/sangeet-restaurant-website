import api, { apiCallWrapper } from './client';
import { ReservationRow } from '@/lib/types';

export const createReservation = async (reservationData: Partial<ReservationRow>) => {
  return apiCallWrapper(async () => {
    return await api.post('/reservations', reservationData);
  }, 'createReservation', false);
};

export const getAvailableTables = async (date: string, time: string, guests: number | string) => {
  return apiCallWrapper(async () => {
    const params = new URLSearchParams({
      date: date,
      time: time,
      guests: guests.toString()
    });
    return await api.get(`/reservations/available-tables?${params.toString()}`);
  }, 'getAvailableTables');
};

export const getAvailableTimeSlots = async (date: string, guests: number | string = 4) => {
  return apiCallWrapper(async () => {
    const params = new URLSearchParams({
      date: date,
      guests: guests.toString()
    });
    return await api.get(`/reservations/available-times?${params.toString()}`);
  }, 'getAvailableTimeSlots');
};

export const fetchAllReservations = async (filters: Record<string, string | number | boolean> = {}): Promise<ReservationRow[]> => {
  return apiCallWrapper(async () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    const url = queryString ? `/reservations?${queryString}` : '/reservations';
    return await api.get(url);
  }, 'fetchAllReservations');
};

export const fetchReservationById = async (id: string | number): Promise<ReservationRow> => {
  return apiCallWrapper(async () => {
    return await api.get(`/reservations/${encodeURIComponent(id)}`);
  }, 'fetchReservationById');
};

export const updateReservation = async (id: string | number, reservationData: Partial<ReservationRow>) => {
  return apiCallWrapper(async () => {
    return await api.put(`/reservations/${encodeURIComponent(id)}`, reservationData);
  }, 'updateReservation', false);
};

export const updateReservationStatus = async (id: string | number, status: string) => {
  return apiCallWrapper(async () => {
    return await api.patch(`/reservations/${encodeURIComponent(id)}/status`, { status });
  }, 'updateReservationStatus', false);
};

export const deleteReservation = async (id: string | number) => {
  return apiCallWrapper(async () => {
    return await api.delete(`/reservations/${encodeURIComponent(id)}`);
  }, 'deleteReservation', false);
};

export const checkTableAvailability = async (tableId: string | number, date: string, time: string, guests: string | number) => {
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

export const fetchReservationStats = async (date: string | null = null): Promise<any> => {
  return apiCallWrapper(async () => {
    const url = date ? `/reservations/stats?date=${encodeURIComponent(date)}` : '/reservations/stats';
    return await api.get(url);
  }, 'fetchReservationStats');
};
