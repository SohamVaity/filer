import React, { useState } from 'react';
import FeatureLayout from './FeatureLayout';
import FileDropZone from './FileDropZone';
import { PDFDocument } from 'pdf-lib';
import DownloadButton from './DownloadButton';

export default function MergePDF() {
  const [files, setFiles] = useState([]);
  const [mergedPdfUrl, setMergedPdfUrl] = useState(null);
  const [isMerging, setIsMerging] = useState(false);

  const removeFile = (name) => {
    setFiles((prevFiles) => prevFiles.filter(f => f.name !== name));
    setMergedPdfUrl(null);
  };

  const mergePdfs = async () => {
    if (files.length < 2) {
      alert('Select two or more PDF files to merge.');
      return;
    }
    setIsMerging(true);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
      }
      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setMergedPdfUrl(url);
    } catch (e) {
      alert('Failed to merge PDFs. Try again.');
      console.error(e);
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <FeatureLayout title="Merge PDFs">
      {files.length > 0 && (
        <ul className="uploaded-files-list">
          {files.map((file) => (
            <li key={file.name}>
              {file.name}
              <button
                className="file-remove-btn"
                onClick={() => removeFile(file.name)}
                aria-label={`Remove file ${file.name}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <FileDropZone accept="application/pdf" multiple onFilesChange={setFiles} />

      <button onClick={mergePdfs} disabled={isMerging}>
        {isMerging ? 'Merging...' : 'Merge PDFs'}
      </button>

      {mergedPdfUrl && (
        <DownloadButton url={mergedPdfUrl} filename="merged.pdf">
          Download Merged PDF
        </DownloadButton>
      )}
    </FeatureLayout>
  );
}
