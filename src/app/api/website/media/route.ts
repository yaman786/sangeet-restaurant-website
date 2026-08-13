import { NextResponse } from 'next/server';
import websiteService from '@/lib/services/websiteService';

export async function GET() {
  try {
    const media = await websiteService.getWebsiteMedia();
    return NextResponse.json(media);
  } catch (error: any) {
    console.error('Error fetching website media:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch media' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const media_key = formData.get('media_key') as string;
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }
    
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // We mock the file object for the websiteService which expects an Express-like multer file
    const fileData = {
      buffer,
      originalname: file.name,
      mimetype: file.type
    };

    const result = await websiteService.uploadWebsiteMedia(1, fileData, { media_key });
    
    return NextResponse.json({ media: result });
  } catch (error: any) {
    console.error('Error uploading website media:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload media' }, { status: 500 });
  }
}
