import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import FeatureLayout from './FeatureLayout';
import FileDropZone from './FileDropZone';
import DownloadButton from './DownloadButton';

export default function ImagesToPdf() {
  const [files, setFiles] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesChange = (selectedFiles) => {
    const filtered = Array.from(selectedFiles).filter(
      (file) => file.type === 'image/jpeg' || file.type === 'image/png'
    );
    if (filtered.length === 0) {
      setError('Please select JPG or PNG image files');
      setFiles([]);
      setPdfUrl(null);
      return;
    }
    setError(null);
    setFiles(filtered);
    setPdfUrl(null);
  };

  const removeFile = (fileName) => {
    setFiles((prev) => prev.filter((f) => f.name !== fileName));
    setPdfUrl(null);
  };

  const convertImagesToPdf = async () => {
    if (files.length === 0) {
      setError('Please select images before converting.');
      return;
    }
    setError(null);
    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.create();
      for (const imgFile of files) {
        const imgBytes = await imgFile.arrayBuffer();
        let image;
        if (imgFile.type === 'image/png') {
          image = await pdfDoc.embedPng(imgBytes);
        } else {
          image = await pdfDoc.embedJpg(imgBytes);
        }
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      }
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setPdfUrl(URL.createObjectURL(blob));
    } catch (e) {
      console.error(e);
      setError('Failed to convert images to PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <FeatureLayout title="Images to PDF">
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

      <FileDropZone accept="image/png,image/jpeg" multiple onFilesChange={handleFilesChange} />

      {error && <p style={{ color: 'red', marginTop: '1em' }}>{error}</p>}

      <button onClick={convertImagesToPdf} disabled={isProcessing} style={{ marginTop: '1em' }}>
        {isProcessing ? 'Converting...' : 'Convert to PDF'}
      </button>

      {pdfUrl && (
        <DownloadButton url={pdfUrl} filename="converted.pdf">
          Download PDF
        </DownloadButton>
      )}
    </FeatureLayout>
  );
}
