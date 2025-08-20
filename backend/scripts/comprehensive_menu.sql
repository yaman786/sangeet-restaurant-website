-- Comprehensive Menu for Sangeet Restaurant
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
); 