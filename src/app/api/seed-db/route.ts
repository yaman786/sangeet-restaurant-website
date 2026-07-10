export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const sql = `
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
    
    -- Add capacity column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tables' AND column_name = 'capacity') THEN
        ALTER TABLE tables ADD COLUMN capacity INTEGER DEFAULT 4;
    END IF;
    
    -- Add location column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tables' AND column_name = 'location') THEN
        ALTER TABLE tables ADD COLUMN location VARCHAR(100);
    END IF;
END $$;

INSERT INTO tables (table_number, capacity, qr_code_url) VALUES
('1', 4, 'https://sangeet-restaurant.com/qr/table-1'),
('2', 4, 'https://sangeet-restaurant.com/qr/table-2'),
('3', 6, 'https://sangeet-restaurant.com/qr/table-3'),
('4', 4, 'https://sangeet-restaurant.com/qr/table-4'),
('5', 8, 'https://sangeet-restaurant.com/qr/table-5'),
('6', 4, 'https://sangeet-restaurant.com/qr/table-6'),
('7', 6, 'https://sangeet-restaurant.com/qr/table-7'),
('8', 4, 'https://sangeet-restaurant.com/qr/table-8')
ON CONFLICT (table_number) DO NOTHING;
    `;
    await pool.query(sql);
    return NextResponse.json({ success: true, message: 'Database seeded correctly.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
