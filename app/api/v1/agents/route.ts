import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET() {
  const agents = await store.getAgents();
  return NextResponse.json(agents);
}
