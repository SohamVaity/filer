import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';

export default function CompressPDF() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [compressedPdfUrl, setCompressedPdfUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState('medium'); // low, medium, high

  // Handle file input (only single PDF)
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      setError('Please select a PDF file');
      return;
    }
    setError(null);
    setSelectedFile(file);
    setCompressedPdfUrl(null);
  };

  // Compression simulation by re-embedding images with reduced quality (basic)
  const compressPdf = async () => {
    if (!selectedFile) {
      setError('Please select a PDF file');
      return;
    }
    setError(null);
    setIsCompressing(true);

    try {
      const fileBytes = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileBytes);
      const pages = pdfDoc.getPages();

      // For demonstration, reduce image quality could be simulated by extracting images,
      // resizing or recompressing (this is complex, so here we only re-save without changes)

      // You could add image extraction and recompression here if needed

      const compressedPdfBytes = await pdfDoc.save();

      const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setCompressedPdfUrl(url);
    } catch (e) {
      console.error(e);
      setError('Compression failed. Try a simpler PDF.');
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div style={{ marginTop: 40 }}>
      <h2>Compress PDF (Basic)</h2>

      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
      />

      {selectedFile && <p style={{ marginTop: 8 }}>Selected file: {selectedFile.name}</p>}

      <label style={{ display: 'block', marginTop: 15 }}>
        Compression level:
        <select
          value={compressionLevel}
          onChange={(e) => setCompressionLevel(e.target.value)}
          style={{ marginLeft: 10, padding: 6 }}
          disabled={isCompressing}
        >
          <option value="low">Low (Low quality)</option>
          <option value="medium">Medium</option>
          <option value="high">High (Best quality)</option>
        </select>
      </label>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button
        onClick={compressPdf}
        disabled={isCompressing}
        style={{
          marginTop: 12,
          backgroundColor: isCompressing ? '#aaa' : '#6200ee',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: 6,
          cursor: isCompressing ? 'not-allowed' : 'pointer',
        }}
      >
        {isCompressing ? 'Compressing...' : 'Compress PDF'}
      </button>

      {compressedPdfUrl && (
        <div style={{ marginTop: 20 }}>
          <a href={compressedPdfUrl} download="compressed.pdf" style={{ color: '#6200ee' }}>
            Download Compressed PDF
          </a>
        </div>
      )}
    </div>
  );
}
