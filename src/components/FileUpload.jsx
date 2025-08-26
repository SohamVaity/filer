import React, { useState, useCallback, useRef } from 'react';

export default function FileUpload({ accept = '*', multiple = true, onFilesChange }) {
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  // Handle files from input or drop
  const handleFiles = useCallback((selectedFiles) => {
    const newFiles = Array.from(selectedFiles);

    setFiles(prevFiles => {
      // Avoid duplicates by name
      const allFiles = [...prevFiles];
      newFiles.forEach(file => {
        if (!allFiles.find(f => f.name === file.name)) {
          allFiles.push(file);
        }
      });
      if (onFilesChange) onFilesChange(allFiles);
      return allFiles;
    });
  }, [onFilesChange]);

  // File input change
  const onInputChange = (e) => {
    handleFiles(e.target.files);
    e.target.value = ''; // reset input to allow re-select same files
  };

  // Drag & Drop handlers
  const onDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  // Remove single file
  const removeFile = (name) => {
    setFiles(prevFiles => {
      const filtered = prevFiles.filter(f => f.name !== name);
      if (onFilesChange) onFilesChange(filtered);
      return filtered;
    });
  };

  return (
    <div>
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onClick={() => fileInputRef.current.click()}
        style={{
          border: '2px dashed #aaa',
          padding: 20,
          borderRadius: 8,
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: 10,
          color: '#555',
          userSelect: 'none',
        }}
      >
        Drag & drop files here, or click to select files
      </div>

      <input
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={onInputChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />

      {files.length > 0 && (
        <ul style={{ listStyle: 'none', paddingLeft: 0, maxHeight: 200, overflowY: 'auto' }}>
          {files.map(file => (
            <li key={file.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span>{file.name}</span>
              <button
                onClick={() => removeFile(file.name)}
                style={{
                  border: 'none',
                  background: '#e74c3c',
                  color: 'white',
                  borderRadius: 4,
                  cursor: 'pointer',
                  padding: '2px 8px',
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
