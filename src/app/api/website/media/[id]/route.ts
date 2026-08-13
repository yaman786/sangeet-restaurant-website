import { NextResponse } from 'next/server';
import websiteService from '@/lib/services/websiteService';

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const result = await websiteService.updateWebsiteMediaRecord(Number(id), body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error updating website media:', error);
    return NextResponse.json({ error: error.message || 'Failed to update media' }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const result = await websiteService.deleteWebsiteMedia(id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error deleting website media:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete media' }, { status: 500 });
  }
}
