import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { jsPDF } from 'jspdf';
import FeatureLayout from './FeatureLayout';
import FileDropZone from './FileDropZone';

export default function OCR() {
  const [files, setFiles] = useState([]);
  const [ocrText, setOcrText] = useState('');
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesChange = (newFiles) => {
    const file = newFiles[0];
    if (!file || !['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Please select a JPG or PNG image file');
      setFiles([]);
      return;
    }
    setError(null);
    setFiles(newFiles);
    setOcrText('');
  };

  const removeFile = (fileName) => {
    setFiles((prev) => prev.filter((f) => f.name !== fileName));
    setOcrText('');
  };

  const imageFile = files.length > 0 ? files[0] : null;

  const runOcr = async () => {
    if (!imageFile) {
      setError('Please upload an image first.');
      return;
    }
    setError(null);
    setIsProcessing(true);
    setOcrText('');
    try {
      const { data: { text } } = await Tesseract.recognize(imageFile, 'eng', { logger: m => console.log(m) });
      setOcrText(text);
    } catch (e) {
      console.error(e);
      setError('Failed to recognize text.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAsDocx = () => {
    if (!ocrText) return;
    const doc = new Document({ sections: [{ children: [new Paragraph({ children: [new TextRun(ocrText)] })] }] });
    Packer.toBlob(doc).then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ocr_output.docx';
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const downloadAsPdf = () => {
    if (!ocrText) return;
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    const margin = 10;
    let y = margin;
    const lines = doc.splitTextToSize(ocrText, 180);

    for (let i = 0; i < lines.length; i++) {
      if (y + 10 > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(lines[i], margin, y);
      y += 10;
    }
    doc.save('ocr_output.pdf');
  };

  return (
    <FeatureLayout title="OCR (Image to Text)">
      {imageFile && (
        <ul className="uploaded-files-list" style={{ marginTop: 10 }}>
          <li>
            <span>{imageFile.name}</span>
            <button
              type="button"
              className="file-remove-btn"
              aria-label={`Remove file ${imageFile.name}`}
              onClick={() => removeFile(imageFile.name)}
            >
              ×
            </button>
          </li>
        </ul>
      )}

      <FileDropZone accept="image/png,image/jpeg" multiple={false} onFilesChange={handleFilesChange} />

      <button className="convert-button" onClick={runOcr} disabled={isProcessing}>
        {isProcessing ? 'Processing...' : 'Start OCR'}
      </button>

      {error && <div className="error-message">{error}</div>}

      <textarea
        value={ocrText}
        onChange={(e) => setOcrText(e.target.value)}
        placeholder="OCR result text here. You can edit this text."
        className="text-preview"
      />

      <div className="download-buttons" style={{ marginTop: 10 }}>
        <button className="convert-button" onClick={downloadAsDocx} disabled={!ocrText}>
          Download as Word (.docx)
        </button>
        <button className="convert-button" onClick={downloadAsPdf} disabled={!ocrText}>
          Download as PDF (.pdf)
        </button>
      </div>
    </FeatureLayout>
  );
}
