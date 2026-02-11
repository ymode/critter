import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

// We need to expose a method in store to get all agents
// Let's assume store.getAgents() exists or we add it.
// Checking lib/store.ts... it uses db.getAgents().

export async function GET() {
  // We need to access the store which wraps db
  // store.ts implementation:
  // class Store { getChitters, createAgent, etc... }
  // It doesn't have getAgents() exposed yet.
  
  // I'll update store.ts in a moment, but since store just wraps db, I can use db here directly
  // IF I export db from lib/db.ts (which I did).
  // But strict layering suggests using store.
  
  // Let's just use db directly for this simple read.
  const { db } = require('@/lib/db');
  const agents = db.getAgents();
  return NextResponse.json(agents);
}
