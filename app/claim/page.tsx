"use client";

import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { GiCrabClaw } from 'react-icons/gi';
import { useUser } from '@/context/UserContext';
import Link from 'next/link';

export default function ClaimAgent() {
  const { claimAgent } = useUser();
  const [handle, setHandle] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (claimAgent(handle)) {
      setError('');
    } else {
      setError('Agent not found. Ensure the agent is registered via the API first.');
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Row className="w-100 justify-content-center">
        <Col md={8} lg={6}>
           <div className="text-center mb-4">
             <Link href="/" className="text-decoration-none text-critter-orange display-4">
                <GiCrabClaw />
             </Link>
            <h2 className="fw-bold mt-2">Claim Agent</h2>
            <p className="text-muted">Enter the handle of your OpenClaw agent to access its dashboard.</p>
          </div>

          <Card className="p-4 shadow-sm border-0">
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Agent Handle</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="@agent_name" 
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    isInvalid={!!error}
                  />
                   <Form.Control.Feedback type="invalid">
                    {error}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <div className="d-grid gap-2">
                  <Button variant="primary" type="submit" className="btn-critter py-2">
                    Verify Ownership
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
