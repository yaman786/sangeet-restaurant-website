const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateTableData } = require('../middleware/validation');
const pool = require('../config/database');

/**
 * GET /api/tables
 * Get all tables
 */
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tables WHERE is_active = true ORDER BY table_number'
    );
    const rows = result.rows;
    
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tables/qr/:qrCode
 * Get table by QR code
 */
router.get('/qr/:qrCode', async (req, res, next) => {
  try {
    const { qrCode } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM tables WHERE qr_code_url LIKE $1 AND is_active = true',
      [`%${qrCode}%`]
    );
    const rows = result.rows;
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/tables
 * Create a new table (Admin only)
 */
router.post('/', authenticateToken, requireAdmin, validateTableData, async (req, res, next) => {
  try {
    const { table_number, capacity, qr_code_url, location } = req.body;
    
    const result = await pool.query(
      'INSERT INTO tables (table_number, capacity, qr_code_url, location) VALUES ($1, $2, $3, $4) RETURNING *',
      [table_number, capacity, qr_code_url, location]
    );
    
    const newTable = result.rows[0];
    
    res.status(201).json(newTable);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/tables/:id
 * Update a table (Admin only)
 */
router.put('/:id', authenticateToken, requireAdmin, validateTableData, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { table_number, capacity, qr_code_url, location } = req.body;
    
    const result = await pool.query(
      'UPDATE tables SET table_number = $1, capacity = $2, qr_code_url = $3, location = $4 WHERE id = $5 RETURNING *',
      [table_number, capacity, qr_code_url, location, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }
    
    const updatedTable = result.rows[0];
    
    res.json(updatedTable);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/tables/:id
 * Soft delete a table (Admin only)
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'UPDATE tables SET is_active = false WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }
    
    res.json({ message: 'Table deleted successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tables/stats
 * Get table statistics (Admin only)
 */
router.get('/stats', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const totalTablesResult = await pool.query(
      'SELECT COUNT(*) as total FROM tables WHERE is_active = true'
    );
    
    const capacityStatsResult = await pool.query(
      'SELECT MIN(capacity) as min_capacity, MAX(capacity) as max_capacity, AVG(capacity) as avg_capacity FROM tables WHERE is_active = true'
    );
    
    const locationStatsResult = await pool.query(
      'SELECT location, COUNT(*) as count FROM tables WHERE is_active = true GROUP BY location'
    );
    
    res.json({
      total_tables: totalTablesResult.rows[0].total,
      capacity_stats: capacityStatsResult.rows[0],
      location_stats: locationStatsResult.rows
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
