import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = ({ setImageUrl }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      setUploadError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:5000/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const fullUrl = `http://localhost:5000${res.data.filePath}`;
      setImageUrl(fullUrl);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Upload failed';
      setUploadError(errorMsg);
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <div>
        <input 
          type="file" 
          accept="image/*,.pdf" 
          onChange={(e) => {
            setFile(e.target.files[0]);
            setUploadError(null);
          }} 
        />
        <button 
          onClick={handleUpload}
          disabled={isUploading || !file}
          style={{ marginLeft: '10px' }}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
      
      {uploadError && (
        <p style={{ color: 'red', marginTop: '5px' }}>
          {uploadError}
        </p>
      )}
      
      <p style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
        Supported formats: PDF, PNG, JPG, JPEG, GIF
      </p>
    </div>
  );
};

export default FileUpload;