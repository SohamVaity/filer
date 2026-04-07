import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabase';
import { useAuth } from '../context/AuthContext';
import FeatureLayout from './FeatureLayout';

export default function ViewUploads() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (isSupabaseConfigured && user) {
      fetchUploads();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUploads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('uploaded_files')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUploads(data);
    }
    setLoading(false);
  };

  const getFileIcon = (type) => {
    const icons = {
      merged: '📎',
      split: '✂️',
      compressed: '🗜️',
      images_to_pdf: '🖨️',
      watermark: '💧',
    };
    return icons[type] || '📄';
  };

  if (!isSupabaseConfigured) {
    return (
      <FeatureLayout title="View Uploads">
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          Supabase is not configured. Files are not being saved.
        </p>
      </FeatureLayout>
    );
  }

  if (loading) {
    return (
      <FeatureLayout title="View Uploads">
        <p style={{ textAlign: 'center' }}>Loading your files...</p>
      </FeatureLayout>
    );
  }

  return (
    <FeatureLayout title="Your Uploaded Files">
      {uploads.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          No files yet. Process a PDF to see it here.
        </p>
      ) : (
        <div className="uploads-grid">
          {uploads.map((file) => (
            <div key={file.id} className="upload-card">
              <span className="upload-icon">{getFileIcon(file.file_type)}</span>
              <div className="upload-info">
                <span className="upload-name">{file.file_name}</span>
                <span className="upload-type">{file.file_type}</span>
                {file.original_files && (
                  <span className="upload-original">
                    From: {file.original_files}
                  </span>
                )}
              </div>
              <a
                href={file.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="upload-download"
              >
                Download
              </a>
            </div>
          ))}
        </div>
      )}
    </FeatureLayout>
  );
}
