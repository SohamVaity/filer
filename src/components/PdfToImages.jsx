import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

// Set worker source to CDN hosted pdf.worker.min.js for compatibility
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function PdfToImages() {
  const [pdfFile, setPdfFile] = useState(null);
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      setError('Please select a PDF file');
      return;
    }
    setError(null);
    setPdfFile(file);
    setImages([]);
  };

  // Render each PDF page to canvas and convert canvas to image URL
  const convertPdfToImages = async () => {
    if (!pdfFile) {
      setError('Please select a PDF file first.');
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      const fileData = await pdfFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: fileData });
      const pdf = await loadingTask.promise;

      const numPages = pdf.numPages;
      const imageUrls = [];

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });

        // Create canvas element
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page into canvas context
        await page.render({ canvasContext: context, viewport }).promise;

        // Convert canvas to data URL (image)
        const dataUrl = canvas.toDataURL('image/jpeg');
        imageUrls.push(dataUrl);
      }

      setImages(imageUrls);
    } catch (e) {
      console.error(e);
      setError('Failed to convert PDF to images.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ marginTop: 40 }}>
      <h2>PDF to Images</h2>

      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
      />

      {pdfFile && <p style={{ marginTop: 10 }}>Selected file: {pdfFile.name}</p>}

      <button
        onClick={convertPdfToImages}
        disabled={isProcessing || !pdfFile}
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
        {isProcessing ? 'Processing...' : 'Convert to Images'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {images.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h4>Page Images:</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {images.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`Page ${idx + 1}`}
                style={{ maxWidth: 200, borderRadius: 6, boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
