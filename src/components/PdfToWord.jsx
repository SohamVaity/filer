import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import FeatureLayout from './FeatureLayout';
import FileDropZone from './FileDropZone';
import DownloadButton from './DownloadButton';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function PdfToWord() {
  const [files, setFiles] = useState([]);
  const [extractedText, setExtractedText] = useState('');
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [wordUrl, setWordUrl] = useState(null);
  const [filename, setFilename] = useState('');

  const handleFilesChange = (newFiles) => {
    const file = newFiles[0];
    if (!file || file.type !== 'application/pdf') {
      setError('Please select a valid PDF file');
      setFiles([]);
      setExtractedText('');
      setWordUrl(null);
      return;
    }
    setError(null);
    setFiles(newFiles);
    setFilename(file.name.replace('.pdf', ''));
    setExtractedText('');
    setWordUrl(null);
    setProgress(0);
  };

  const removeFile = (fileName) => {
    setFiles((prev) => prev.filter((f) => f.name !== fileName));
    setExtractedText('');
    setWordUrl(null);
    setProgress(0);
  };

  const convertPdfToWord = async () => {
    if (files.length === 0) {
      setError('Please select a PDF file');
      return;
    }
    setError(null);
    setIsProcessing(true);
    setExtractedText('');
    setWordUrl(null);
    setProgress(0);

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      let allText = '';
      const paragraphs = [];

      // Add title
      paragraphs.push(
        new Paragraph({
          text: `Converted from: ${files[0].name}`,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );

      for (let i = 1; i <= numPages; i++) {
        setProgress(Math.round((i / numPages) * 100));
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        // Better text extraction with positioning awareness
        const pageText = textContent.items
          .map((item) => item.str)
          .filter((str) => str.trim() !== '')
          .join(' ');

        if (pageText.trim()) {
          allText += `--- Page ${i} ---\n${pageText}\n\n`;

          paragraphs.push(
            new Paragraph({
              text: `Page ${i}`,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 },
            })
          );

          // Split into lines for better formatting
          const lines = pageText.split(/\n|(?<=\. )/).filter(l => l.trim());
          lines.forEach((line) => {
            if (line.trim()) {
              paragraphs.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: line.trim(),
                      size: 24, // 12pt
                    }),
                  ],
                  spacing: { after: 100 },
                })
              );
            }
          });
        }
      }

      setExtractedText(allText);

      // Build Word doc with docx library
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: paragraphs,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      setWordUrl(url);
      setProgress(100);
    } catch (e) {
      console.error('PDF to Word conversion error:', e);
      setError('Failed to convert PDF to Word. The PDF might be scanned or image-based.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <FeatureLayout title="PDF to Word">
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
          onClick={convertPdfToWord}
          disabled={isProcessing || files.length === 0}
          className="convert-button"
        >
          {isProcessing ? `Converting... ${progress}%` : 'Convert to Word'}
        </button>

        {isProcessing && (
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {wordUrl && (
          <div className="success-section">
            <div className="success-icon">✅</div>
            <h3>Conversion Complete!</h3>
            <DownloadButton url={wordUrl} filename={`${filename || 'converted'}.docx`}>
              📥 Download Word Document
            </DownloadButton>
          </div>
        )}

        {extractedText && (
          <div className="preview-section">
            <h4>Preview Extracted Text:</h4>
            <textarea
              value={extractedText}
              readOnly
              className="text-preview"
            />
          </div>
        )}
      </div>
    </FeatureLayout>
  );
}
