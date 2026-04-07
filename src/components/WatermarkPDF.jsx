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

      <label className="watermark-label">
        Watermark Text:
        <input
          type="text"
          value={watermarkText}
          onChange={e => setWatermarkText(e.target.value)}
          placeholder="Enter watermark text"
          className="watermark-input"
          disabled={isProcessing}
        />
      </label>

      <label className="watermark-label">
        Font Size:
        <input
          type="number"
          min="10"
          max="150"
          value={fontSize}
          onChange={e => setFontSize(Number(e.target.value))}
          className="watermark-input"
          disabled={isProcessing}
        />
      </label>

      <label className="watermark-label">
        Watermark Color:
        <input
          type="color"
          value={color}
          onChange={e => setColor(e.target.value)}
          className="color-input"
          disabled={isProcessing}
        />
      </label>

      <label className="watermark-label">
        Rotation Angle (degrees):
        <input
          type="range"
          min="-180"
          max="180"
          value={rotation}
          onChange={e => setRotation(Number(e.target.value))}
          className="range-input"
          disabled={isProcessing}
        />
        <div className="range-value">{rotation}°</div>
      </label>

      <label className="watermark-label">
        Opacity:
        <input
          type="range"
          min="0.0"
          max="1.0"
          step="0.05"
          value={opacity}
          onChange={e => setOpacity(parseFloat(e.target.value))}
          className="range-input"
          disabled={isProcessing}
        />
        <div className="range-value">{(opacity * 100).toFixed(0)}%</div>
      </label>

      {error && <div className="error-message">{error}</div>}

      <button
        className="convert-button"
        onClick={addWatermark}
        disabled={isProcessing}
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
