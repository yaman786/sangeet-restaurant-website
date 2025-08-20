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
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active); 