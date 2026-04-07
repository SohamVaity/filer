import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "./App.css";

// Feature components imports
import MergePDF from "./components/MergePDF";
import SplitPDF from "./components/SplitPDF";
import CompressPDF from "./components/CompressPDF";
import ImagesToPdf from "./components/ImagesToPdf";
import OCR from "./components/OCR";
import WatermarkPDF from "./components/WatermarkPDF";
import Login from "./components/Login";
import Register from "./components/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import ViewUploads from "./components/ViewUploads";

function Home() {
  const { user, signOut, isConfigured } = useAuth();
  const features = [
    { path: "/merge", label: "Merge PDFs", icon: "📎" },
    { path: "/split", label: "Split PDF", icon: "✂️" },
    { path: "/compress", label: "Compress PDF", icon: "🗜️" },
    { path: "/img2pdf", label: "Images to PDF", icon: "🖨️" },
    { path: "/ocr", label: "OCR (Image to Text)", icon: "🔎" },
    { path: "/watermark", label: "Watermark PDF", icon: "💧" },
    { path: "/uploads", label: "View Uploads", icon: "📂" },
  ];

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Filer</h1>
        <p className="home-tagline">Your Professional PDF Toolkit</p>
      </div>

      {user && (
        <div className="user-info">
          <span className="user-email">{user.email}</span>
          <button onClick={() => signOut()} className="logout-button">
            Sign Out
          </button>
        </div>
      )}

      {!isConfigured && (
        <div className="demo-mode-banner">
          <span className="banner-icon">⚠️</span>
          <span><strong>Demo Mode:</strong> Supabase not configured. Sign in with any credentials to test.</span>
          <a href="https://github.com/your-repo/filer#setup" target="_blank" rel="noopener noreferrer" className="banner-link">Setup Guide →</a>
        </div>
      )}

      <div className="feature-tiles">
        {features.map(({ path, label, icon }) => (
          <ProtectedRoute key={path}>
            <Link to={path} className="feature-card">
              <span className="tile-icon">{icon}</span>
              <span className="tile-label">{label}</span>
            </Link>
          </ProtectedRoute>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.remove("light-mode");
    } else {
      document.body.classList.add("light-mode");
    }
  }, [darkMode]);

  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/merge"
              element={
                <ProtectedRoute>
                  <MergePDF />
                </ProtectedRoute>
              }
            />
            <Route
              path="/split"
              element={
                <ProtectedRoute>
                  <SplitPDF />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compress"
              element={
                <ProtectedRoute>
                  <CompressPDF />
                </ProtectedRoute>
              }
            />
            <Route
              path="/img2pdf"
              element={
                <ProtectedRoute>
                  <ImagesToPdf />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ocr"
              element={
                <ProtectedRoute>
                  <OCR />
                </ProtectedRoute>
              }
            />
            <Route
              path="/watermark"
              element={
                <ProtectedRoute>
                  <WatermarkPDF />
                </ProtectedRoute>
              }
            />
            <Route
              path="/uploads"
              element={
                <ProtectedRoute>
                  <ViewUploads />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Theme toggle button */}
          <button
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <span className="toggle-content">
                <span className="toggle-icon">☀️</span>
                <span className="toggle-text">Light</span>
              </span>
            ) : (
              <span className="toggle-content">
                <span className="toggle-icon">🌙</span>
                <span className="toggle-text">Dark</span>
              </span>
            )}
          </button>
        </div>
        <div className="app-footer">v0.2</div>
      </AuthProvider>
    </Router>
  );
}
