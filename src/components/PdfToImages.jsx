import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import JSZip from 'jszip';
import FeatureLayout from './FeatureLayout';
import FileDropZone from './FileDropZone';
import DownloadButton from './DownloadButton';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function PdfToImages() {
  const [files, setFiles] = useState([]);
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [zipUrl, setZipUrl] = useState(null);
  const [filename, setFilename] = useState('');

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
    setFilename(file.name.replace('.pdf', ''));
    setImages([]);
    setZipUrl(null);
    setProgress(0);
  };

  const removeFile = (fileName) => {
    setFiles((prev) => prev.filter((f) => f.name !== fileName));
    setImages([]);
    setZipUrl(null);
    setProgress(0);
  };

  const convertPdfToImages = async () => {
    if (files.length === 0) {
      setError('Please select a PDF file first.');
      return;
    }
    setError(null);
    setImages([]);
    setZipUrl(null);
    setIsProcessing(true);
    setProgress(0);

    try {
      const fileData = await files[0].arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: fileData });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      const imageUrls = [];
      const zip = new JSZip();

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        setProgress(Math.round((pageNum / numPages) * 100));
        const page = await pdf.getPage(pageNum);

        // Higher scale for better quality
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;
        const dataUrl = canvas.toDataURL('image/png');

        // Add to zip
        const base64Data = dataUrl.split(',')[1];
        zip.file(`page_${String(pageNum).padStart(3, '0')}.png`, base64Data, { base64: true });

        imageUrls.push(dataUrl);
      }

      setImages(imageUrls);

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);
      setZipUrl(zipUrl);
      setProgress(100);
    } catch (e) {
      console.error('PDF to Images conversion error:', e);
      setError('Failed to convert PDF to images.');
      setImages([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAllImages = () => {
    if (images.length === 0) return;

    images.forEach((src, idx) => {
      const link = document.createElement('a');
      link.href = src;
      link.download = `page_${String(idx + 1).padStart(3, '0')}.png`;
      link.click();
    });
  };

  return (
    <FeatureLayout title="PDF to Images">
      <div className="feature-content">
        <div className="upload-section">
          <FileDropZone accept=".pdf,application/pdf" multiple={false} onFilesChange={handleFilesChange} />
        </div>

        {files.length > 0 && (
          <div className="file-info-card">
            <div className="file-info">
              <span className="file-icon">📄</span>
              <span className="file-name">{files[0].name}</span>
            </div>
            <button className="file-remove-btn" onClick={() => removeFile(files[0].name)} aria-label="Remove file">
              ×
            </button>
          </div>
        )}

        <button
          onClick={convertPdfToImages}
          disabled={isProcessing || files.length === 0}
          className="convert-button"
        >
          {isProcessing ? `Converting... ${progress}%` : 'Convert to Images'}
        </button>

        {isProcessing && (
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {zipUrl && (
          <div className="success-section">
            <div className="success-icon">✅</div>
            <h3>Conversion Complete!</h3>
            <p className="success-text">Converted {images.length} page{images.length !== 1 ? 's' : ''}</p>
            <div className="download-buttons">
              <DownloadButton url={zipUrl} filename={`${filename || 'images'}.zip`}>
                📦 Download All (ZIP)
              </DownloadButton>
              <button onClick={downloadAllImages} className="download-separate-btn">
                📥 Download Separately
              </button>
            </div>
          </div>
        )}

        {images.length > 0 && (
          <div className="images-preview-section">
            <h4>Preview Images:</h4>
            <div className="images-grid">
              {images.map((src, idx) => (
                <div key={idx} className="image-card">
                  <div className="image-header">
                    <span className="page-badge">Page {idx + 1}</span>
                    <a href={src} download={`page_${String(idx + 1).padStart(3, '0')}.png`} className="download-icon" title="Download">
                      ⬇️
                    </a>
                  </div>
                  <img src={src} alt={`Page ${idx + 1}`} className="page-image" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </FeatureLayout>
  );
}
