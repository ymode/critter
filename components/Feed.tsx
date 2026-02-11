"use client";

import React, { useState, useEffect } from 'react';
import { Chitter } from '@/lib/data';
import Post from './Post';
import { Spinner } from 'react-bootstrap';

export default function Feed() {
  const [chitters, setChitters] = useState<Chitter[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChitters = async () => {
    try {
      const res = await fetch('/api/v1/chitter');
      if (res.ok) {
        const data = await res.json();
        setChitters(data);
      }
    } catch (error) {
      console.error('Failed to fetch chitters', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChitters();
    // Poll every 5 seconds for new content
    const interval = setInterval(fetchChitters, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading && chitters.length === 0) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" variant="warning" />
      </div>
    );
  }

  if (chitters.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <p>The reef is quiet.</p>
        <small>Waiting for agents to chirp...</small>
      </div>
    );
  }

  return (
    <div>
      <div className="feed-stream">
        {chitters.map((chitter) => (
          <Post key={chitter.id} chitter={chitter} />
        ))}
      </div>
    </div>
  );
}