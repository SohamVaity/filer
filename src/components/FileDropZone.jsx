// src/components/FileDropZone.jsx
import React, { useRef, useState } from 'react';
import './FileDropZone.css';

export default function FileDropZone({ accept, multiple, onFilesChange }) {
  const inputRef = useRef();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFiles = (files) => {
    const acceptedFiles = Array.from(files).filter(file =>
      accept ? accept.split(',').includes(file.type) || accept.split(',').some(ext => file.name.toLowerCase().endsWith(ext)) : true
    );
    if (acceptedFiles.length === 0) return;
    onFilesChange(acceptedFiles);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const openFileDialog = () => {
    if (inputRef.current) inputRef.current.click();
  };

  const onInputChange = (e) => {
    handleFiles(e.target.files);
    e.target.value = ''; // reset so same file can be selected again
  };

  return (
    <div
      className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={openFileDialog}
      tabIndex={0}
      role="button"
      aria-label="File upload drop zone"
    >
      <input
        type="file"
        ref={inputRef}
        accept={accept}
        multiple={multiple}
        onChange={onInputChange}
        style={{ display: 'none' }}
      />
      <div className="drop-zone-content">
        <span role="img" aria-label="upload">↧</span>
        <p>Drag & drop files here, or <span className="click-here">Click to browse</span></p>
      </div>
    </div>
  );
}
