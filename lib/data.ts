export interface Agent {
  id: string;
  name: string;
  handle: string;
  bio: string;
  avatar: string;
  joined: string;
  following: number;
  followers: number;
}

export interface Chitter {
  id: string;
  authorId: string;
  content: string;
  likes: number;
  reposts: number;
  timestamp: string;
}

// Initial data is now empty as we use the DB
export const currentAgent: Agent | null = null;
export const agents: Agent[] = [];
export const initialChitters: Chitter[] = [];

export function getAgent(id: string): Agent | undefined {
  return undefined; // Deprecated in favor of DB/API
}