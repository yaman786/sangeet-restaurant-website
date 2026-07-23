import { UserRole, OrderType } from './index';

// ── Auth & Users ─────────────────────────────────────────────
export interface ChangePasswordDTO {
  currentPassword?: string;
  newPassword?: string;
}

export interface UpdateUserDTO {
  full_name?: string;
  phone?: string;
  role?: UserRole;
  is_active?: boolean;
  username?: string;
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
}

// ── Reservations ────────────────────────────────────────────
export interface CreateReservationDTO {
  customer_name: string;
  email: string;
  phone: string;
  date: string | Date;
  time: string;
  guests: string | number;
  special_requests?: string;
  table_id?: string | number | null;
}

export interface UpdateReservationDTO {
  customer_name?: string;
  email?: string;
  phone?: string;
  date?: string | Date;
  time?: string;
  guests?: string | number;
  special_requests?: string;
  table_id?: string | number | null;
  status?: string;
}

export interface CreateTimeSlotDTO {
  time_slot: string; // 'HH:mm'
  is_active?: boolean;
  max_reservations?: number;
}

export interface UpdateTimeSlotDTO {
  time_slot?: string;
  is_active?: boolean;
  max_reservations?: number;
}

export interface ReservationQueryDTO {
  date?: string | Date;
  status?: string;
  archived?: 'true' | 'false' | boolean;
}

// ── Orders ──────────────────────────────────────────────────
export interface OrderQueryDTO {
  status?: string;
  type?: string;
  date?: string | Date;
  customer?: string;
  archived?: string | boolean;
  table_id?: string | number;
  query?: string;
  limit?: string | number;
  term?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  tableId?: string | number;
}

// ── Events ──────────────────────────────────────────────────
export interface CreateEventDTO {
  title: string;
  description?: string;
  date: string | Date;
  start_time: string;
  end_time: string;
  image_url?: string;
  is_active?: boolean;
  is_featured?: boolean;
}

export interface UpdateEventDTO extends Partial<CreateEventDTO> {}

// ── Website & Settings ──────────────────────────────────────
export interface WebsiteSettingsDTO {
  restaurant_name?: string;
  phone_number?: string;
  email?: string;
  address?: string;
  currency?: string;
  timezone?: string;
  tax_rate?: number;
  maintenance_mode?: boolean;
}

export interface WebsiteContentDTO {
  hero_title?: string;
  hero_subtitle?: string;
  about_title?: string;
  about_text?: string;
  primary_color?: string;
  secondary_color?: string;
  font_family?: string;
}

export interface BannerDTO {
  title: string;
  subtitle?: string;
  image_url: string;
  link_url?: string;
  button_text?: string;
  is_active?: boolean;
  display_order?: number;
}

export interface UpdateBannerDTO extends Partial<BannerDTO> {}

export interface BusinessHoursDTO {
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed?: boolean;
}

export interface FooterSettingsDTO {
  description?: string;
  copyright_text?: string;
  show_social_links?: boolean;
  show_newsletter?: boolean;
}

export interface SeoSettingsDTO {
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  og_image_url?: string;
}

export interface SocialLinksDTO {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
}

export interface UploadMediaDTO {
  title?: string;
  alt_text?: string;
  media_key?: string;
  caption?: string;
}

// ── QR Codes ────────────────────────────────────────────────
export interface QRDesignDTO {
  color?: string;
  bg_color?: string;
  logo_url?: string;
  shape?: string;
}

export interface BulkQRGenerateDTO {
  tableNumbers: (string | number)[];
  theme?: string;
  design?: QRDesignDTO;
}

// ── Reviews ─────────────────────────────────────────────────
export interface CreateReviewDTO {
  customer_name: string;
  rating: number;
  comment?: string;
  review_text?: string;
  image_url?: string;
  order_id?: number | string;
  table_number?: string | number;
}

// ── Analytics ───────────────────────────────────────────────
export interface AnalyticsQueryDTO {
  startDate?: string;
  endDate?: string;
  timeframe?: string;
}

// ── Menu ────────────────────────────────────────────────────
export interface MenuQueryDTO {
  category?: string;
  search?: string;
  is_active?: boolean | string;
  is_vegetarian?: string | boolean;
  is_spicy?: string | boolean;
  is_popular?: string | boolean;
  is_available?: string | boolean;
}
