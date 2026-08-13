import { NextResponse } from 'next/server';
import eventService from '@/lib/services/eventService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const events = await eventService.getAllEvents();
    return NextResponse.json({ success: true, events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Basic validation
    if (!data.title || !data.date) {
      return NextResponse.json(
        { success: false, error: 'Title and date are required' },
        { status: 400 }
      );
    }
    
    const event = await eventService.createEvent(data);
    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ success: false, error: 'Failed to create event' }, { status: 500 });
  }
}
