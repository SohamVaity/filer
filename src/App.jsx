import React, { useState } from 'react';
import './App.css';

import FileUpload from './components/FileUpload';
import MergePDF from './components/MergePDF';
import SplitPDF from './components/SplitPDF';
import CompressPDF from './components/CompressPDF';
import PdfToImages from './components/PdfToImages';
import ImagesToPdf from './components/ImagesToPdf';
import OCR from './components/OCR';
import WatermarkPDF from './components/WatermarkPDF';

function App() {
  // Single state for files shared by all features requiring upload
  const [selectedFiles, setSelectedFiles] = useState([]);

  return (
    <div className="app-container">
      <h1>Filer - PDF & Image Toolkit</h1>

      {/* Single, reusable file upload UI */}
      <section>
        <h2>Upload Files</h2>
        <FileUpload
          accept="application/pdf,image/jpeg,image/png"
          multiple={true}
          onFilesChange={setSelectedFiles}
        />
      </section>

      {/* Pass selectedFiles as needed */}
      <section>
        <MergePDF uploadedFiles={selectedFiles} />
      </section>

      <section>
        <SplitPDF uploadedFiles={selectedFiles} />
      </section>

      <section>
        <CompressPDF uploadedFiles={selectedFiles} />
      </section>

      <section>
        <PdfToImages uploadedFiles={selectedFiles} />
      </section>

      <section>
        <ImagesToPdf />
      </section>

      <section>
        <OCR />
      </section>

      <section>
        <WatermarkPDF uploadedFiles={selectedFiles} />
      </section>
    </div>
  );
}

export default App;
