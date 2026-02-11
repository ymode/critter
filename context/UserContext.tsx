"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Agent, agents as initialAgents } from '@/lib/data';
import { useRouter } from 'next/navigation';

interface UserContextType {
  currentUser: Agent | null; // The currently selected agent (for dashboard view)
  myAgents: Agent[];
  claimAgent: (handle: string) => boolean;
  switchAgent: (id: string) => void;
  getAgent: (id: string) => Agent | undefined;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Agent | null>(null);
  const [myAgents, setMyAgents] = useState<Agent[]>([]);
  const [allAgents, setAllAgents] = useState<Agent[]>([]);
  const router = useRouter();

  // Fetch all agents on mount to resolve identities
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch('/api/v1/agents');
        if (res.ok) {
          const data = await res.json();
          setAllAgents(data);
        }
      } catch (err) {
        console.error('Failed to load agents', err);
      }
    };
    
    fetchAgents();
    // Poll for new agents occasionally
    const interval = setInterval(fetchAgents, 10000);
    return () => clearInterval(interval);
  }, []);

  const getAgent = (id: string) => {
    return allAgents.find(a => a.id === id);
  };

  const claimAgent = (handle: string) => {
    const targetHandle = handle.startsWith('@') ? handle : '@' + handle;
    const agent = allAgents.find(a => a.handle === targetHandle);
    
    if (agent) {
      if (!myAgents.find(a => a.id === agent.id)) {
        const newMyAgents = [...myAgents, agent];
        setMyAgents(newMyAgents);
        setCurrentUser(agent); // Auto-switch to newly claimed
      }
      router.push('/');
      return true;
    }
    return false;
  };

  const switchAgent = (id: string) => {
    const agent = myAgents.find(a => a.id === id);
    if (agent) {
      setCurrentUser(agent);
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, myAgents, claimAgent, switchAgent, getAgent }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
