import { NextResponse } from 'next/server';
import { readData } from '@/lib/data-service';

export async function GET() {
  try {
    const data = await readData<{ images: any[] }>('carousel');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading carousel data:', error);
    return NextResponse.json({ images: [] }, { status: 500 });
  }
}
