import React, { useState } from 'react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import FeatureLayout from './FeatureLayout';
import FileDropZone from './FileDropZone';
import DownloadButton from './DownloadButton';

export default function WatermarkPDF() {
  const [files, setFiles] = useState([]);
  const [watermarkText, setWatermarkText] = useState('');
  const [fontSize, setFontSize] = useState(50);
  const [color, setColor] = useState('#bfbfbf'); // default light gray
  const [rotation, setRotation] = useState(-45);
  const [opacity, setOpacity] = useState(0.3);
  const [watermarkedPdfUrl, setWatermarkedPdfUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesChange = (newFiles) => {
    const file = newFiles[0];
    if (!file || file.type !== 'application/pdf') {
      setError('Please select a PDF file');
      setFiles([]);
      setWatermarkedPdfUrl(null);
      return;
    }
    setError(null);
    setFiles(newFiles);
    setWatermarkedPdfUrl(null);
  };

  const removeFile = (fileName) => {
    setFiles((prev) => prev.filter(f => f.name !== fileName));
    setWatermarkedPdfUrl(null);
  };

  const file = files.length > 0 ? files[0] : null;

  const addWatermark = async () => {
    if (!file) {
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
      const fileBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileBytes);
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const rgbColor = hexToRgb(color);

      pages.forEach(page => {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
        const textHeight = fontSize;

        page.drawText(watermarkText, {
          x: (width - textWidth) / 2,
          y: (height - textHeight) / 2,
          size: fontSize,
          font,
          color: rgb(rgbColor.r / 255, rgbColor.g / 255, rgbColor.b / 255),
          rotate: degrees(rotation),
          opacity,
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setWatermarkedPdfUrl(URL.createObjectURL(blob));
    } catch (e) {
      console.error(e);
      setError('Failed to add watermark. Please try again.');
      setWatermarkedPdfUrl(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Convert hex color string to RGB
  const hexToRgb = (hex) => {
    const trimmed = hex.replace('#', '');
    const bigint = parseInt(trimmed, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  };

  return (
    <FeatureLayout title="Add Watermark to PDF">
      <FileDropZone accept="application/pdf" multiple={false} onFilesChange={handleFilesChange} />
      
      {file && (
        <ul className="uploaded-files-list" style={{ marginTop: 10 }}>
          <li>
            <span>{file.name}</span>
            <button
              type="button"
              className="file-remove-btn"
              aria-label={`Remove file ${file.name}`}
              onClick={() => removeFile(file.name)}
            >
              &times;
            </button>
          </li>
        </ul>
      )}

      <label style={{ marginTop: 15, display: 'block' }}>
        Watermark Text:
        <input
          type="text"
          value={watermarkText}
          onChange={e => setWatermarkText(e.target.value)}
          placeholder="Enter watermark text"
          style={{ marginTop: 6, width: '100%', padding: 8, borderRadius: 8, borderColor: 'var(--primary)' }}
          disabled={isProcessing}
        />
      </label>

      <label style={{ marginTop: 15, display: 'block' }}>
        Font Size:
        <input
          type="number"
          min="10"
          max="150"
          value={fontSize}
          onChange={e => setFontSize(Number(e.target.value))}
          style={{ marginTop: 6, width: '100%', padding: 8, borderRadius: 8, borderColor: 'var(--primary)' }}
          disabled={isProcessing}
        />
      </label>

      <label style={{ marginTop: 15, display: 'block' }}>
        Watermark Color:
        <input
          type="color"
          value={color}
          onChange={e => setColor(e.target.value)}
          style={{ marginTop: 6, width: '100%', height: 40, borderRadius: 8, borderColor: 'var(--primary)' }}
          disabled={isProcessing}
        />
      </label>

      <label style={{ marginTop: 15, display: 'block' }}>
        Rotation Angle (degrees):
        <input
          type="range"
          min="-180"
          max="180"
          value={rotation}
          onChange={e => setRotation(Number(e.target.value))}
          style={{ marginTop: 6, width: '100%' }}
          disabled={isProcessing}
        />
        <div style={{ textAlign: 'center' }}>{rotation}°</div>
      </label>

      <label style={{ marginTop: 15, display: 'block' }}>
        Opacity:
        <input
          type="range"
          min="0.0"
          max="1.0"
          step="0.05"
          value={opacity}
          onChange={e => setOpacity(parseFloat(e.target.value))}
          style={{ marginTop: 6, width: '100%' }}
          disabled={isProcessing}
        />
        <div style={{ textAlign: 'center' }}>{(opacity * 100).toFixed(0)}%</div>
      </label>

      {error && <p style={{ color: 'var(--primary)', marginTop: 12 }}>{error}</p>}

      <button
        onClick={addWatermark}
        disabled={isProcessing}
        style={{
          marginTop: 20,
          backgroundColor: isProcessing ? '#aaa' : 'var(--primary)',
          color: '#111',
          border: 'none',
          padding: '12px 24px',
          borderRadius: 30,
          fontWeight: '700',
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          width: '100%',
        }}
      >
        {isProcessing ? 'Processing...' : 'Add Watermark'}
      </button>

      {watermarkedPdfUrl && (
        <DownloadButton url={watermarkedPdfUrl} filename="watermarked.pdf">
          Download Watermarked PDF
        </DownloadButton>
      )}
    </FeatureLayout>
  );
}
