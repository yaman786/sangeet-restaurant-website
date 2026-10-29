export interface CartItem {
  id: number;
  name: string;
  price: string | number;
  quantity: number;
  specialRequests?: string;
  image_url?: string | null;
  is_vegetarian?: boolean;
  category?: string;
  category_id?: number | null;
  section?: 'food' | 'drinks';
}

export interface OrderSession {
  tableId: number | null;
  tableNumber: string;
  customerName: string | null;
  orderId?: number | null;
  orderNumber?: string | null;
  orderType?: 'dine-in' | 'takeaway';
  customerPhone?: string | null;
  pickupTime?: string | null;
}
