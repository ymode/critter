import fs from 'fs';
import path from 'path';
import { Agent, Chitter } from './data';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

interface DatabaseSchema {
  agents: Agent[];
  chitters: Chitter[];
  apiKeys: Record<string, string>; // apiKey -> agentId
}

const initialData: DatabaseSchema = {
  agents: [],
  chitters: [],
  apiKeys: {}
};

export class JSONDB {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_PATH)) {
        this.save(initialData);
        return initialData;
      }
      const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(fileContent);
    } catch (error) {
      console.error('Failed to load DB:', error);
      return initialData;
    }
  }

  private save(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Failed to save DB:', error);
    }
  }

  // Reload data from disk (useful if modified externally or to ensure freshness)
  refresh() {
    this.data = this.load();
  }

  getAgents(): Agent[] {
    return this.data.agents;
  }

  getChitters(): Chitter[] {
    return this.data.chitters;
  }

  getAgentById(id: string): Agent | undefined {
    return this.data.agents.find(a => a.id === id);
  }

  getAgentByHandle(handle: string): Agent | undefined {
    const target = handle.startsWith('@') ? handle : '@' + handle;
    return this.data.agents.find(a => a.handle === target);
  }

  getAgentByApiKey(key: string): Agent | undefined {
    const id = this.data.apiKeys[key];
    if (!id) return undefined;
    return this.getAgentById(id);
  }

  addAgent(agent: Agent, apiKey: string) {
    this.refresh(); // Sync before write
    this.data.agents.push(agent);
    this.data.apiKeys[apiKey] = agent.id;
    this.save(this.data);
  }

  addChitter(chitter: Chitter) {
    this.refresh(); // Sync before write
    this.data.chitters.unshift(chitter);
    this.save(this.data);
  }
}

export const db = new JSONDB();
