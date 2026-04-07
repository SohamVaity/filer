import React, { useState } from 'react';
import FeatureLayout from './FeatureLayout';
import FileDropZone from './FileDropZone';
import { PDFDocument } from 'pdf-lib';
import DownloadButton from './DownloadButton';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../supabase';

export default function MergePDF() {
  const [files, setFiles] = useState([]);
  const [mergedPdfUrl, setMergedPdfUrl] = useState(null);
  const [isMerging, setIsMerging] = useState(false);
  const { user } = useAuth();

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

      // Save to Supabase
      if (isSupabaseConfigured && user) {
        const fileName = `merged_${Date.now()}.pdf`;
        const { error: uploadError } = await supabase.storage
          .from('user-files')
          .upload(`${user.id}/${fileName}`, blob);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('user-files')
            .getPublicUrl(`${user.id}/${fileName}`);

          await supabase.from('uploaded_files').insert({
            user_id: user.id,
            file_name: fileName,
            file_type: 'merged',
            file_url: publicUrl,
            original_files: files.map(f => f.name).join(', '),
          });
        }
      }
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

      <button className="convert-button" onClick={mergePdfs} disabled={isMerging}>
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
