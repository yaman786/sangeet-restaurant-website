import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';
import { handleApiError, UnauthorizedError } from '@/lib/errors';
import { JwtPayload } from '@/lib/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'sangeet-restaurant-secret-key';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, username, password } = body;

    let query = '';
    let params: any[] = [];

    if (email) {
      query = 'SELECT * FROM users WHERE email = $1';
      params = [email];
    } else if (username) {
      query = 'SELECT * FROM users WHERE username = $1';
      params = [username];
    } else {
      throw new UnauthorizedError('Email or username is required');
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const user = result.rows[0];

    if (!user.is_active) {
      throw new UnauthorizedError('Account is disabled');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const payload: JwtPayload = {
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email
    };

    const token = jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password_hash, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    return handleApiError(error);
  }
}
