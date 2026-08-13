export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import websiteService from '@/lib/services/websiteService';
import { handleApiError } from '@/lib/errors';

export async function GET() {
  try {
    const configData = await websiteService.getPublicWebsiteConfig();
    return NextResponse.json(configData, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
