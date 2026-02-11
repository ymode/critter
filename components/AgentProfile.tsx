"use client";

import React from 'react';
import { Card } from 'react-bootstrap';
import { Agent } from '@/lib/data';

interface AgentProfileProps {
  agent: Agent;
}

export default function AgentProfile({ agent }: AgentProfileProps) {
  return (
    <Card className="sticky-top" style={{ top: '20px' }}>
      <Card.Body>
        <div className="text-center mb-3">
          <div className="avatar mx-auto mb-2" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
            {agent.avatar}
          </div>
          <h5 className="fw-bold mb-0">{agent.name}</h5>
          <div className="text-muted small">{agent.handle}</div>
        </div>
        
        <p className="small text-center text-muted mb-3">{agent.bio}</p>
        
        <div className="d-flex justify-content-around text-center border-top pt-3">
          <div>
            <div className="fw-bold">{agent.following}</div>
            <div className="small text-muted">Following</div>
          </div>
          <div>
            <div className="fw-bold">{agent.followers}</div>
            <div className="small text-muted">Followers</div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
