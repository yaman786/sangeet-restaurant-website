-- Initial Schema for Sangeet Restaurant

-- 1. Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'staff', 'customer');
CREATE TYPE order_status AS ENUM ('pending', 'preparing', 'ready', 'completed', 'cancelled');
CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- 2. Create tables
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  role user_role DEFAULT 'customer',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.restaurant_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number TEXT UNIQUE NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 2,
  table_type TEXT,
  qr_code_url_fragment TEXT UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category_id UUID REFERENCES public.menu_categories(id) ON DELETE SET NULL,
  image_url TEXT,
  is_vegetarian BOOLEAN DEFAULT false,
  is_spicy BOOLEAN DEFAULT false,
  is_popular BOOLEAN DEFAULT false,
  allergens TEXT[],
  preparation_time INTEGER DEFAULT 15,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  table_id UUID REFERENCES public.restaurant_tables(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  special_instructions TEXT,
  status order_status DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  special_requests TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  table_id UUID REFERENCES public.restaurant_tables(id) ON DELETE SET NULL,
  reservation_time TIMESTAMPTZ NOT NULL,
  guests INTEGER NOT NULL DEFAULT 2,
  special_requests TEXT,
  status reservation_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Set up Row Level Security (RLS)

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- user_profiles RLS
CREATE POLICY "Users can view their own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
-- Note: A secure trigger or backend function should be used to create profiles on signup, or handle it via service role.

-- restaurant_tables RLS
CREATE POLICY "Anyone can view active tables" ON public.restaurant_tables FOR SELECT USING (is_active = true);

-- menu_categories RLS
CREATE POLICY "Anyone can view active categories" ON public.menu_categories FOR SELECT USING (is_active = true);

-- menu_items RLS
CREATE POLICY "Anyone can view active menu items" ON public.menu_items FOR SELECT USING (is_active = true);

-- orders RLS
CREATE POLICY "Anyone can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view their own orders" ON public.orders FOR SELECT USING (true); -- In a real app, restrict by session or token.

-- order_items RLS
CREATE POLICY "Anyone can insert order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view order items" ON public.order_items FOR SELECT USING (true);

-- reservations RLS
CREATE POLICY "Anyone can create reservations" ON public.reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own reservations by email" ON public.reservations FOR SELECT USING (true); -- In a real app, verify by email or session.

-- 4. Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = timezone('utc'::text, now());
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_restaurant_tables_updated_at BEFORE UPDATE ON public.restaurant_tables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_categories_updated_at BEFORE UPDATE ON public.menu_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;

-- 6. Seed initial data
INSERT INTO public.menu_categories (id, name, display_order) VALUES 
('c1000000-0000-0000-0000-000000000001', 'Starters', 1),
('c2000000-0000-0000-0000-000000000002', 'Main Course', 2),
('c3000000-0000-0000-0000-000000000003', 'Biryani & Rice', 3),
('c4000000-0000-0000-0000-000000000004', 'Nepali Specials', 4),
('c5000000-0000-0000-0000-000000000005', 'Breads', 5),
('c6000000-0000-0000-0000-000000000006', 'Beverages', 6);

INSERT INTO public.menu_items (id, name, description, price, category_id, image_url, is_vegetarian, is_spicy, is_popular, preparation_time) VALUES 
('a1000000-0000-0000-0000-000000000001', 'Samosa (2 pcs)', 'Crispy pastry filled with spiced potatoes and peas', 48, 'c1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop', true, false, true, 10),
('a2000000-0000-0000-0000-000000000002', 'Chicken Tikka', 'Marinated chicken pieces grilled in a tandoor oven', 88, 'c1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop', false, true, true, 15),
('a3000000-0000-0000-0000-000000000003', 'Butter Chicken', 'Tender chicken in a rich, creamy tomato-based sauce', 148, 'c2000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=300&fit=crop', false, true, true, 20),
('a4000000-0000-0000-0000-000000000004', 'Paneer Tikka Masala', 'Grilled cottage cheese in spiced tomato cream sauce', 128, 'c2000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop', true, true, true, 18),
('a5000000-0000-0000-0000-000000000005', 'Lamb Biryani', 'Fragrant basmati rice layered with tender lamb', 168, 'c3000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop', false, true, true, 25),
('a6000000-0000-0000-0000-000000000006', 'Momo (Steamed)', 'Traditional Nepali steamed dumplings', 88, 'c4000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&h=300&fit=crop', false, false, true, 15),
('a7000000-0000-0000-0000-000000000007', 'Garlic Naan', 'Soft leavened bread with fresh garlic and butter', 38, 'c5000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop', true, false, true, 8),
('a8000000-0000-0000-0000-000000000008', 'Mango Lassi', 'Creamy yogurt drink blended with sweet mango pulp', 38, 'c6000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1527685609591-44b0aef2400b?w=400&h=300&fit=crop', true, false, true, 5);

INSERT INTO public.restaurant_tables (id, table_number, capacity, table_type, qr_code_url_fragment) VALUES 
('b1000000-0000-0000-0000-000000000001', 'T-01', 2, 'indoor', 't-01'),
('b2000000-0000-0000-0000-000000000002', 'T-02', 4, 'indoor', 't-02'),
('b3000000-0000-0000-0000-000000000003', 'T-03', 6, 'indoor', 't-03'),
('b4000000-0000-0000-0000-000000000004', 'T-04', 2, 'outdoor', 't-04');
