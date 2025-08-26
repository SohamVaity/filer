import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';

export default function SplitPDF() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [pageRanges, setPageRanges] = useState('');
  const [zipUrl, setZipUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isSplitting, setIsSplitting] = useState(false);

  // Handle file input change (only 1 PDF)
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      setError('Please select a PDF file');
      return;
    }
    setError(null);
    setSelectedFile(file);
    setZipUrl(null);
  };

  // Parse user input ranges like '1-3,5,7-9'
  const parseRanges = (input) => {
    try {
      const ranges = input.split(',').map(part => part.trim()).filter(Boolean);
      const parsed = [];
      for (const range of ranges) {
        if (range.includes('-')) {
          const [start, end] = range.split('-').map(n => parseInt(n, 10));
          if (isNaN(start) || isNaN(end) || start > end) return null;
          parsed.push({ start, end });
        } else {
          const page = parseInt(range, 10);
          if (isNaN(page)) return null;
          parsed.push({ start: page, end: page });
        }
      }
      return parsed;
    } catch {
      return null;
    }
  };

  // Split the PDF based on page ranges and produce a ZIP blob URL
  const splitPdf = async () => {
    if (!selectedFile) {
      setError('Please select a PDF file');
      return;
    }
    const parsedRanges = parseRanges(pageRanges);
    if (!parsedRanges || parsedRanges.length === 0) {
      setError('Invalid page ranges format. Enter like: 1-3,5,7-9');
      return;
    }

    setError(null);
    setIsSplitting(true);

    try {
      const fileBytes = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileBytes);
      const totalPages = pdfDoc.getPageCount();

      // Use JSZip for creating zip file
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      let splitIndex = 1;
      for (const { start, end } of parsedRanges) {
        if (start < 1 || end > totalPages) {
          setError(`Page range ${start}-${end} out of bounds. Max pages: ${totalPages}`);
          setIsSplitting(false);
          return;
        }
        const newPdf = await PDFDocument.create();
        const copiedPages = await newPdf.copyPages(pdfDoc, rangeToPageIndices(start, end));
        copiedPages.forEach(page => newPdf.addPage(page));

        const pdfBytes = await newPdf.save();
        zip.file(`split_${splitIndex}.pdf`, pdfBytes);
        splitIndex++;
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      setZipUrl(url);
    } catch (e) {
      console.error(e);
      setError('Failed to split PDF. Please try again.');
    } finally {
      setIsSplitting(false);
    }
  };

  // Helper: convert 1-based start-end page numbers to 0-based indices
  const rangeToPageIndices = (start, end) => {
    const indices = [];
    for (let i = start - 1; i <= end - 1; i++) {
      indices.push(i);
    }
    return indices;
  };

  return (
    <div style={{ marginTop: 40 }}>
      <h2>Split PDF</h2>

      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
      />

      {selectedFile && (
        <p style={{ marginTop: 8 }}>Selected file: {selectedFile.name}</p>
      )}

      <label style={{ display: 'block', marginTop: 15 }}>
        Page ranges (e.g., 1-3,5,7-9):
        <input
          type="text"
          value={pageRanges}
          onChange={e => setPageRanges(e.target.value)}
          placeholder="Enter page ranges separated by commas"
          style={{ display: 'block', width: '100%', padding: '6px', marginTop: '6px' }}
        />
      </label>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button
        onClick={splitPdf}
        disabled={isSplitting}
        style={{
          marginTop: 12,
          backgroundColor: isSplitting ? '#aaa' : '#6200ee',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: 6,
          cursor: isSplitting ? 'not-allowed' : 'pointer',
        }}
      >
        {isSplitting ? 'Splitting...' : 'Split PDF'}
      </button>

      {zipUrl && (
        <div style={{ marginTop: 20 }}>
          <a href={zipUrl} download="splits.zip" style={{ color: '#6200ee' }}>
            Download Split PDFs (ZIP)
          </a>
        </div>
      )}
    </div>
  );
}
