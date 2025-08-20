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
