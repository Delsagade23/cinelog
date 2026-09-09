import { NextRequest, NextResponse } from 'next/server';
import { searchTMDb } from '@/lib/tmdb';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const type = (searchParams.get('type') || 'multi') as 'movie' | 'tv' | 'multi';

  if (!query.trim()) {
    return NextResponse.json({ results: [] });
  }

  const results = await searchTMDb(query, type);
  return NextResponse.json({ results });
}
