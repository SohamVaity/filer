import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';

export default function ImagesToPdf() {
  const [images, setImages] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle image file inputs (jpg/png)
  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files).filter(file =>
      file.type === 'image/jpeg' || file.type === 'image/png'
    );

    if (selectedFiles.length === 0) {
      setError('Please select JPG or PNG image files');
      return;
    }

    setError(null);
    setImages(selectedFiles);
    setPdfUrl(null);
  };

  // Convert images to PDF
  const convertImagesToPdf = async () => {
    if (images.length === 0) {
      setError('Please select images before converting.');
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const imgFile of images) {
        const imgBytes = await imgFile.arrayBuffer();
        let image;
        if (imgFile.type === 'image/png') {
          image = await pdfDoc.embedPng(imgBytes);
        } else {
          image = await pdfDoc.embedJpg(imgBytes);
        }

        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);

    } catch (e) {
      console.error(e);
      setError('Failed to convert images to PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ marginTop: 40 }}>
      <h2>Images to PDF</h2>

      <input
        type="file"
        multiple
        accept="image/jpeg,image/png"
        onChange={handleFileChange}
      />

      {images.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <h4>Selected Images:</h4>
          <ul>
            {images.map((img, idx) => (
              <li key={idx}>{img.name}</li>
            ))}
          </ul>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button
        onClick={convertImagesToPdf}
        disabled={isProcessing}
        style={{
          marginTop: 12,
          backgroundColor: isProcessing ? '#aaa' : '#6200ee',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: 6,
          cursor: isProcessing ? 'not-allowed' : 'pointer',
        }}
      >
        {isProcessing ? 'Converting...' : 'Convert to PDF'}
      </button>

      {pdfUrl && (
        <div style={{ marginTop: 20 }}>
          <a href={pdfUrl} download="images.pdf" style={{ color: '#6200ee' }}>
            Download PDF
          </a>
        </div>
      )}
    </div>
  );
}
