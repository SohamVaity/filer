// src/components/FeatureLayout.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './FeatureLayout.css';

export default function FeatureLayout({ title, children }) {
  return (
    <section className="feature-page">
      <Link className="back-home" to="/"> ← Back to Home</Link>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
