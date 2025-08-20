-- Enhanced Reservation Management System Schema

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
