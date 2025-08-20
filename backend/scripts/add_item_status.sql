-- Migration: Add item status tracking to order_items table
-- This allows tracking individual item status (pending, preparing, ready)

-- Add status column to order_items table
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';

-- Add updated_at column to order_items table
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_order_items_status ON order_items(status);

-- Update existing order_items to have 'ready' status if their order is completed
UPDATE order_items 
SET status = 'ready' 
WHERE order_id IN (
    SELECT id FROM orders WHERE status = 'completed'
);

-- Update existing order_items to have 'preparing' status if their order is preparing
UPDATE order_items 
SET status = 'preparing' 
WHERE order_id IN (
    SELECT id FROM orders WHERE status = 'preparing'
);

-- Update existing order_items to have 'ready' status if their order is ready
UPDATE order_items 
SET status = 'ready' 
WHERE order_id IN (
    SELECT id FROM orders WHERE status = 'ready'
);
