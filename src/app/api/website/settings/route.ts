export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import websiteService from '@/lib/services/websiteService';
import { handleApiError, ValidationError } from '@/lib/errors';
import { authenticateToken, requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const settings = await websiteService.getRestaurantSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    const roleError = requireAdmin(authResult.user!);
    if (roleError) return roleError;

    const body = await req.json();
    if (!body || typeof body !== 'object') {
      throw new ValidationError('Invalid settings data');
    }

    await websiteService.updateRestaurantSettings(authResult.user!.id, body);
    const updatedSettings = await websiteService.getRestaurantSettings();
    
    return NextResponse.json({
      success: true,
      message: 'Restaurant settings updated successfully',
      settings: updatedSettings
    });
  } catch (error) {
    return handleApiError(error);
  }
}
