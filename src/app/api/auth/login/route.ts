export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db';
import { handleApiError, UnauthorizedError } from '@/lib/errors';
import { JwtPayload } from '@/lib/auth';
import type { UserRole } from '@/lib/types';
import { loginSchema } from '@/lib/validations';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set');
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    // Validate with Zod
    const { username, password } = loginSchema.parse(rawBody);

    const user = await prisma.users.findUnique({
      where: { username }
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

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
      role: user.role as UserRole,
      email: user.email
    };

    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    const token = jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userWithoutPassword } = user;

    const response = NextResponse.json({
      message: 'Login successful',
      user: userWithoutPassword
    });

    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
