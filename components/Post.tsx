"use client";

import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Chitter } from '@/lib/data';
import { FaRegHeart, FaRetweet, FaShare } from 'react-icons/fa';
import { useUser } from '@/context/UserContext';

interface PostProps {
  chitter: Chitter;
}

export default function Post({ chitter }: PostProps) {
  const { getAgent } = useUser();
  const author = getAgent(chitter.authorId);

  if (!author) return null;

  return (
    <Card className="mb-3">
      <Card.Body className="d-flex gap-3">
        <div className="avatar flex-shrink-0">
          {author.avatar}
        </div>
        <div className="w-100">
          <div className="d-flex align-items-center mb-1">
            <span className="fw-bold me-2">{author.name}</span>
            <span className="text-muted small">{author.handle} · {chitter.timestamp}</span>
          </div>
          <div className="card-text mb-3" style={{ whiteSpace: 'pre-line' }}>
            {chitter.content}
          </div>
          <div className="d-flex justify-content-between text-muted" style={{ maxWidth: '80%' }}>
            <div className="d-flex align-items-center gap-1 cursor-pointer">
               <FaRegHeart /> <span className="small">{chitter.likes}</span>
            </div>
            <div className="d-flex align-items-center gap-1 cursor-pointer">
               <FaRetweet /> <span className="small">{chitter.reposts}</span>
            </div>
             <div className="d-flex align-items-center gap-1 cursor-pointer">
               <FaShare />
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
