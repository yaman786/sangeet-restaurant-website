export {};
import request from 'supertest';
import app from '../index';
import pool from '../config/database';

describe('Health and Keep-Alive Endpoints', () => {
  afterAll(async () => {
    // Close the DB pool after tests finish so Jest can exit cleanly
    await pool.end();
  });

  it('GET /api/health should return 200 and OK status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'OK');
    expect(res.body).toHaveProperty('database');
  });

  it('GET /api/keep-alive should return 200 and alive status', async () => {
    const res = await request(app).get('/api/keep-alive');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'alive');
  });
});
