-- Sample Reservation Data for Sangeet Restaurant

-- Insert sample reservations with different statuses
INSERT INTO reservations (customer_name, email, phone, table_id, date, time, guests, special_requests, status, confirmation_code) VALUES
-- Today's Reservations
('John Smith', 'john.smith@email.com', '+1-555-0101', 1, CURRENT_DATE, '18:00', 4, 'Window seat preferred', 'pending', 'RES' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT),
('Sarah Johnson', 'sarah.j@email.com', '+1-555-0102', 3, CURRENT_DATE, '19:00', 6, 'Birthday celebration', 'confirmed', 'RES' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT),
('Mike Wilson', 'mike.w@email.com', '+1-555-0103', 5, CURRENT_DATE, '20:00', 8, 'Business dinner', 'pending', 'RES' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT),
('Emily Davis', 'emily.d@email.com', '+1-555-0104', 2, CURRENT_DATE, '18:30', 2, NULL, 'confirmed', 'RES' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT),
('David Brown', 'david.b@email.com', '+1-555-0105', 7, CURRENT_DATE, '19:30', 6, 'Vegetarian options needed', 'completed', 'RES' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT),

-- Tomorrow's Reservations
('Lisa Anderson', 'lisa.a@email.com', '+1-555-0106', 4, CURRENT_DATE + INTERVAL '1 day', '18:00', 2, NULL, 'pending', 'RES' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT),
('Robert Taylor', 'robert.t@email.com', '+1-555-0107', 6, CURRENT_DATE + INTERVAL '1 day', '19:00', 4, 'Anniversary dinner', 'confirmed', 'RES' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT),
('Jennifer White', 'jennifer.w@email.com', '+1-555-0108', 8, CURRENT_DATE + INTERVAL '1 day', '20:00', 4, 'Outdoor seating preferred', 'pending', 'RES' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT),
('Michael Garcia', 'michael.g@email.com', '+1-555-0109', 9, CURRENT_DATE + INTERVAL '1 day', '18:30', 2, NULL, 'confirmed', 'RES' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT),
('Amanda Martinez', 'amanda.m@email.com', '+1-555-0110', 10, CURRENT_DATE + INTERVAL '1 day', '19:30', 10, 'Corporate event', 'pending', 'RES' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT),

-- Past Reservations (Completed)
('Tom Harris', 'tom.h@email.com', '+1-555-0111', 1, CURRENT_DATE - INTERVAL '1 day', '18:00', 4, NULL, 'completed', 'RES' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT),
('Rachel Lee', 'rachel.l@email.com', '+1-555-0112', 3, CURRENT_DATE - INTERVAL '1 day', '19:00', 6, 'Gluten-free options', 'completed', 'RES' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT),
('James Clark', 'james.c@email.com', '+1-555-0113', 5, CURRENT_DATE - INTERVAL '2 days', '20:00', 8, 'Business meeting', 'completed', 'RES' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT),
('Maria Rodriguez', 'maria.r@email.com', '+1-555-0114', 2, CURRENT_DATE - INTERVAL '2 days', '18:30', 2, NULL, 'completed', 'RES' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT),
('Kevin Lewis', 'kevin.l@email.com', '+1-555-0115', 7, CURRENT_DATE - INTERVAL '3 days', '19:30', 6, 'Birthday party', 'completed', 'RES' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT),

-- Cancelled Reservations
('Patricia Hall', 'patricia.h@email.com', '+1-555-0116', 4, CURRENT_DATE + INTERVAL '2 days', '18:00', 2, NULL, 'cancelled', 'RES' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT),
('Daniel Young', 'daniel.y@email.com', '+1-555-0117', 6, CURRENT_DATE + INTERVAL '3 days', '19:00', 4, NULL, 'cancelled', 'RES' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT),

-- Large Group Reservations
('Corporate Event', 'events@company.com', '+1-555-0118', 10, CURRENT_DATE + INTERVAL '4 days', '19:00', 10, 'Corporate dinner with presentation', 'pending', 'RES' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT),
('Family Reunion', 'family@email.com', '+1-555-0119', 5, CURRENT_DATE + INTERVAL '5 days', '18:00', 8, 'Family celebration', 'confirmed', 'RES' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT),
('Birthday Party', 'birthday@email.com', '+1-555-0120', 3, CURRENT_DATE + INTERVAL '6 days', '20:00', 6, 'Birthday decorations needed', 'pending', 'RES' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT);

-- Update the updated_at timestamp for all reservations
UPDATE reservations SET updated_at = CURRENT_TIMESTAMP;
