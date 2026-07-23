import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Initialize plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// The absolute anchor timezone for the physical restaurant
export const RESTAURANT_TIMEZONE = 'Europe/London';

/**
 * Parses a date string and time string explicitly in the restaurant's timezone
 * @param dateString Format: YYYY-MM-DD
 * @param timeString Format: HH:mm (24-hour)
 * @returns dayjs object anchored in the restaurant's timezone
 */
export const parseRestaurantTime = (dateString: string | Date, timeString: string) => {
  // Extract just the date part if a Date object is passed
  const formattedDate = typeof dateString === 'string' 
    ? dateString.split('T')[0] 
    : dayjs(dateString).format('YYYY-MM-DD');

  // e.g., '2026-11-05 19:00'
  const dateTimeString = `${formattedDate} ${timeString}`;
  
  // Parse it assuming it's in the restaurant's timezone
  return dayjs.tz(dateTimeString, 'YYYY-MM-DD HH:mm', RESTAURANT_TIMEZONE);
};

/**
 * Formats any date object to the restaurant's local timezone for display
 * @param date Native Date or dayjs object
 * @param format Display format (default: 'hh:mm A')
 * @returns Formatted time string
 */
export const formatRestaurantTime = (date: dayjs.Dayjs | Date | string | null | undefined, format: string = 'hh:mm A') => {
  if (!date) return '';
  return dayjs(date).tz(RESTAURANT_TIMEZONE).format(format);
};

export default dayjs;
