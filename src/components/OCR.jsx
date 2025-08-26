import React, { useState } from 'react';
import Tesseract from 'tesseract.js';

export default function OCR() {
  const [imageFile, setImageFile] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle image file upload (jpg, png)
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file || !['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Please select a JPG or PNG image file');
      return;
    }
    setError(null);
    setImageFile(file);
    setOcrText('');
  };

  // Run OCR on image file using Tesseract.js
  const runOcr = async () => {
    if (!imageFile) {
      setError('Please upload an image first.');
      return;
    }
    setError(null);
    setIsProcessing(true);
    setOcrText('');

    try {
      const { data: { text } } = await Tesseract.recognize(
        imageFile,
        'eng',
        { logger: m => console.log(m) }
      );
      setOcrText(text);
    } catch (e) {
      console.error(e);
      setError('Failed to recognize text.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ marginTop: 40 }}>
      <h2>OCR (Image to Text)</h2>

      <input
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileChange}
      />

      {imageFile && <p style={{ marginTop: 10 }}>Selected file: {imageFile.name}</p>}

      <button
        onClick={runOcr}
        disabled={isProcessing}
        style={{
          marginTop: 10,
          backgroundColor: isProcessing ? '#aaa' : '#6200ee',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: 6,
          cursor: isProcessing ? 'not-allowed' : 'pointer',
        }}
      >
        {isProcessing ? 'Processing...' : 'Start OCR'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {ocrText && (
        <div style={{ marginTop: 20, whiteSpace: 'pre-wrap', backgroundColor: '#eee', padding: 10, borderRadius: 6 }}>
          <h4>Extracted Text:</h4>
          <p>{ocrText}</p>
        </div>
      )}
    </div>
  );
}

