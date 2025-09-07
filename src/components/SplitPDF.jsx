import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import FeatureLayout from './FeatureLayout';
import FileDropZone from './FileDropZone';

export default function SplitPDF() {
  const [files, setFiles] = useState([]);
  const [pageRanges, setPageRanges] = useState('');
  const [zipUrl, setZipUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isSplitting, setIsSplitting] = useState(false);

  const handleFilesChange = (newFiles) => {
    const file = newFiles[0];
    if (!file || file.type !== 'application/pdf') {
      setError('Please select a valid PDF file');
      setFiles([]);
      setZipUrl(null);
      return;
    }
    setError(null);
    setFiles([file]);
    setZipUrl(null);
  };

  const removeFile = (name) => {
    setFiles((prev) => prev.filter(f => f.name !== name));
    setZipUrl(null);
  };

  // parse page ranges string like "1-3,5,7-9"
  const parseRanges = (input) => {
    try {
      const parts = input.split(',').map(p => p.trim()).filter(Boolean);
      const ranges = [];
      for (const part of parts) {
        if (part.includes('-')) {
          const [start, end] = part.split('-').map(n => parseInt(n, 10));
          if (isNaN(start) || isNaN(end) || start > end) return null;
          ranges.push({ start, end });
        } else {
          const page = parseInt(part, 10);
          if (isNaN(page)) return null;
          ranges.push({ start: page, end: page });
        }
      }
      return ranges;
    } catch {
      return null;
    }
  };

  const rangeToIndices = (start, end) => {
    const indices = [];
    for (let i = start - 1; i <= end - 1; i++) {
      indices.push(i);
    }
    return indices;
  };

  const splitPdf = async () => {
    if (files.length === 0) {
      setError('Please select a PDF file');
      return;
    }
    const ranges = parseRanges(pageRanges);
    if (!ranges) {
      setError('Invalid page ranges format. Use e.g. 1-3,5,7-9');
      return;
    }
    setError(null);
    setIsSplitting(true);
    
    try {
      const selectedFile = files[0];
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const totalPages = pdfDoc.getPageCount();

      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      let index = 1;
      for (const range of ranges) {
        if (range.start < 1 || range.end > totalPages) {
          setError(`Page range ${range.start}-${range.end} is out of bounds. Max pages: ${totalPages}`);
          setIsSplitting(false);
          return;
        }
        const newPdf = await PDFDocument.create();
        const pages = await newPdf.copyPages(pdfDoc, rangeToIndices(range.start, range.end));
        pages.forEach(page => newPdf.addPage(page));
        const pdfBytes = await newPdf.save();
        zip.file(`split_${index}.pdf`, pdfBytes);
        index++;
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      setZipUrl(URL.createObjectURL(zipBlob));
    } catch (e) {
      console.error('SplitPDF error:', e);
      setError(`Failed to split PDF. ${e?.message || ''}`);
    } finally {
      setIsSplitting(false);
    }
  };

  return (
    <FeatureLayout title="Split PDF">
      {files.length > 0 && (
        <ul className="uploaded-files-list">
          {files.map(file => (
            <li key={file.name}>
              {file.name} <button className="file-remove-btn" onClick={() => removeFile(file.name)} aria-label={`Remove file ${file.name}`}>×</button>
            </li>
          ))}
        </ul>
      )}

      <FileDropZone accept="application/pdf" multiple={false} onFilesChange={handleFilesChange} />

      <input
        type="text"
        placeholder="Enter page ranges separated by commas (e.g. 1-3,5,7-9)"
        value={pageRanges}
        onChange={(e) => setPageRanges(e.target.value)}
        style={{ marginTop: 8, width: '100%', padding: 8, borderRadius: 8, borderColor: 'var(--primary)' }}
        disabled={isSplitting}
      />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button onClick={splitPdf} disabled={isSplitting} style={{ marginTop: 8 }}>
        {isSplitting ? 'Splitting...' : 'Split PDF'}
      </button>

      {zipUrl && (
        <a href={zipUrl} download="split_pdfs.zip" style={{ display: 'block', marginTop: 12 }}>
          Download Split PDFs (ZIP)
        </a>
      )}
    </FeatureLayout>
  );
}
