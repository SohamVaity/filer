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
        <div>
          <p>{imageFile.name} <button onClick={() => removeFile(imageFile.name)} aria-label={`Remove file ${imageFile.name}`}>×</button></p>
        </div>
      )}

      <FileDropZone accept="image/png,image/jpeg" multiple={false} onFilesChange={handleFilesChange} />

      <button onClick={runOcr} disabled={isProcessing} style={{ marginTop: '1em' }}>
        {isProcessing ? 'Processing...' : 'Start OCR'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <textarea
        value={ocrText}
        onChange={(e) => setOcrText(e.target.value)}
        placeholder="OCR result text here. You can edit this text."
        style={{ width: '100%', height: 320, marginTop: 20, padding: 10, borderRadius: 8, borderColor: 'var(--primary)', fontFamily: 'monospace', resize: 'vertical' }}
      />

      <div style={{ marginTop: 10 }}>
        <button onClick={downloadAsDocx} disabled={!ocrText} style={{ marginRight: 10 }}>
          Download as Word (.docx)
        </button>
        <button onClick={downloadAsPdf} disabled={!ocrText}>
          Download as PDF (.pdf)
        </button>
      </div>
    </FeatureLayout>
  );
}
