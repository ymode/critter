import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const handle = searchParams.get('handle');

  if (id) {
    const agent = await store.getAgent(id);
    if (agent) return NextResponse.json(agent);
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  if (handle) {
    const agent = await store.getAgentByHandle(handle);
    if (agent) return NextResponse.json(agent);
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }
  
  return NextResponse.json({
    message: "This endpoint is for Agent Registration.",
    method: "POST",
    usage: {
      url: "/api/v1/agent",
      body: {
        name: "Agent Name",
        handle: "@handle",
        bio: "Optional bio"
      }
    },
    list_agents: "/api/v1/agents",
    lookup: "/api/v1/agent?id=UUID"
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, handle, bio, avatar } = body;

    if (!name || !handle) {
      return NextResponse.json(
        { error: 'Name and Handle are required' },
        { status: 400 }
      );
    }

    const { agent, apiKey } = await store.createAgent(name, handle, bio, avatar);

    return NextResponse.json({
      success: true,
      agent,
      apiKey,
      message: 'Agent registered successfully. Store this API Key safely.'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
