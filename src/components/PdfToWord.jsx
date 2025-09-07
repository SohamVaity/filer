import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import FeatureLayout from './FeatureLayout';
import FileDropZone from './FileDropZone';
import DownloadButton from './DownloadButton';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function PdfToWord() {
  const [files, setFiles] = useState([]);
  const [extractedText, setExtractedText] = useState('');
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [wordUrl, setWordUrl] = useState(null);

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
    setExtractedText('');
    setWordUrl(null);
  };

  const removeFile = (fileName) => {
    setFiles((prev) => prev.filter((f) => f.name !== fileName));
    setExtractedText('');
    setWordUrl(null);
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
    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      let allText = '';
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(' ');
        allText += pageText + "\n\n";
      }
      setExtractedText(allText);

      // Build Word doc with docx library
      const doc = new Document({
        sections: [
          {
            children: allText.split("\n").map(line =>
              new Paragraph({
                children: [new TextRun(line)]
              })
            )
          }
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      setWordUrl(url);
    } catch (e) {
      console.error("PDF to Word conversion error:", e);
      setError("Failed to convert PDF to Word.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <FeatureLayout title="PDF to Word">
      {files.length > 0 && (
        <ul className="uploaded-files-list">
          {files.map(file => (
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

      <button onClick={convertPdfToWord} disabled={isProcessing} style={{ marginTop: '1em' }}>
        {isProcessing ? 'Converting...' : 'Convert to Word'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <textarea
        value={extractedText}
        onChange={e => setExtractedText(e.target.value)}
        style={{ width: '100%', height: 300, marginTop: 20, padding: 10, borderRadius: 8, borderColor: 'var(--primary)', fontFamily: 'monospace' }}
      />

      {wordUrl && (
        <DownloadButton url={wordUrl} filename="converted.docx">
          Download Word Document
        </DownloadButton>
      )}
    </FeatureLayout>
  );
}
