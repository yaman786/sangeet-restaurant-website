import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateTableData } from '../middleware/validation';
import * as orderController from '../controllers/orderController'; // Note: the original logic for tables was partly in tables.js, partly in orderController. Here I'll migrate it back, but let me check if orderController has them. Yes, I put getAllTables in orderController in the generated TS. Let's just create simple implementations here if needed, or route to orderController.
import pool from '../config/database';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM tables WHERE is_active = true ORDER BY table_number');
    res.json(result.rows);
  } catch (error) { next(error); }
});

router.get('/qr/:qrCode', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM tables WHERE qr_code_url LIKE $1 AND is_active = true', [`%${req.params.qrCode}%`]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Table not found' });
    res.json(result.rows[0]);
  } catch (error) { next(error); }
});

router.get('/stats', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const totalTables = await pool.query('SELECT COUNT(*) as total FROM tables WHERE is_active = true');
    const capacityStats = await pool.query('SELECT MIN(capacity) as min_capacity, MAX(capacity) as max_capacity, AVG(capacity) as avg_capacity FROM tables WHERE is_active = true');
    const locationStats = await pool.query('SELECT location, COUNT(*) as count FROM tables WHERE is_active = true GROUP BY location');
    res.json({ total_tables: totalTables.rows[0].total, capacity_stats: capacityStats.rows[0], location_stats: locationStats.rows });
  } catch (error) { next(error); }
});

router.get('/number/:tableNumber', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM tables WHERE table_number = $1 AND is_active = true', [req.params.tableNumber]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Table not found' });
    res.json(result.rows[0]);
  } catch (error) { next(error); }
});

router.post('/', authenticateToken, requireAdmin, validateTableData, async (req, res, next) => {
  try {
    const { table_number, capacity, qr_code_url, location } = req.body;
    const result = await pool.query(
      'INSERT INTO tables (table_number, capacity, qr_code_url, location) VALUES ($1, $2, $3, $4) RETURNING *',
      [table_number, capacity, qr_code_url, location]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { next(error); }
});

router.put('/:id', authenticateToken, requireAdmin, validateTableData, async (req, res, next) => {
  try {
    const { table_number, capacity, qr_code_url, location } = req.body;
    const result = await pool.query(
      'UPDATE tables SET table_number = $1, capacity = $2, qr_code_url = $3, location = $4 WHERE id = $5 RETURNING *',
      [table_number, capacity, qr_code_url, location, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Table not found' });
    res.json(result.rows[0]);
  } catch (error) { next(error); }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const result = await pool.query('UPDATE tables SET is_active = false WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Table not found' });
    res.json({ message: 'Table deleted successfully' });
  } catch (error) { next(error); }
});

export default router;
