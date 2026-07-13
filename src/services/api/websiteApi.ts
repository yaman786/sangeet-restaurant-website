import api, { apiCallWrapper, serverFetch } from './client';
import { RestaurantSettingRow, WebsiteContentRow, WebsiteMediaRow, EventRow } from '@/lib/types';

export const getRestaurantSettings = async (): Promise<RestaurantSettingRow[]> => {
  return apiCallWrapper(async () => {
    return await api.get('/website/settings');
  }, 'getRestaurantSettings');
};

export const updateRestaurantSettings = async (settings: Record<string, string>) => {
  return apiCallWrapper(async () => {
    return await api.put('/website/settings', settings);
  }, 'updateRestaurantSettings', false);
};

export const getWebsiteContent = async (): Promise<WebsiteContentRow[]> => {
  return apiCallWrapper(async () => {
    return await api.get('/website/content');
  }, 'getWebsiteContent');
};

export const updateWebsiteContent = async (content: Partial<WebsiteContentRow> | Partial<WebsiteContentRow>[]) => {
  return apiCallWrapper(async () => {
    return await api.put('/website/content', content);
  }, 'updateWebsiteContent', false);
};

export const getWebsiteMedia = async (): Promise<WebsiteMediaRow[]> => {
  return apiCallWrapper(async () => {
    return await api.get('/website/media');
  }, 'getWebsiteMedia');
};

export const uploadWebsiteMedia = async (formData: FormData) => {
  return apiCallWrapper(async () => {
    return await api.post('/website/media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }, 'uploadWebsiteMedia', false);
};

export const deleteWebsiteMedia = async (id: string | number) => {
  return apiCallWrapper(async () => {
    return await api.delete(`/website/media/${encodeURIComponent(id)}`);
  }, 'deleteWebsiteMedia', false);
};

export const getWebsiteStats = async (): Promise<Record<string, number>> => {
  return apiCallWrapper(async () => {
    return await api.get('/website/stats');
  }, 'getWebsiteStats');
};

export const fetchEvents = async (): Promise<EventRow[]> => {
  return apiCallWrapper(async () => {
    return await api.get('/events');
  }, 'fetchEvents');
};

export const fetchFeaturedEvents = async (): Promise<EventRow[]> => {
  return apiCallWrapper(async () => {
    return await api.get('/events/featured');
  }, 'fetchFeaturedEvents');
};

export const fetchUpcomingEvents = async (): Promise<EventRow[]> => {
  return apiCallWrapper(async () => {
    return await api.get('/events/upcoming');
  }, 'fetchUpcomingEvents');
};

export const fetchEventById = async (id: string | number): Promise<EventRow> => {
  return apiCallWrapper(async () => {
    return await api.get(`/events/${encodeURIComponent(id)}`);
  }, 'fetchEventById');
};

// SERVER COMPONENT FETCHERS
export const serverFetchEvents = async (): Promise<EventRow[]> => {
  return serverFetch<EventRow[]>('/events', { next: { revalidate: 3600 } });
};
