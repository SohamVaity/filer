import React, { useState } from 'react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

export default function WatermarkPDF() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkedPdfUrl, setWatermarkedPdfUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle PDF file upload
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      setError('Please select a PDF file');
      return;
    }
    setError(null);
    setSelectedFile(file);
    setWatermarkedPdfUrl(null);
  };

  // Add watermark on all pages
  const addWatermark = async () => {
    if (!selectedFile) {
      setError('Please select a PDF file');
      return;
    }
    if (!watermarkText.trim()) {
      setError('Watermark text cannot be empty');
      return;
    }
    setError(null);
    setIsProcessing(true);

    try {
      const fileBytes = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileBytes);
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      pages.forEach((page) => {
        const { width, height } = page.getSize();
        const fontSize = 50;
        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
        const textHeight = fontSize;

        page.drawText(watermarkText, {
          x: (width - textWidth) / 2,
          y: (height - textHeight) / 2,
          size: fontSize,
          font,
          color: rgb(0.75, 0.75, 0.75),
          rotate: degrees(-45),
          opacity: 0.3,
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setWatermarkedPdfUrl(url);
    } catch (e) {
      console.error(e);
      setError('Failed to add watermark. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ marginTop: 40 }}>
      <h2>Add Watermark to PDF</h2>

      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
      />

      {selectedFile && <p style={{ marginTop: 8 }}>Selected file: {selectedFile.name}</p>}

      <label style={{ display: 'block', marginTop: 15 }}>
        Watermark Text:
        <input
          type="text"
          value={watermarkText}
          onChange={e => setWatermarkText(e.target.value)}
          placeholder="Enter watermark text"
          style={{ display: 'block', width: '100%', padding: '6px', marginTop: '6px' }}
          disabled={isProcessing}
        />
      </label>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button
        onClick={addWatermark}
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
        {isProcessing ? 'Processing...' : 'Add Watermark'}
      </button>

      {watermarkedPdfUrl && (
        <div style={{ marginTop: 20 }}>
          <a href={watermarkedPdfUrl} download="watermarked.pdf" style={{ color: '#6200ee' }}>
            Download Watermarked PDF
          </a>
        </div>
      )}
    </div>
  );
}
