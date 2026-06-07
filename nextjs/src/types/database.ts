/**
 * Supabase Database Types
 * 
 * These types represent the schema for the Sangeet Restaurant database.
 * In production, generate these automatically with:
 *   npx supabase gen types typescript --project-id <your-project-id> > src/types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "staff" | "customer";
export type OrderStatus = "pending" | "preparing" | "ready" | "completed" | "cancelled";
export type ReservationStatus = "pending" | "confirmed" | "seated" | "completed" | "cancelled" | "no-show";
export type TableType = "standard" | "booth" | "outdoor" | "private";

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          role: UserRole;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          role?: UserRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          role?: UserRole;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      menu_categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          display_order?: number;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      menu_items: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          category_id: string;
          image_url: string | null;
          is_vegetarian: boolean;
          is_spicy: boolean;
          is_popular: boolean;
          allergens: string[] | null;
          preparation_time: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          category_id: string;
          image_url?: string | null;
          is_vegetarian?: boolean;
          is_spicy?: boolean;
          is_popular?: boolean;
          allergens?: string[] | null;
          preparation_time?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          price?: number;
          category_id?: string;
          image_url?: string | null;
          is_vegetarian?: boolean;
          is_spicy?: boolean;
          is_popular?: boolean;
          allergens?: string[] | null;
          preparation_time?: number | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      restaurant_tables: {
        Row: {
          id: string;
          table_number: string;
          capacity: number;
          table_type: TableType;
          qr_code_url_fragment: string | null;
          qr_code_data: string | null;
          design_settings: Json | null;
          is_active: boolean;
          last_scanned_at: string | null;
          scan_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          table_number: string;
          capacity: number;
          table_type?: TableType;
          qr_code_url_fragment?: string | null;
          qr_code_data?: string | null;
          design_settings?: Json | null;
          is_active?: boolean;
          last_scanned_at?: string | null;
          scan_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          table_number?: string;
          capacity?: number;
          table_type?: TableType;
          qr_code_url_fragment?: string | null;
          qr_code_data?: string | null;
          design_settings?: Json | null;
          is_active?: boolean;
          last_scanned_at?: string | null;
          scan_count?: number;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          table_id: string;
          customer_name: string;
          order_number: string;
          status: OrderStatus;
          total_amount: number;
          special_instructions: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          table_id: string;
          customer_name: string;
          order_number?: string;
          status?: OrderStatus;
          total_amount?: number;
          special_instructions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          table_id?: string;
          customer_name?: string;
          order_number?: string;
          status?: OrderStatus;
          total_amount?: number;
          special_instructions?: string | null;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          menu_item_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          special_requests: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          menu_item_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          special_requests?: string | null;
          created_at?: string;
        };
        Update: {
          order_id?: string;
          menu_item_id?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          special_requests?: string | null;
        };
      };
      reservations: {
        Row: {
          id: string;
          customer_name: string;
          email: string;
          phone: string | null;
          table_id: string | null;
          date: string;
          time: string;
          guests: number;
          special_requests: string | null;
          status: ReservationStatus;
          confirmation_code: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_name: string;
          email: string;
          phone?: string | null;
          table_id?: string | null;
          date: string;
          time: string;
          guests: number;
          special_requests?: string | null;
          status?: ReservationStatus;
          confirmation_code?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          customer_name?: string;
          email?: string;
          phone?: string | null;
          table_id?: string | null;
          date?: string;
          time?: string;
          guests?: number;
          special_requests?: string | null;
          status?: ReservationStatus;
          updated_at?: string;
        };
      };
      reservation_time_slots: {
        Row: {
          id: string;
          time_slot: string;
          is_active: boolean;
          max_reservations: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          time_slot: string;
          is_active?: boolean;
          max_reservations?: number;
          created_at?: string;
        };
        Update: {
          time_slot?: string;
          is_active?: boolean;
          max_reservations?: number;
        };
      };
      customer_reviews: {
        Row: {
          id: string;
          customer_name: string;
          review_text: string | null;
          rating: number;
          image_url: string | null;
          order_id: string | null;
          table_number: string | null;
          is_verified: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_name: string;
          review_text?: string | null;
          rating: number;
          image_url?: string | null;
          order_id?: string | null;
          table_number?: string | null;
          is_verified?: boolean;
          created_at?: string;
        };
        Update: {
          customer_name?: string;
          review_text?: string | null;
          rating?: number;
          image_url?: string | null;
          is_verified?: boolean;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          date: string;
          image_url: string | null;
          is_featured: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          date: string;
          image_url?: string | null;
          is_featured?: boolean;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          date?: string;
          image_url?: string | null;
          is_featured?: boolean;
        };
      };
      restaurant_settings: {
        Row: {
          id: string;
          setting_key: string;
          setting_value: string | null;
          setting_type: string | null;
          description: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          setting_key: string;
          setting_value?: string | null;
          setting_type?: string | null;
          description?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          setting_key?: string;
          setting_value?: string | null;
          setting_type?: string | null;
          description?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
      };
      website_content: {
        Row: {
          id: string;
          section_key: string;
          title: string | null;
          content: string | null;
          content_type: string | null;
          is_active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          section_key: string;
          title?: string | null;
          content?: string | null;
          content_type?: string | null;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          section_key?: string;
          title?: string | null;
          content?: string | null;
          content_type?: string | null;
          is_active?: boolean;
          display_order?: number;
          updated_at?: string;
          updated_by?: string | null;
        };
      };
      website_media: {
        Row: {
          id: string;
          media_key: string | null;
          file_name: string;
          file_path: string;
          file_type: string | null;
          file_size: number | null;
          alt_text: string | null;
          caption: string | null;
          is_active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          media_key?: string | null;
          file_name: string;
          file_path: string;
          file_type?: string | null;
          file_size?: number | null;
          alt_text?: string | null;
          caption?: string | null;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          media_key?: string | null;
          file_name?: string;
          file_path?: string;
          file_type?: string | null;
          file_size?: number | null;
          alt_text?: string | null;
          caption?: string | null;
          is_active?: boolean;
          display_order?: number;
          updated_at?: string;
          updated_by?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      check_table_availability: {
        Args: {
          p_table_id: string;
          p_date: string;
          p_time: string;
          p_guests: number;
        };
        Returns: boolean;
      };
      get_available_tables: {
        Args: {
          p_date: string;
          p_time: string;
          p_guests: number;
        };
        Returns: {
          id: string;
          table_number: string;
          capacity: number;
          table_type: TableType;
        }[];
      };
    };
    Enums: Record<string, never>;
  };
}

// Convenience type aliases
export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];
export type MenuCategory = Database["public"]["Tables"]["menu_categories"]["Row"];
export type MenuItem = Database["public"]["Tables"]["menu_items"]["Row"];
export type RestaurantTable = Database["public"]["Tables"]["restaurant_tables"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type Reservation = Database["public"]["Tables"]["reservations"]["Row"];
export type CustomerReview = Database["public"]["Tables"]["customer_reviews"]["Row"];
export type Event = Database["public"]["Tables"]["events"]["Row"];
export type RestaurantSetting = Database["public"]["Tables"]["restaurant_settings"]["Row"];
export type WebsiteContent = Database["public"]["Tables"]["website_content"]["Row"];
export type WebsiteMedia = Database["public"]["Tables"]["website_media"]["Row"];

// Extended types for joins
export type OrderWithItems = Order & {
  order_items: (OrderItem & {
    menu_item: MenuItem;
  })[];
  restaurant_table: RestaurantTable;
};

export type MenuItemWithCategory = MenuItem & {
  menu_category: MenuCategory;
};
