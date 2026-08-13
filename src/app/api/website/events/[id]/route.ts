import { NextResponse, NextRequest } from 'next/server';
import eventService from '@/lib/services/eventService';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const event = await eventService.updateEvent(id, data);
    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    console.error('Error updating event:', error);
    if (error.name === 'NotFoundError') {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await eventService.deleteEvent(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting event:', error);
    if (error.name === 'NotFoundError') {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: 'Failed to delete event' }, { status: 500 });
  }
}
