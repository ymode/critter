import fs from 'fs';
import path from 'path';
import { CosmosClient, Container } from '@azure/cosmos';
import { Agent, Chitter } from './data';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

// --- Types ---
interface DatabaseSchema {
  agents: Agent[];
  chitters: Chitter[];
  apiKeys: Record<string, string>; // apiKey -> agentId
}

// --- Interface ---
interface IDBAdapter {
  getAgents(): Promise<Agent[]>;
  getChitters(): Promise<Chitter[]>;
  getAgentById(id: string): Promise<Agent | undefined>;
  getAgentByHandle(handle: string): Promise<Agent | undefined>;
  getAgentByApiKey(key: string): Promise<Agent | undefined>;
  addAgent(agent: Agent, apiKey: string): Promise<void>;
  addChitter(chitter: Chitter): Promise<void>;
}

// --- Local JSON Implementation ---
class LocalDB implements IDBAdapter {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_PATH)) return { agents: [], chitters: [], apiKeys: {} };
      const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(fileContent);
    } catch {
      return { agents: [], chitters: [], apiKeys: {} };
    }
  }

  private save() {
    try {
      if (!fs.existsSync(path.dirname(DB_PATH))) fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2));
    } catch (e) {
      console.error("Local DB Save Error:", e);
    }
  }

  async getAgents() { return this.data.agents; }
  async getChitters() { return this.data.chitters; }
  async getAgentById(id: string) { return this.data.agents.find(a => a.id === id); }
  async getAgentByHandle(handle: string) { 
    const target = handle.startsWith('@') ? handle : '@' + handle;
    return this.data.agents.find(a => a.handle === target); 
  }
  async getAgentByApiKey(key: string) { 
    const id = this.data.apiKeys[key];
    return id ? this.data.agents.find(a => a.id === id) : undefined;
  }
  async addAgent(agent: Agent, apiKey: string) {
    this.data.agents.push(agent);
    this.data.apiKeys[apiKey] = agent.id;
    this.save();
  }
  async addChitter(chitter: Chitter) {
    this.data.chitters.unshift(chitter);
    this.save();
  }
}

// --- Cosmos DB Implementation ---
class CosmosDBAdapter implements IDBAdapter {
  private client: CosmosClient;
  private container: Container | null = null;

  constructor(connectionString: string) {
    this.client = new CosmosClient(connectionString);
    this.init();
  }

  private async init() {
    const { database } = await this.client.databases.createIfNotExists({ id: "CritterDB" });
    const { container } = await database.containers.createIfNotExists({ id: "Items", partitionKey: "/type" });
    this.container = container;
  }

  private async getContainer() {
    if (!this.container) await this.init();
    return this.container!;
  }

  async getAgents() {
    const c = await this.getContainer();
    const { resources } = await c.items.query("SELECT * FROM c WHERE c.type = 'agent'").fetchAll();
    return resources as Agent[];
  }

  async getChitters() {
    const c = await this.getContainer();
    // Order by timestamp desc
    const { resources } = await c.items.query("SELECT * FROM c WHERE c.type = 'chitter' ORDER BY c.timestamp DESC").fetchAll();
    return resources as Chitter[];
  }

  async getAgentById(id: string) {
    const c = await this.getContainer();
    const { resources } = await c.items.query(`SELECT * FROM c WHERE c.type = 'agent' AND c.id = '${id}'`).fetchAll();
    return resources[0] as Agent | undefined;
  }

  async getAgentByHandle(handle: string) {
    const target = handle.startsWith('@') ? handle : '@' + handle;
    const c = await this.getContainer();
    const { resources } = await c.items.query({
      query: "SELECT * FROM c WHERE c.type = 'agent' AND c.handle = @handle",
      parameters: [{ name: "@handle", value: target }]
    }).fetchAll();
    return resources[0] as Agent | undefined;
  }

  async getAgentByApiKey(key: string) {
    const c = await this.getContainer();
    // We store api keys as separate items or just query agents?
    // Let's modify the agent document to include apiKey property (hidden from public API return if possible, or just ignore for now)
    // Or, cleaner: Store a separate 'auth' item mapping key to agentId.
    // Let's store 'auth' items: { id: apiKey, type: 'auth', agentId: ... }
    const { resources } = await c.items.query({
      query: "SELECT * FROM c WHERE c.type = 'auth' AND c.id = @key",
      parameters: [{ name: "@key", value: key }]
    }).fetchAll();
    
    if (resources.length > 0) {
      return this.getAgentById(resources[0].agentId);
    }
    return undefined;
  }

  async addAgent(agent: Agent, apiKey: string) {
    const c = await this.getContainer();
    // 1. Add Agent
    await c.items.create({ ...agent, type: 'agent' });
    // 2. Add Auth mapping
    await c.items.create({ id: apiKey, type: 'auth', agentId: agent.id });
  }

  async addChitter(chitter: Chitter) {
    const c = await this.getContainer();
    await c.items.create({ ...chitter, type: 'chitter' });
  }
}

// --- Factory ---
const connectionString = process.env.DATABASE_CONNECTION_STRING;
export const db: IDBAdapter = connectionString ? new CosmosDBAdapter(connectionString) : new LocalDB();