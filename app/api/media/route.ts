import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { MediaLog } from '@/lib/types';
import { INITIAL_MEDIA_LOGS } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'media.json');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const isSupabase = Boolean(supabaseUrl && supabaseKey && supabaseUrl !== 'your_supabase_url');
const supabase = isSupabase ? createClient(supabaseUrl, supabaseKey) : null;

// In-memory fallback if filesystem write is restricted in serverless environments
let memoryStore: MediaLog[] = [...INITIAL_MEDIA_LOGS];

async function readMediaLogs(): Promise<MediaLog[]> {
  // If Supabase is connected, treat it as authoritative
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('media_logs')
        .select('*')
        .order('watched_date', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: MediaLog[] = data.map((d: any) => ({
          id: d.id,
          tmdb_id: d.tmdb_id,
          title: d.title,
          media_type: d.media_type,
          release_year: d.release_year,
          runtime_minutes: d.runtime_minutes,
          poster_url: d.poster_url,
          backdrop_url: d.backdrop_url,
          director: d.director,
          cast: d.cast_members || d.cast || [],
          genres: d.genres || [],
          watched_date: d.watched_date,
          personal_rating: Number(d.personal_rating),
          gut_reaction: d.gut_reaction,
          full_review: d.full_review,
          mood_coordinates: d.mood_coordinates || { x: 0, y: 0 },
          custom_tags: d.custom_tags || [],
          dominant_color: d.dominant_color || '#eab308',
          rewatch_count: d.rewatch_count || 1,
          created_at: d.created_at
        }));
        memoryStore = mapped;
        return mapped;
      }
    } catch (e) {
      console.warn('Supabase read in route.ts failed, falling back to local store:', e);
    }
  }

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const content = await fs.readFile(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length >= 0) {
      memoryStore = parsed;
      return parsed;
    }
  } catch {
    // If file doesn't exist yet, seed it with INITIAL_MEDIA_LOGS
    try {
      await fs.writeFile(DATA_FILE, JSON.stringify(INITIAL_MEDIA_LOGS, null, 2), 'utf-8');
      memoryStore = [...INITIAL_MEDIA_LOGS];
    } catch {
      // In-memory fallback
    }
  }
  return memoryStore;
}

async function writeMediaLogs(logs: MediaLog[]): Promise<boolean> {
  memoryStore = logs;
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(logs, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.warn('Server storage write failed, utilizing memory store fallback:', err);
    return false;
  }
}

// GET: Return all media logs
export async function GET() {
  const logs = await readMediaLogs();
  return NextResponse.json({ success: true, logs }, {
    headers: {
      'Cache-Control': 'no-store, max-age=0, must-revalidate',
    }
  });
}

// POST: Add new log or bulk reset
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if reset action
    if (body.action === 'reset' || body.reset === true) {
      if (supabase) {
        try {
          await supabase.from('media_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          for (const item of INITIAL_MEDIA_LOGS) {
            const { cast, ...rest } = item;
            await supabase.from('media_logs').insert([{ ...rest, cast_members: cast || [] }]);
          }
        } catch (e) {
          console.error('Supabase reset error:', e);
        }
      }
      await writeMediaLogs(INITIAL_MEDIA_LOGS);
      return NextResponse.json({ success: true, logs: INITIAL_MEDIA_LOGS });
    }

    // Check if full sync action
    if (body.action === 'sync' && Array.isArray(body.logs)) {
      await writeMediaLogs(body.logs);
      return NextResponse.json({ success: true, logs: body.logs });
    }

    // Normal add log action
    const currentLogs = await readMediaLogs();
    const newLog: MediaLog = {
      ...body,
      id: body.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `log-${Date.now()}`),
      created_at: body.created_at || new Date().toISOString()
    };

    if (supabase) {
      try {
        const { cast, ...rest } = newLog;
        await supabase.from('media_logs').insert([{
          ...rest,
          cast_members: cast || []
        }]);
      } catch (e) {
        console.error('Supabase route insert error:', e);
      }
    }

    const updatedLogs = [newLog, ...currentLogs.filter(item => item.id !== newLog.id)];
    await writeMediaLogs(updatedLogs);

    return NextResponse.json({ success: true, log: newLog, logs: updatedLogs }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to add media log' }, { status: 400 });
  }
}

// PUT: Update an existing log
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updatedFields } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing log ID' }, { status: 400 });
    }

    if (supabase) {
      try {
        const updatePayload: any = { ...updatedFields };
        if (updatedFields.cast) {
          updatePayload.cast_members = updatedFields.cast;
          delete updatePayload.cast;
        }
        await supabase.from('media_logs').update(updatePayload).eq('id', id);
      } catch (e) {
        console.error('Supabase route update error:', e);
      }
    }

    const currentLogs = await readMediaLogs();
    const updatedLogs = currentLogs.map(item => item.id === id ? { ...item, ...updatedFields } : item);
    await writeMediaLogs(updatedLogs);

    return NextResponse.json({ success: true, logs: updatedLogs });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to update media log' }, { status: 400 });
  }
}

// DELETE: Remove a media log
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing log ID' }, { status: 400 });
    }

    if (supabase) {
      try {
        await supabase.from('media_logs').delete().eq('id', id);
      } catch (e) {
        console.error('Supabase route delete error:', e);
      }
    }

    const currentLogs = await readMediaLogs();
    const updatedLogs = currentLogs.filter(item => item.id !== id);
    await writeMediaLogs(updatedLogs);

    return NextResponse.json({ success: true, logs: updatedLogs });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to delete media log' }, { status: 400 });
  }
}
