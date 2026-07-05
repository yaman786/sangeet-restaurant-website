import api, { apiCallWrapper } from './client';

export const getRestaurantSettings = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/website/settings');
  }, 'getRestaurantSettings');
};

export const updateRestaurantSettings = async (settings) => {
  return apiCallWrapper(async () => {
    return await api.put('/website/settings', settings);
  }, 'updateRestaurantSettings', false);
};

export const getWebsiteContent = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/website/content');
  }, 'getWebsiteContent');
};

export const updateWebsiteContent = async (content) => {
  return apiCallWrapper(async () => {
    return await api.put('/website/content', content);
  }, 'updateWebsiteContent', false);
};

export const getWebsiteMedia = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/website/media');
  }, 'getWebsiteMedia');
};

export const uploadWebsiteMedia = async (formData) => {
  return apiCallWrapper(async () => {
    return await api.post('/website/media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }, 'uploadWebsiteMedia', false);
};

export const deleteWebsiteMedia = async (id) => {
  return apiCallWrapper(async () => {
    return await api.delete(`/website/media/${encodeURIComponent(id)}`);
  }, 'deleteWebsiteMedia', false);
};

export const getWebsiteStats = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/website/stats');
  }, 'getWebsiteStats');
};

export const fetchEvents = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/events');
  }, 'fetchEvents');
};

export const fetchFeaturedEvents = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/events/featured');
  }, 'fetchFeaturedEvents');
};

export const fetchUpcomingEvents = async () => {
  return apiCallWrapper(async () => {
    return await api.get('/events/upcoming');
  }, 'fetchUpcomingEvents');
};

export const fetchEventById = async (id) => {
  return apiCallWrapper(async () => {
    return await api.get(`/events/${encodeURIComponent(id)}`);
  }, 'fetchEventById');
};
