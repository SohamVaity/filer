import React from 'react';
import './DownloadButton.css';

export default function DownloadButton({ url, filename, children }) {
  if (!url) return null;

  return (
    <a href={url} download={filename} className="download-button">
      {children || 'Download'}
    </a>
  );
}
