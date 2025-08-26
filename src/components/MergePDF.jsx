import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';

export default function MergePDF() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [mergedPdfUrl, setMergedPdfUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isMerging, setIsMerging] = useState(false);

  // Handler for file input change
  const handleFileChange = (event) => {
    // Accept only PDF files
    const files = Array.from(event.target.files).filter(file => file.type === 'application/pdf');
    if (files.length === 0) {
      setError('Please select PDF files only');
      return;
    }
    setError(null);
    setSelectedFiles(files);
    setMergedPdfUrl(null); // reset previous result
  };

  // Merge multiple PDFs into one
  const mergePdfs = async () => {
    if (selectedFiles.length < 2) {
      setError('Please select at least two PDF files to merge.');
      return;
    }
    setError(null);
    setIsMerging(true);
    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of selectedFiles) {
        const fileBytes = await file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setMergedPdfUrl(url);
    } catch (e) {
      console.error(e);
      setError('Failed to merge PDFs. Please try again.');
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div style={{ marginTop: 40 }}>
      <h2>Merge PDFs</h2>

      <input
        type="file"
        multiple
        accept="application/pdf"
        onChange={handleFileChange}
      />

      {selectedFiles.length > 0 && (
        <div style={{ margin: "10px 0" }}>
          <h4>Files to merge:</h4>
          <ul>
            {selectedFiles.map((file, i) => (
              <li key={i}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button
        onClick={mergePdfs}
        disabled={isMerging || selectedFiles.length < 2}
        style={{
          backgroundColor: isMerging ? '#aaa' : '#6200ee',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: 6,
          cursor: isMerging ? 'not-allowed' : 'pointer',
          marginTop: 10,
        }}
      >
        {isMerging ? 'Merging...' : 'Merge PDFs'}
      </button>

      {mergedPdfUrl && (
        <div style={{ marginTop: 20 }}>
          <a href={mergedPdfUrl} download="merged.pdf" style={{ color: '#6200ee' }}>
            Download Merged PDF
          </a>
        </div>
      )}
    </div>
  );
}
