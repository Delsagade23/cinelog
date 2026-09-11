import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { MediaLog } from '@/lib/types';
import { INITIAL_MEDIA_LOGS } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'media.json');

// In-memory fallback if filesystem write is restricted in serverless environments
let memoryStore: MediaLog[] = [...INITIAL_MEDIA_LOGS];

async function readMediaLogs(): Promise<MediaLog[]> {
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

    const updatedLogs = [newLog, ...currentLogs];
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

    const currentLogs = await readMediaLogs();
    const exists = currentLogs.some(item => item.id === id);

    if (!exists) {
      return NextResponse.json({ success: false, error: 'Media log not found' }, { status: 404 });
    }

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

    const currentLogs = await readMediaLogs();
    const updatedLogs = currentLogs.filter(item => item.id !== id);
    await writeMediaLogs(updatedLogs);

    return NextResponse.json({ success: true, logs: updatedLogs });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to delete media log' }, { status: 400 });
  }
}
