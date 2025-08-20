-- Tables Management Schema

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
