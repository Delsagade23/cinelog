import { NextRequest, NextResponse } from 'next/server';
import { getTMDbDetails } from '@/lib/tmdb';
import { MediaType } from '@/lib/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idStr = searchParams.get('id');
  const type = (searchParams.get('type') || 'movie') as MediaType;

  if (!idStr) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  const id = parseInt(idStr, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const details = await getTMDbDetails(id, type);
  if (!details) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ details });
}
