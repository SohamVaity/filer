import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import FeatureLayout from './FeatureLayout';
import FileDropZone from './FileDropZone';
import DownloadButton from './DownloadButton';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function PdfToImages() {
  const [files, setFiles] = useState([]);
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesChange = (newFiles) => {
    const file = newFiles[0];
    if (!file || file.type !== 'application/pdf') {
      setError('Please select a valid PDF file.');
      setFiles([]);
      setImages([]);
      return;
    }
    setError(null);
    setFiles(newFiles);
    setImages([]);
  };

  const removeFile = (fileName) => {
    setFiles((prev) => prev.filter((f) => f.name !== fileName));
    setImages([]);
  };

  const convertPdfToImages = async () => {
    if (files.length === 0) {
      setError('Please select a PDF file first.');
      return;
    }
    setError(null);
    setImages([]);
    setIsProcessing(true);
    try {
      const fileData = await files[0].arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: fileData });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      const imageUrls = [];

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;
        const dataUrl = canvas.toDataURL('image/jpeg');
        imageUrls.push(dataUrl);
      }

      setImages(imageUrls);
    } catch (e) {
      console.error('PDF to Images conversion error:', e);
      setError('Failed to convert PDF to images.');
      setImages([]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <FeatureLayout title="PDF to Images">
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

      <FileDropZone accept="application/pdf" multiple={false} onFilesChange={handleFilesChange} />

      <button onClick={convertPdfToImages} disabled={isProcessing} style={{ marginTop: '1em' }}>
        {isProcessing ? 'Processing...' : 'Convert to Images'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {images.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>Page Images:</h3>
          {images.map((src, idx) => (
            <div key={idx} style={{ marginBottom: 15 }}>
              <img src={src} alt={`Page ${idx + 1}`} style={{ maxWidth: '100%', height: 'auto' }} />
              <a href={src} download={`page_${idx + 1}.jpg`} style={{ display: 'inline-block', marginTop: 6 }}>
                Download Image
              </a>
            </div>
          ))}
        </div>
      )}
    </FeatureLayout>
  );
}
