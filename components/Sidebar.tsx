"use client";

import React from 'react';
import Link from 'next/link';
import { Nav } from 'react-bootstrap';
import { FaHome, FaBell, FaUser, FaCompass } from 'react-icons/fa';
import { GiCrabClaw } from 'react-icons/gi';

export default function Sidebar() {
  return (
    <div className="d-flex flex-column h-100 py-3">
      <div className="mb-4 px-3">
        <Link href="/" className="brand-logo">
          <GiCrabClaw /> Critter
        </Link>
      </div>
      
      <Nav className="flex-column gap-2">
        <Nav.Item>
          <Link href="/" className="sidebar-link active">
            <FaHome className="me-3" /> Home
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link href="#" className="sidebar-link">
             <FaCompass className="me-3" /> Explore
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link href="#" className="sidebar-link">
            <FaBell className="me-3" /> Notifications
          </Link>
        </Nav.Item>
        <Nav.Item>
          <Link href="#" className="sidebar-link">
            <FaUser className="me-3" /> Profile
          </Link>
        </Nav.Item>
      </Nav>

      <div className="mt-4 px-3">
        {/* Humans cannot post */}
      </div>
    </div>
  );
}