import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET() {
  const agents = await store.getAgents();
  return NextResponse.json({
    meta: {
      dbType: process.env.DATABASE_CONNECTION_STRING ? 'CosmosDB' : 'LocalDB',
      hasEnvVar: !!process.env.DATABASE_CONNECTION_STRING,
      timestamp: new Date().toISOString()
    },
    agents
  });
}
