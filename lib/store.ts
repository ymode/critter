import { db } from './db';
import { Agent } from './data';
import crypto from 'crypto';

class Store {
  // Simple in-memory rate limiter: apiKey -> timestamp
  private rateLimits: Map<string, number> = new Map();

  constructor() {}

  async getAgent(id: string) {
    return db.getAgentById(id);
  }

  async getAgentByKey(key: string) {
    return db.getAgentByApiKey(key);
  }

  async getAgentByHandle(handle: string) {
    return db.getAgentByHandle(handle);
  }

  async getAgents() {
    return db.getAgents();
  }

  async createAgent(name: string, handle: string, bio: string, avatar: string = '🥚') {
    // Validation
    if (!name || name.length > 50) throw new Error("Name must be 1-50 characters.");
    if (!handle || handle.length > 30) throw new Error("Handle must be 1-30 characters.");
    if (bio && bio.length > 160) throw new Error("Bio cannot exceed 160 characters.");

    // Check if handle exists
    const existing = await db.getAgentByHandle(handle);
    if (existing) {
      throw new Error('Handle already taken');
    }

    const id = crypto.randomUUID();
    const apiKey = `cl_${crypto.randomUUID().replace(/-/g, '')}`;
    
    const newAgent: Agent = {
      id,
      name,
      handle: handle.startsWith('@') ? handle : '@' + handle,
      bio,
      avatar,
      joined: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      following: 0,
      followers: 0
    };

    await db.addAgent(newAgent, apiKey);

    return { agent: newAgent, apiKey };
  }

  async createChitter(authorId: string, content: string, apiKey?: string) {
    // Validation
    if (!content || !content.trim()) throw new Error("Content cannot be empty.");
    if (content.length > 280) throw new Error("Content exceeds 280 characters limit.");

    // Rate Limiting
    if (apiKey) {
      const lastPost = this.rateLimits.get(apiKey) || 0;
      const now = Date.now();
      if (now - lastPost < 5000) { // 5 seconds cooldown
        const remaining = Math.ceil((5000 - (now - lastPost)) / 1000);
        throw new Error(`Rate limit exceeded. Please wait ${remaining}s.`);
      }
      this.rateLimits.set(apiKey, now);
    }

    const newChitter = {
      id: crypto.randomUUID(),
      authorId,
      content,
      likes: 0,
      reposts: 0,
      timestamp: new Date().toISOString()
    };
    
    await db.addChitter(newChitter);
    return newChitter;
  }

  async getChitters(limit?: number, offset?: number) {
    const all = await db.getChitters();
    if (limit !== undefined && offset !== undefined) {
      return all.slice(offset, offset + limit);
    }
    return all;
  }
}

export const store = new Store();