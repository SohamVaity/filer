import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import FeatureLayout from './FeatureLayout';
import FileUpload from './FileUpload'; // or your preferred file input component
import DownloadButton from './DownloadButton';

export default function CompressPDF() {
  const [files, setFiles] = useState([]);
  const [compressionLevel, setCompressionLevel] = useState('medium');
  const [compressedPdfUrl, setCompressedPdfUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFilesChange = (selectedFiles) => {
    const file = selectedFiles[0];
    if (!file || file.type !== 'application/pdf') {
      setError('Please select a valid PDF file');
      setFiles([]);
      setCompressedPdfUrl(null);
      return;
    }
    setError(null);
    setFiles(selectedFiles);
    setCompressedPdfUrl(null);
  };

  const removeFile = (fileName) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f.name !== fileName));
    setCompressedPdfUrl(null);
  };

  const compressPdf = async () => {
    if (files.length === 0) {
      setError('Please select a PDF file');
      return;
    }
    setError(null);
    setIsCompressing(true);
    try {
      const file = files[0];
      const fileBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileBytes);
      
      // Note: pdf-lib does not truly compress; this is a placeholder
      const compressedBytes = await pdfDoc.save();

      const blob = new Blob([compressedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setCompressedPdfUrl(url);
    } catch (e) {
      console.error(e);
      setError('Compression failed. Please try a different file.');
      setCompressedPdfUrl(null);
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <FeatureLayout title="Compress PDF">
      {files.length > 0 && (
        <ul className="uploaded-files-list">
          {files.map((file) => (
            <li key={file.name}>
              {file.name}{' '}
              <button className="file-remove-btn" onClick={() => removeFile(file.name)} aria-label={`Remove file ${file.name}`}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <FileUpload accept="application/pdf" multiple={false} onFilesChange={handleFilesChange} />

      <label htmlFor="compressionLevel" style={{ display: 'block', marginBottom: 8 }}>Compression Level:</label>
      <select
        id="compressionLevel"
        value={compressionLevel}
        onChange={(e) => setCompressionLevel(e.target.value)}
        disabled={isCompressing}
        className="compression-select"
      >
        <option value="low">Low (Low quality)</option>
        <option value="medium">Medium</option>
        <option value="high">High (Best quality)</option>
      </select>

      {error && <div className="error-message">{error}</div>}

      <button className="convert-button" onClick={compressPdf} disabled={isCompressing}>
        {isCompressing ? 'Compressing...' : 'Compress PDF'}
      </button>

      {compressedPdfUrl && (
        <DownloadButton url={compressedPdfUrl} filename="compressed.pdf">
          Download Compressed PDF
        </DownloadButton>
      )}
    </FeatureLayout>
  );
}
