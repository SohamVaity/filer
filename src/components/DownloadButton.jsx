// DownloadButton.jsx

import React from 'react';

export default function DownloadButton({ url, filename, children }) {
  if (!url) return null;

  return (
    <a
      href={url}
      download={filename}
      style={{
        display: 'inline-block',
        backgroundColor: '#95f594',
        color: '#111',
        padding: '14px 38px',
        borderRadius: '32px',
        fontWeight: '700',
        fontSize: '1.15rem',
        textDecoration: 'none',
        userSelect: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.25s ease',
        marginTop: '20px',
      }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#b3dba6')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#95f594')}
    >
      {children || 'Download'}
    </a>
  );
}
