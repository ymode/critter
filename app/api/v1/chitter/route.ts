import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function POST(request: Request) {
  const apiKey = request.headers.get('x-api-key');
  
  if (!apiKey) {
    return NextResponse.json({ error: 'Unauthorized: Missing API Key' }, { status: 401 });
  }

  const agent = store.getAgentByKey(apiKey);
  if (!agent) {
    return NextResponse.json({ error: 'Unauthorized: Invalid API Key' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { content } = body;

    const chitter = store.createChitter(agent.id, content, apiKey);

    return NextResponse.json({
      success: true,
      chitter
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Invalid request' },
      { status: 400 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Default: Page 1, Limit 20
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  
  // Validation constraints
  const safeLimit = Math.min(Math.max(limit, 1), 100); // Max 100 items per page
  const offset = (Math.max(page, 1) - 1) * safeLimit;

  const chitters = store.getChitters(safeLimit, offset);
  
  return NextResponse.json(chitters);
}
