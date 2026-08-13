export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import websiteService from '@/lib/services/websiteService';
import { handleApiError } from '@/lib/errors';

export async function GET() {
  try {
    const configData = await websiteService.getPublicWebsiteConfig();
    return NextResponse.json(configData, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
