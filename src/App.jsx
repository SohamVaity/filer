import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import "./App.css";

// Feature components imports
import MergePDF from "./components/MergePDF";
import SplitPDF from "./components/SplitPDF";
import CompressPDF from "./components/CompressPDF";
import PdfToImages from "./components/PdfToImages";
import ImagesToPdf from "./components/ImagesToPdf";
import OCR from "./components/OCR";
import WatermarkPDF from "./components/WatermarkPDF";
import PdfToWord from "./components/PdfToWord";

function Home() {
  const features = [
    { path: "/merge", label: "Merge PDFs", icon: "📎" },
    { path: "/split", label: "Split PDF", icon: "✂️" },
    { path: "/compress", label: "Compress PDF", icon: "🗜️" },
    { path: "/pdf2img", label: "PDF to Images", icon: "🖼️" },
    { path: "/img2pdf", label: "Images to PDF", icon: "🖨️" },
    { path: "/ocr", label: "OCR (Image to Text)", icon: "🔎" },
    { path: "/watermark", label: "Watermark PDF", icon: "💧" },
    { path: "/pdftoword", label: "PDF to Word (.docx)", icon: "📝" },
  ];

  return (
    <div className="home-container">
      <h1>Filer</h1>
      <h2>A Multi PDF Toolkit</h2>
      <div className="feature-tiles">
        {features.map(({ path, label, icon }) => (
          <Link key={path} to={path} className="feature-card">
            <span className="tile-icon">{icon}</span>
            <span className="tile-label">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}


export default function App() {
  const [darkMode, setDarkMode] = useState(false);

// Should enable light mode when darkMode is false
useEffect(() => {
  if (darkMode) {
    document.body.classList.remove("light-mode");
  } else {
    document.body.classList.add("light-mode");
  }
}, [darkMode]);


  return (
    <Router>
      <div className="app-container">
        {/* Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/merge" element={<MergePDF />} />
          <Route path="/split" element={<SplitPDF />} />
          <Route path="/compress" element={<CompressPDF />} />
          <Route path="/pdf2img" element={<PdfToImages />} />
          <Route path="/img2pdf" element={<ImagesToPdf />} />
          <Route path="/ocr" element={<OCR />} />
          <Route path="/watermark" element={<WatermarkPDF />} />
          <Route path="/pdftoword" element={<PdfToWord />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Dark mode toggle button */}
        <button
          className="dark-mode-toggle"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>
      <div className="app-footer">
  Made By Soham Vaity
</div>

    </Router>
  );
}
