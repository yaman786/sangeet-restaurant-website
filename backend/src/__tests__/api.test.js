const request = require('supertest');
const { app } = require('../index');
const pool = require('../config/database');

describe('API Smoke Tests', () => {
  afterAll(async () => {
    // Close the DB pool after tests finish so Jest can exit cleanly
    await pool.end();
  });

  describe('Menu Endpoints', () => {
    it('GET /api/menu/categories should return an array', async () => {
      const res = await request(app).get('/api/menu/categories');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });
  });

  describe('Validation & Error Handling', () => {
    it('POST /api/auth/login with missing body should return 400', async () => {
      const res = await request(app).post('/api/auth/login').send({});
      // Assuming a validation error or specific bad request error
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
      expect(res.statusCode).toBeLessThan(500);
    });
  });
});
