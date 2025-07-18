import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import CanvasPreview from './components/CanvasPreview';
import CodeOutput from './components/CodeOutput';

function App() {
  const [imageUrl, setImageUrl] = useState('');
  const [canvasCode, setCanvasCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  

  const handleUploadComplete = (url) => {
    setIsLoading(true);
    setError(null);
    try {
      setImageUrl(url);
    } catch (err) {
      setError('Failed to process file. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Figma, PNG, JPEG, PDF to Canvas.js Object</h2>
      <FileUpload setImageUrl={handleUploadComplete} />
      
      {isLoading && <p>Loading preview...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {imageUrl && !isLoading && (
        <>
          <CanvasPreview 
            imageUrl={imageUrl} 
            setCanvasCode={setCanvasCode} 
          />
          <CodeOutput canvasCode={canvasCode} />
        </>
      )}
    </div>
  );
}

export default App;