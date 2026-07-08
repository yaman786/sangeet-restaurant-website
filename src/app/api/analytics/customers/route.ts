export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import analyticsService from '@/lib/services/analyticsService';
import { handleApiError } from '@/lib/errors';
import { authenticateToken, requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const result = await analyticsService.getCustomerInsights();
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

