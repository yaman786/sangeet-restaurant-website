// ── User & Auth ─────────────────────────────────────────────

export type UserRole = 'admin' | 'kitchen' | 'reception' | 'waiter';

export interface JwtPayload {
  id: number;
  username: string;
  role: UserRole;
  email: string;
  iat?: number;
  exp?: number;
}

export interface UserRow {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role: UserRole;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

export type UserInfo = Omit<UserRow, 'password_hash'>;

// ── Menu ────────────────────────────────────────────────────

export interface MenuItemRow {
  id: number;
  name: string;
  description: string;
  price: string; // numeric comes as string from pg
  category: string;
  image_url: string | null;
  is_vegetarian: boolean;
  is_spicy: boolean;
  is_popular: boolean;
  is_available: boolean;
  allergens: string[] | null;
  preparation_time: number;
  created_at: string;
  updated_at: string | null;
}

export interface CategoryRow {
  id: number;
  name: string;
  display_order: number;
  is_active: boolean;
}

// ── Orders ──────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
export type OrderType = 'dine-in' | 'takeaway' | 'delivery';

export interface OrderRow {
  id: number;
  order_number: string;
  table_id: number;
  customer_name: string;
  status: OrderStatus;
  order_type: OrderType;
  special_instructions: string | null;
  total_amount: string;
  estimated_time: number | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItemRow {
  id: number;
  order_id: number;
  menu_item_id: number;
  quantity: number;
  special_requests: string | null;
  price: string;
  item_status: string;
}

export interface CreateOrderInput {
  table_id: number;
  customer_name: string;
  items: { menu_item_id: number; quantity: number; special_requests?: string | null }[];
  special_instructions?: string | null;
  order_type?: OrderType;
}

// ── Reservations ────────────────────────────────────────────

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';

export interface ReservationRow {
  id: number;
  customer_name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  special_requests: string | null;
  table_id: number | null;
  status: ReservationStatus;
  is_archived: boolean;
  created_at: string;
  updated_at: string | null;
}

// ── Reviews ─────────────────────────────────────────────────

export interface ReviewRow {
  id: number;
  customer_name: string;
  review_text: string;
  rating: number;
  image_url: string | null;
  order_id: number | null;
  table_number: string | null;
  is_verified: boolean;
  created_at: string;
}

// ── Events ──────────────────────────────────────────────────

export interface EventRow {
  id: number;
  title: string;
  description: string;
  date: string;
  image_url: string | null;
  is_featured: boolean;
  created_at: string;
}

// ── Tables ──────────────────────────────────────────────────

export interface TableRow {
  id: number;
  table_number: string;
  capacity: number;
  qr_code_url: string | null;
  location: string | null;
  is_active: boolean;
}

// ── QR Codes ────────────────────────────────────────────────

export interface QRCodeRow {
  id: number;
  table_id: number;
  table_number: string;
  qr_url: string;
  qr_code_data: string;
  design: string | null;
  created_at: string;
}

// ── Website ─────────────────────────────────────────────────

export interface RestaurantSettingRow {
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description: string | null;
  updated_by: number | null;
  updated_at: string;
}

export interface WebsiteContentRow {
  section_key: string;
  title: string;
  content: string;
  content_type: string;
  is_active: boolean;
  display_order: number;
}

export interface WebsiteMediaRow {
  id: number;
  media_key: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  alt_text: string;
  caption: string;
  is_active: boolean;
  display_order: number;
}

// ── Pagination ──────────────────────────────────────────────

export interface PaginationQuery {
  page?: string | number;
  limit?: string | number;
}

export interface PaginatedResult<T> {
  data: T[];
  metadata: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}

// ── API Responses ───────────────────────────────────────────

export interface ApiErrorDetail {
  message: string;
  code?: string;
  status: number;
  timestamp: string;
  path: string;
  method: string;
  details?: unknown;
  stack?: string;
}

export interface ApiErrorResponse {
  error: ApiErrorDetail;
}

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  environment: string;
  service: string;
  version: string;
  uptime: number;
  database: string;
}

// ── Email ───────────────────────────────────────────────────

export interface EmailContent {
  subject: string;
  html: string;
}

export type EmailTemplate = 'reservationCreated' | 'reservationConfirmed' | 'reservationCancelled';

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ── Socket Events ───────────────────────────────────────────

export interface OrderStatusUpdatePayload {
  type: 'status-update';
  orderId: number;
  status: string;
  tableNumber: string | null;
  estimatedTime: number | null;
  timestamp: string;
}

export interface NewItemsAddedPayload {
  type: 'new-items-added';
  orderId: number;
  newItems: unknown[];
  tableNumber: string | null;
  timestamp: string;
}

export interface OrderEventPayload {
  type: string;
  orderId: number;
  tableNumber?: string | null;
  reason?: string;
  timestamp: string;
  sound?: string;
}

// ── Image Optimization ──────────────────────────────────────

export interface ImageSizes {
  thumbnail: { width: number; height: number };
  small: { width: number; height: number };
  medium: { width: number; height: number };
  large: { width: number; height: number };
  hero: { width: number; height: number };
}

export interface OptimizedImages {
  [sizeName: string]: string;
}

// ── QR Generator ────────────────────────────────────────────

export interface QRCodeResult {
  tableNumber: number | string;
  qrUrl: string;
  qrCodeDataURL: string;
}

export interface ColorTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  gradient: [string, string];
  name: string;
}

export interface QRGenerationOptions {
  width?: number;
  height?: number;
  qrSize?: number;
  format?: 'png' | 'jpeg' | 'svg';
  colors?: ColorTheme;
  theme?: string;
}
