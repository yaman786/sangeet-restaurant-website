-- Sangeet Restaurant Database Schema

-- Create database (run this separately)
-- CREATE DATABASE sangeet_restaurant;

-- Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(8,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    image_url TEXT,
    is_vegetarian BOOLEAN DEFAULT false,
    is_spicy BOOLEAN DEFAULT false,
    is_popular BOOLEAN DEFAULT false,
    allergens TEXT[],
    preparation_time INTEGER DEFAULT 15,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customer Reviews Table
CREATE TABLE IF NOT EXISTS customer_reviews (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    review_text TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    image_url TEXT,
    order_id INTEGER,
    table_number VARCHAR(10),
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reservations Table
CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    date DATE NOT NULL,
    time TIME NOT NULL,
    guests INTEGER NOT NULL,
    special_requests TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events Table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    image_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table for Menu Management
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update menu_items table to use category_id instead of category string
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id);
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Insert default categories
INSERT INTO categories (name, description, display_order) VALUES
('Appetizers', 'Start your meal with our delicious appetizers', 1),
('Main Course', 'Our signature main dishes', 2),
('Biryani', 'Authentic Indian biryani varieties', 3),
('Breads', 'Freshly baked Indian breads', 4),
('Rice & Noodles', 'Aromatic rice and noodle dishes', 5),
('Desserts', 'Sweet endings to your meal', 6),
('Beverages', 'Refreshing drinks and beverages', 7),
('Sides', 'Perfect accompaniments', 8)
ON CONFLICT (name) DO NOTHING;

-- Update existing menu items to use category_id
UPDATE menu_items SET category_id = (SELECT id FROM categories WHERE name = 'Appetizers') WHERE category = 'Appetizers';
UPDATE menu_items SET category_id = (SELECT id FROM categories WHERE name = 'Main Course') WHERE category = 'Main Course';
UPDATE menu_items SET category_id = (SELECT id FROM categories WHERE name = 'Biryani') WHERE category = 'Biryani';
UPDATE menu_items SET category_id = (SELECT id FROM categories WHERE name = 'Breads') WHERE category = 'Breads';
UPDATE menu_items SET category_id = (SELECT id FROM categories WHERE name = 'Rice & Noodles') WHERE category = 'Rice & Noodles';
UPDATE menu_items SET category_id = (SELECT id FROM categories WHERE name = 'Desserts') WHERE category = 'Desserts';
UPDATE menu_items SET category_id = (SELECT id FROM categories WHERE name = 'Beverages') WHERE category = 'Beverages';
UPDATE menu_items SET category_id = (SELECT id FROM categories WHERE name = 'Sides') WHERE category = 'Sides';

-- Insert sample menu items
INSERT INTO menu_items (name, description, price, category, image_url, is_vegetarian, is_spicy, is_popular) VALUES
-- Starters
('Samosa', 'Crispy pastry filled with spiced potatoes and peas', 8.50, 'Starters', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop', true, false, true),
('Pakora', 'Mixed vegetable fritters with chickpea flour', 7.50, 'Starters', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop', true, false, false),
('Chicken Tikka', 'Tender chicken marinated in yogurt and spices', 12.00, 'Starters', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop', false, true, true),

-- Main Courses
('Butter Chicken', 'Creamy tomato-based curry with tender chicken', 28.00, 'Main Courses', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop', false, false, true),
('Palak Paneer', 'Spinach curry with fresh cheese cubes', 22.00, 'Main Courses', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop', true, false, false),
('Lamb Biryani', 'Fragrant rice dish with tender lamb', 32.00, 'Main Courses', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop', false, true, true),

-- Nepali Specialties
('Momo Dumplings', 'Steamed dumplings filled with minced meat', 18.00, 'Nepali Specialties', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop', false, false, true),
('Dal Bhat', 'Traditional lentil soup with rice', 16.00, 'Nepali Specialties', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop', true, false, false),

-- Breads
('Naan', 'Soft leavened bread baked in tandoor', 4.50, 'Breads', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop', true, false, true),
('Roti', 'Whole wheat flatbread', 3.50, 'Breads', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop', true, false, false),

-- Desserts
('Gulab Jamun', 'Sweet milk dumplings in rose syrup', 8.00, 'Desserts', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop', true, false, true),
('Kheer', 'Rice pudding with cardamom and nuts', 7.50, 'Desserts', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop', true, false, false),

-- Beverages
('Masala Chai', 'Spiced Indian tea with milk', 4.00, 'Beverages', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop', true, false, true),
('Lassi', 'Sweet yogurt drink', 5.00, 'Beverages', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop', true, false, false);

-- Insert sample reviews
INSERT INTO customer_reviews (customer_name, review_text, rating, image_url, is_verified) VALUES
('Anika Sharma', 'Sangeet offers an unparalleled dining experience. The Butter Chicken is a must-try! ★★★★★', 5, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', true),
('Rohan Kapoor', 'The ambiance is lovely, and the food is generally good. I especially enjoyed the momos. ★★★★', 4, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', true),
('Priya Patel', 'Authentic flavors that remind me of home. The service is excellent and the atmosphere is perfect for family dinners. ★★★★★', 5, 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face', true),
('David Chen', 'Great fusion of Indian and Nepali cuisine. The biryani was exceptional! ★★★★', 4, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', true),
('Sarah Johnson', 'Lovely vegetarian options. The palak paneer was delicious and the naan was perfect. ★★★★★', 5, 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face', true);

-- Insert sample events
INSERT INTO events (title, description, date, image_url, is_featured) VALUES
('Diwali Celebration', 'A night of music, dance, and special dishes to celebrate the Festival of Lights', '2024-11-12', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop', true),
('Holi Festival', 'Join us for a colorful celebration with traditional sweets and special menu', '2025-03-08', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop', true),
('Nepali New Year', 'Celebrate Nepali New Year with traditional dishes and cultural performances', '2025-04-14', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop', false);

-- Create indexes for better performance
CREATE INDEX idx_menu_items_category ON menu_items(category);
CREATE INDEX idx_menu_items_popular ON menu_items(is_popular);
CREATE INDEX idx_reservations_date ON reservations(date);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_featured ON events(is_featured);
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_active ON menu_items(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active); -- Comprehensive Menu for Sangeet Restaurant
-- At least 10 items per category with unique images

-- Clear existing menu items
DELETE FROM menu_items;

-- Insert comprehensive menu items with unique images

-- STARTERS (10 items)
INSERT INTO menu_items (name, description, price, category, image_url, is_vegetarian, is_spicy, is_popular) VALUES
('Vegetable Samosa', 'Crispy pastry filled with spiced potatoes, peas, and aromatic spices', 8.50, 'Starters', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop', true, false, true),
('Chicken Pakora', 'Crispy fritters made with marinated chicken and chickpea flour', 9.50, 'Starters', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop', false, true, true),
('Paneer Tikka', 'Grilled cottage cheese marinated in yogurt and spices', 11.00, 'Starters', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop', true, true, false),
('Chicken 65', 'Spicy deep-fried chicken with curry leaves and red chilies', 12.50, 'Starters', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop', false, true, true),
('Aloo Tikki', 'Spiced potato patties served with chutney', 7.50, 'Starters', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop&crop=center', true, false, false),
('Fish Pakora', 'Fresh fish fillets coated in spiced chickpea batter', 13.00, 'Starters', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&crop=center', false, true, false),
('Mushroom Manchurian', 'Crispy mushrooms in spicy Chinese-style sauce', 10.50, 'Starters', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop&crop=center', true, true, false),
('Lamb Seekh Kebab', 'Minced lamb kebabs grilled to perfection', 14.00, 'Starters', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center', false, true, true),
('Onion Bhaji', 'Crispy onion fritters with gram flour', 6.50, 'Starters', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop&crop=top', true, false, false),
('Tandoori Prawns', 'Jumbo prawns marinated in tandoori spices', 16.00, 'Starters', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&crop=top', false, true, true);

-- MAIN COURSES (12 items)
INSERT INTO menu_items (name, description, price, category, image_url, is_vegetarian, is_spicy, is_popular) VALUES
('Butter Chicken', 'Tender chicken in rich tomato and butter gravy', 28.00, 'Main Courses', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop', false, false, true),
('Palak Paneer', 'Fresh spinach curry with homemade cottage cheese', 22.00, 'Main Courses', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop', true, false, true),
('Lamb Rogan Josh', 'Tender lamb in aromatic Kashmiri curry', 32.00, 'Main Courses', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop', false, true, true),
('Chicken Tikka Masala', 'Grilled chicken in creamy tomato sauce', 26.00, 'Main Courses', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop', false, true, true),
('Dal Makhani', 'Black lentils slow-cooked with cream and butter', 18.00, 'Main Courses', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop&crop=center', true, false, false),
('Fish Curry', 'Fresh fish in coconut and tamarind gravy', 30.00, 'Main Courses', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&crop=center', false, true, false),
('Mushroom Masala', 'Button mushrooms in spicy onion-tomato gravy', 20.00, 'Main Courses', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop&crop=center', true, true, false),
('Goat Curry', 'Tender goat meat in traditional spices', 34.00, 'Main Courses', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center', false, true, true),
('Paneer Butter Masala', 'Cottage cheese in rich butter gravy', 24.00, 'Main Courses', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop&crop=top', true, false, true),
('Chicken Vindaloo', 'Spicy chicken curry with vinegar and chilies', 29.00, 'Main Courses', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&crop=top', false, true, true),
('Mixed Vegetable Curry', 'Seasonal vegetables in aromatic spices', 19.00, 'Main Courses', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop&crop=top', true, false, false),
('Prawn Curry', 'Fresh prawns in coconut and curry leaf gravy', 36.00, 'Main Courses', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=bottom', false, true, false);

-- NEPALI SPECIALTIES (10 items)
INSERT INTO menu_items (name, description, price, category, image_url, is_vegetarian, is_spicy, is_popular) VALUES
('Chicken Momo', 'Steamed dumplings filled with minced chicken and spices', 18.00, 'Nepali Specialties', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop', false, false, true),
('Dal Bhat Set', 'Traditional lentil soup with rice and accompaniments', 16.00, 'Nepali Specialties', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop', true, false, true),
('Lamb Sekuwa', 'Grilled lamb marinated in Nepali spices', 25.00, 'Nepali Specialties', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop', false, true, true),
('Vegetable Momo', 'Steamed dumplings filled with mixed vegetables', 15.00, 'Nepali Specialties', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop', true, false, false),
('Chicken Choila', 'Spicy grilled chicken with mustard oil', 22.00, 'Nepali Specialties', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop&crop=center', false, true, false),
('Aloo Tama', 'Bamboo shoots with potatoes in spicy gravy', 14.00, 'Nepali Specialties', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop&crop=center', true, true, false),
('Fish Sekuwa', 'Grilled fish marinated in Nepali spices', 28.00, 'Nepali Specialties', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&crop=center', false, true, false),
('Kwati', 'Mixed bean soup with traditional spices', 12.00, 'Nepali Specialties', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center', true, false, false),
('Chicken Sukuti', 'Dried meat curry with Nepali spices', 24.00, 'Nepali Specialties', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop&crop=top', false, true, false),
('Gundruk', 'Fermented leafy greens with potatoes', 13.00, 'Nepali Specialties', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop&crop=top', true, false, false);

-- BREADS (10 items)
INSERT INTO menu_items (name, description, price, category, image_url, is_vegetarian, is_spicy, is_popular) VALUES
('Plain Naan', 'Soft leavened bread baked in tandoor', 4.50, 'Breads', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop', true, false, true),
('Butter Naan', 'Naan brushed with butter for extra richness', 5.50, 'Breads', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop', true, false, true),
('Garlic Naan', 'Naan topped with garlic and herbs', 6.00, 'Breads', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop', true, false, true),
('Roti', 'Whole wheat flatbread', 3.50, 'Breads', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop', true, false, false),
('Paratha', 'Layered flatbread with ghee', 4.00, 'Breads', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop&crop=center', true, false, false),
('Aloo Paratha', 'Stuffed flatbread with spiced potatoes', 5.00, 'Breads', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop&crop=center', true, false, false),
('Puri', 'Deep-fried puffed bread', 4.50, 'Breads', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&crop=center', true, false, false),
('Bhatura', 'Deep-fried leavened bread', 5.00, 'Breads', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center', true, false, false),
('Missi Roti', 'Spiced gram flour flatbread', 4.00, 'Breads', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop&crop=top', true, false, false),
('Tandoori Roti', 'Whole wheat bread baked in tandoor', 4.50, 'Breads', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop&crop=top', true, false, false);

-- DESSERTS (10 items)
INSERT INTO menu_items (name, description, price, category, image_url, is_vegetarian, is_spicy, is_popular) VALUES
('Gulab Jamun', 'Sweet milk dumplings soaked in rose syrup', 8.00, 'Desserts', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop', true, false, true),
('Kheer', 'Rice pudding with cardamom and nuts', 7.50, 'Desserts', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop', true, false, true),
('Rasmalai', 'Soft cheese patties in sweetened milk', 9.00, 'Desserts', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop', true, false, true),
('Jalebi', 'Crispy spirals soaked in sugar syrup', 6.50, 'Desserts', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop', true, false, false),
('Kulfi', 'Traditional Indian ice cream with pistachios', 8.50, 'Desserts', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop&crop=center', true, false, false),
('Gajar Ka Halwa', 'Carrot pudding with nuts and cardamom', 7.00, 'Desserts', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop&crop=center', true, false, false),
('Rasgulla', 'Soft cheese balls in light sugar syrup', 8.00, 'Desserts', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&crop=center', true, false, false),
('Malai Kulfi', 'Creamy ice cream with saffron', 9.50, 'Desserts', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center', true, false, false),
('Shahi Tukda', 'Bread pudding with saffron milk', 8.50, 'Desserts', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop&crop=top', true, false, false),
('Phirni', 'Ground rice pudding with rose water', 7.50, 'Desserts', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop&crop=top', true, false, false);

-- DRINKS (10 items)
INSERT INTO menu_items (name, description, price, category, image_url, is_vegetarian, is_spicy, is_popular) VALUES
('Mango Lassi', 'Sweet yogurt drink with fresh mango', 6.00, 'Drinks', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop', true, false, true),
('Masala Chai', 'Spiced Indian tea with milk', 4.50, 'Drinks', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop', true, false, true),
('Sweet Lassi', 'Sweetened yogurt drink with cardamom', 5.50, 'Drinks', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop', true, false, false),
('Saffron Lassi', 'Yogurt drink with saffron and nuts', 7.00, 'Drinks', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop', true, false, false),
('Ginger Tea', 'Fresh ginger tea with honey', 4.00, 'Drinks', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop&crop=center', true, false, false),
('Rose Lassi', 'Yogurt drink with rose water', 6.50, 'Drinks', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop&crop=center', true, false, false),
('Cardamom Tea', 'Black tea with cardamom and milk', 4.00, 'Drinks', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&crop=center', true, false, false),
('Salted Lassi', 'Savory yogurt drink with cumin', 5.00, 'Drinks', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center', true, false, false),
('Masala Soda', 'Spiced lemon soda', 3.50, 'Drinks', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop&crop=top', true, false, false),
('Kesar Lassi', 'Saffron yogurt drink with nuts', 7.50, 'Drinks', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop&crop=top', true, false, false);

-- Update popular items
UPDATE menu_items SET is_popular = true WHERE name IN (
  'Vegetable Samosa', 'Chicken Pakora', 'Butter Chicken', 'Palak Paneer', 'Lamb Rogan Josh',
  'Chicken Tikka Masala', 'Chicken Momo', 'Dal Bhat Set', 'Plain Naan', 'Butter Naan',
  'Gulab Jamun', 'Kheer', 'Rasmalai', 'Mango Lassi', 'Masala Chai'
); -- Authentication Schema for Admin/Staff Members
-- Only admin and staff members need authentication

-- Admin/Staff Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
);



-- Create index for faster lookups
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role); -- Order Management System Schema

-- Tables for QR Code ordering
CREATE TABLE IF NOT EXISTS tables (
    id SERIAL PRIMARY KEY,
    table_number VARCHAR(10) UNIQUE NOT NULL,
    qr_code_url TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    table_id INTEGER REFERENCES tables(id),
    customer_name VARCHAR(255),
    order_number VARCHAR(20) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, preparing, ready, completed, cancelled
    total_amount DECIMAL(10,2) DEFAULT 0,
    special_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INTEGER REFERENCES menu_items(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(8,2) NOT NULL,
    total_price DECIMAL(8,2) NOT NULL,
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample tables
INSERT INTO tables (table_number, qr_code_url) VALUES
('1', 'https://sangeet-restaurant.com/qr/table-1'),
('2', 'https://sangeet-restaurant.com/qr/table-2'),
('3', 'https://sangeet-restaurant.com/qr/table-3'),
('4', 'https://sangeet-restaurant.com/qr/table-4'),
('5', 'https://sangeet-restaurant.com/qr/table-5');

-- Create indexes for better performance
CREATE INDEX idx_orders_table_id ON orders(table_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_menu_item_id ON order_items(menu_item_id); -- Tables Management Schema

-- Create tables table for QR code management
CREATE TABLE IF NOT EXISTS tables (
    id SERIAL PRIMARY KEY,
    table_number VARCHAR(10) NOT NULL UNIQUE,
    table_name VARCHAR(100),
    capacity INTEGER DEFAULT 4,
    status VARCHAR(50) DEFAULT 'available',
    qr_code_url TEXT,
    qr_code_data TEXT,
    design_settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_scanned_at TIMESTAMP,
    scan_count INTEGER DEFAULT 0
);

-- Insert default tables
INSERT INTO tables (table_number, table_name, capacity, status, qr_code_url) VALUES
('1', 'Table 1', 4, 'available', 'https://heartfelt-gnome-7178c3.netlify.app/qr/table-1'),
('2', 'Table 2', 4, 'available', 'https://heartfelt-gnome-7178c3.netlify.app/qr/table-2'),
('3', 'Table 3', 6, 'available', 'https://heartfelt-gnome-7178c3.netlify.app/qr/table-3'),
('4', 'Table 4', 4, 'available', 'https://heartfelt-gnome-7178c3.netlify.app/qr/table-4'),
('5', 'Table 5', 8, 'available', 'https://heartfelt-gnome-7178c3.netlify.app/qr/table-5'),
('6', 'Table 6', 4, 'available', 'https://heartfelt-gnome-7178c3.netlify.app/qr/table-6'),
('7', 'Table 7', 6, 'available', 'https://heartfelt-gnome-7178c3.netlify.app/qr/table-7'),
('8', 'Table 8', 4, 'available', 'https://heartfelt-gnome-7178c3.netlify.app/qr/table-8')
ON CONFLICT (table_number) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tables_table_number ON tables(table_number);
CREATE INDEX IF NOT EXISTS idx_tables_status ON tables(status);
CREATE INDEX IF NOT EXISTS idx_tables_is_active ON tables(is_active);
CREATE INDEX IF NOT EXISTS idx_tables_qr_code_url ON tables(qr_code_url);
-- QR Code Management System Schema

-- Enhanced Tables table with QR analytics
ALTER TABLE IF EXISTS tables ADD COLUMN IF NOT EXISTS qr_code_data TEXT;
ALTER TABLE IF EXISTS tables ADD COLUMN IF NOT EXISTS design_settings JSONB DEFAULT '{}';
ALTER TABLE IF EXISTS tables ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE IF EXISTS tables ADD COLUMN IF NOT EXISTS last_scanned_at TIMESTAMP;
ALTER TABLE IF EXISTS tables ADD COLUMN IF NOT EXISTS scan_count INTEGER DEFAULT 0;

-- Custom QR Codes table for different purposes
CREATE TABLE IF NOT EXISTS custom_qr_codes (
    id SERIAL PRIMARY KEY,
    purpose VARCHAR(100) NOT NULL,
    target_url TEXT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    qr_code_data TEXT,
    design_settings JSONB DEFAULT '{}',
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- QR Code Analytics table for tracking usage
CREATE TABLE IF NOT EXISTS qr_analytics (
    id SERIAL PRIMARY KEY,
    qr_code_id INTEGER,
    qr_code_type VARCHAR(20) NOT NULL, -- 'table' or 'custom'
    scan_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    ip_address INET,
    referrer TEXT,
    device_type VARCHAR(50),
    location_data JSONB
);

-- QR Code Templates table for reusable designs
CREATE TABLE IF NOT EXISTS qr_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    design_settings JSONB NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default QR templates
INSERT INTO qr_templates (name, description, design_settings, is_default) VALUES
('Classic Black', 'Standard black QR code on white background', 
 '{"darkColor": "#000000", "lightColor": "#ffffff", "width": 300, "margin": 2}', true),
('Restaurant Brand', 'Sangeet restaurant branded colors', 
 '{"darkColor": "#1d1b16", "lightColor": "#f0ecdf", "width": 300, "margin": 2}', false),
('High Contrast', 'High contrast for better scanning', 
 '{"darkColor": "#000000", "lightColor": "#ffffff", "width": 400, "margin": 4}', false),
('Colorful', 'Vibrant colors for marketing', 
 '{"darkColor": "#e6bc68", "lightColor": "#ffffff", "width": 300, "margin": 2}', false);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_qr_analytics_qr_code_id ON qr_analytics(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_qr_analytics_timestamp ON qr_analytics(scan_timestamp);
CREATE INDEX IF NOT EXISTS idx_custom_qr_codes_purpose ON custom_qr_codes(purpose);
CREATE INDEX IF NOT EXISTS idx_custom_qr_codes_expires ON custom_qr_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_tables_qr_code_url ON tables(qr_code_url);

-- Update existing tables with new columns if they don't exist
DO $$
BEGIN
    -- Add qr_code_data column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tables' AND column_name = 'qr_code_data') THEN
        ALTER TABLE tables ADD COLUMN qr_code_data TEXT;
    END IF;
    
    -- Add design_settings column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tables' AND column_name = 'design_settings') THEN
        ALTER TABLE tables ADD COLUMN design_settings JSONB DEFAULT '{}';
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tables' AND column_name = 'updated_at') THEN
        ALTER TABLE tables ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    -- Add last_scanned_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tables' AND column_name = 'last_scanned_at') THEN
        ALTER TABLE tables ADD COLUMN last_scanned_at TIMESTAMP;
    END IF;
    
    -- Add scan_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tables' AND column_name = 'scan_count') THEN
        ALTER TABLE tables ADD COLUMN scan_count INTEGER DEFAULT 0;
    END IF;
END $$; -- Enhanced Reservation Management System Schema

-- Restaurant Tables (if not exists)
CREATE TABLE IF NOT EXISTS restaurant_tables (
    id SERIAL PRIMARY KEY,
    table_number VARCHAR(10) UNIQUE NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 4,
    table_type VARCHAR(50) DEFAULT 'standard', -- standard, booth, outdoor, private
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced Reservations Table
CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    table_id INTEGER REFERENCES restaurant_tables(id),
    date DATE NOT NULL,
    time TIME NOT NULL,
    guests INTEGER NOT NULL,
    special_requests TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, seated, completed, cancelled, no-show
    confirmation_code VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reservation Time Slots
CREATE TABLE IF NOT EXISTS reservation_time_slots (
    id SERIAL PRIMARY KEY,
    time_slot TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    max_reservations INTEGER DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default restaurant tables
INSERT INTO restaurant_tables (table_number, capacity, table_type) VALUES
('1', 4, 'standard'),
('2', 4, 'standard'),
('3', 6, 'booth'),
('4', 2, 'standard'),
('5', 8, 'private'),
('6', 4, 'standard'),
('7', 6, 'booth'),
('8', 4, 'outdoor'),
('9', 2, 'standard'),
('10', 10, 'private')
ON CONFLICT (table_number) DO NOTHING;

-- Insert default time slots
INSERT INTO reservation_time_slots (time_slot, max_reservations) VALUES
('17:00', 8),
('17:30', 8),
('18:00', 10),
('18:30', 10),
('19:00', 12),
('19:30', 12),
('20:00', 12),
('20:30', 12),
('21:00', 10),
('21:30', 8),
('22:00', 6)
ON CONFLICT (time_slot) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);
CREATE INDEX IF NOT EXISTS idx_reservations_time ON reservations(time);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_table_id ON reservations(table_id);
CREATE INDEX IF NOT EXISTS idx_reservations_email ON reservations(email);
CREATE INDEX IF NOT EXISTS idx_restaurant_tables_capacity ON restaurant_tables(capacity);
CREATE INDEX IF NOT EXISTS idx_restaurant_tables_type ON restaurant_tables(table_type);

-- Function to check table availability
CREATE OR REPLACE FUNCTION check_table_availability(
    p_table_id INTEGER,
    p_date DATE,
    p_time TIME,
    p_guests INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    table_capacity INTEGER;
    existing_reservations INTEGER;
BEGIN
    -- Get table capacity
    SELECT capacity INTO table_capacity 
    FROM restaurant_tables 
    WHERE id = p_table_id AND is_active = true;
    
    IF table_capacity IS NULL THEN
        RETURN false;
    END IF;
    
    -- Check if table can accommodate the guests
    IF p_guests > table_capacity THEN
        RETURN false;
    END IF;
    
    -- Check for existing reservations at the same time
    SELECT COUNT(*) INTO existing_reservations
    FROM reservations 
    WHERE table_id = p_table_id 
      AND date = p_date 
      AND time = p_time 
      AND status NOT IN ('cancelled', 'no-show');
    
    RETURN existing_reservations = 0;
END;
$$ LANGUAGE plpgsql;

-- Function to generate confirmation code
CREATE OR REPLACE FUNCTION generate_confirmation_code() RETURNS VARCHAR(20) AS $$
BEGIN
    RETURN 'RES' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to get available tables for a given time and guest count
CREATE OR REPLACE FUNCTION get_available_tables(
    p_date DATE,
    p_time TIME,
    p_guests INTEGER
) RETURNS TABLE(
    table_id INTEGER,
    table_number VARCHAR(10),
    capacity INTEGER,
    table_type VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT rt.id, rt.table_number, rt.capacity, rt.table_type
    FROM restaurant_tables rt
    WHERE rt.is_active = true
      AND rt.capacity >= p_guests
      AND NOT EXISTS (
          SELECT 1 FROM reservations r
          WHERE r.table_id = rt.id
            AND r.date = p_date
            AND r.time = p_time
            AND r.status NOT IN ('cancelled', 'no-show')
      )
    ORDER BY rt.capacity ASC, rt.table_number ASC;
END;
$$ LANGUAGE plpgsql;
-- Website Content Management Schema

-- Restaurant Settings Table (general restaurant information)
CREATE TABLE IF NOT EXISTS restaurant_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'text', -- text, number, boolean, json, image
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER REFERENCES users(id)
);

-- Website Content Sections Table
CREATE TABLE IF NOT EXISTS website_content (
    id SERIAL PRIMARY KEY,
    section_key VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255),
    content TEXT,
    content_type VARCHAR(50) DEFAULT 'text', -- text, html, markdown, json
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER REFERENCES users(id)
);

-- Website Images/Media Table
CREATE TABLE IF NOT EXISTS website_media (
    id SERIAL PRIMARY KEY,
    media_key VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(50), -- image/jpeg, image/png, etc.
    file_size INTEGER,
    alt_text VARCHAR(255),
    caption TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER REFERENCES users(id)
);

-- Insert default restaurant settings
INSERT INTO restaurant_settings (setting_key, setting_value, setting_type, description) VALUES
('restaurant_name', 'Sangeet Restaurant', 'text', 'Restaurant name displayed on website'),
('restaurant_tagline', 'Authentic Indian & Nepali Cuisine', 'text', 'Restaurant tagline/slogan'),
('phone_number', '+1 (555) 123-4567', 'text', 'Main contact phone number'),
('email', 'info@sangeetrestaurant.com', 'text', 'Main contact email'),
('address', '123 Main Street, Cityville, ST 12345', 'text', 'Restaurant address'),
('opening_hours', '{"monday":{"open":"11:00","close":"22:00","closed":false},"tuesday":{"open":"11:00","close":"22:00","closed":false},"wednesday":{"open":"11:00","close":"22:00","closed":false},"thursday":{"open":"11:00","close":"22:00","closed":false},"friday":{"open":"11:00","close":"23:00","closed":false},"saturday":{"open":"11:00","close":"23:00","closed":false},"sunday":{"open":"12:00","close":"21:00","closed":false}}', 'json', 'Restaurant opening hours'),
('social_facebook', 'https://facebook.com/sangeetrestaurant', 'text', 'Facebook page URL'),
('social_instagram', 'https://instagram.com/sangeetrestaurant', 'text', 'Instagram profile URL'),
('social_twitter', 'https://twitter.com/sangeetrestaurant', 'text', 'Twitter profile URL'),
('reservation_enabled', 'true', 'boolean', 'Enable online reservations'),
('delivery_enabled', 'true', 'boolean', 'Enable delivery/takeout orders'),
('google_maps_embed', '', 'text', 'Google Maps embed URL'),
('website_theme_color', '#D97706', 'text', 'Primary theme color for website')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert default website content sections
INSERT INTO website_content (section_key, title, content, content_type) VALUES
('hero_title', 'Welcome to Sangeet Restaurant', 'Experience the Authentic Flavors of India & Nepal', 'text'),
('hero_subtitle', 'Where Tradition Meets Taste', 'Indulge in our carefully crafted dishes made with the finest ingredients and traditional recipes passed down through generations.', 'text'),
('about_title', 'Our Story', 'About Sangeet Restaurant', 'text'),
('about_content', 'Our Story', 'Founded with a passion for authentic Indian and Nepali cuisine, Sangeet Restaurant has been serving the community with traditional flavors and warm hospitality. Our chefs bring decades of experience, using time-honored recipes and the finest spices to create memorable dining experiences.\n\nFrom our signature butter chicken to traditional momos, every dish is prepared with love and attention to detail. We pride ourselves on offering both vegetarian and non-vegetarian options that cater to all palates.', 'text'),
('special_announcement', 'Grand Opening Special!', 'Join us for our grand opening celebration! Enjoy 20% off your first visit and experience the best of Indian and Nepali cuisine.', 'text'),
('chef_special_title', 'Chef''s Recommendations', 'Must-Try Dishes', 'text'),
('chef_special_description', 'Chef''s Recommendations', 'Our head chef recommends these signature dishes that showcase the best of our culinary expertise.', 'text'),
('footer_description', 'About Us', 'Sangeet Restaurant - Your destination for authentic Indian and Nepali cuisine. Experience the rich flavors and warm hospitality that make every meal memorable.', 'text')
ON CONFLICT (section_key) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_restaurant_settings_key ON restaurant_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_website_content_section ON website_content(section_key);
CREATE INDEX IF NOT EXISTS idx_website_content_active ON website_content(is_active);
CREATE INDEX IF NOT EXISTS idx_website_media_key ON website_media(media_key);
CREATE INDEX IF NOT EXISTS idx_website_media_active ON website_media(is_active);
