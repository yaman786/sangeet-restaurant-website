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
END $$; 