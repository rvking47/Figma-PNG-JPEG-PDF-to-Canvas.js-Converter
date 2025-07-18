import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min?url';
import 'pdfjs-dist/web/pdf_viewer.css';


pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const CanvasPreview = ({ imageUrl, setCanvasCode }) => {
  const canvasRef = useRef();
  const [isRendering, setIsRendering] = useState(false);
  const renderTaskRef = useRef(null);

  useEffect(() => {
    if (!imageUrl) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const isPDF = imageUrl.toLowerCase().endsWith('.pdf');

    const cleanup = () => {
      // Cancel any ongoing PDF rendering
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
      if (imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };

    if (isPDF) {
      renderPDF(canvas, imageUrl, ctx).then(cleanup);
    } else {
      renderImage(canvas, imageUrl, ctx);
      cleanup();
    }

    return cleanup;
  }, [imageUrl, setCanvasCode]);

  const renderImage = (canvas, url, ctx) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      setCanvasCode(`var chart = new CanvasJS.Chart("canvasContainer", {
        title: { text: "Image Preview" },
        data: [{
          type: "image",
          dataPoints: [{ image: "${url}" }]
        }]
      });`);
    };
    img.onerror = () => alert("Image failed to load.");
    img.src = url;
  };

 const renderPDF = async (canvas, url, ctx) => {
  if (isRendering) return;
  setIsRendering(true);

  try {
    canvas.width = 1;
    canvas.height = 1;
    ctx.clearRect(0, 0, 1, 1);

    let pdfData;
    if (url.startsWith('blob:')) {

      const response = await fetch(url);
      pdfData = await response.arrayBuffer();
    } else if (url.startsWith('http')) {

      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'same-origin'
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      pdfData = await response.arrayBuffer();
    } else {
   
      const response = await fetch(window.location.origin + url);
      pdfData = await response.arrayBuffer();
    }

    // Load PDF document
    const loadingTask = pdfjsLib.getDocument(pdfData);
    const pdf = await loadingTask.promise;
    
    // Get first page
    const page = await pdf.getPage(1);
    
    // Calculate appropriate scale to fit 800px width
    const viewport = page.getViewport({ 
      scale: Math.min(1.5, 350 / page.getViewport({ scale: 1.0 }).width) 
    });
    
    // Set canvas dimensions
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    // Cancel any previous render
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
    }

    // Create new render task
    renderTaskRef.current = page.render({
      canvasContext: ctx,
      viewport: viewport
    });

    await renderTaskRef.current.promise;

    // Generate CanvasJS code
    setCanvasCode(`var chart = new CanvasJS.Chart("canvasContainer", {
      title: { text: "PDF Preview" },
      data: [{
        type: "image",
        dataPoints: [{
          image: "${url}",
          width: ${viewport.width},
          height: ${viewport.height}
        }]
      }]
    });`);

  } catch (err) {
    if (err.name === 'RenderingCancelledException') {
      console.log('Rendering was cancelled');
    } else {
      console.error("PDF rendering error:", err);
      alert(`PDF Error: ${err.message}`);
      // Fallback to placeholder
      drawErrorPlaceholder(canvas, ctx);
    }
  } finally {
    setIsRendering(false);
    renderTaskRef.current = null;
  }
};


const drawErrorPlaceholder = (canvas, ctx) => {
  canvas.width = 300;
  canvas.height = 150;
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#666';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Failed to load PDF', canvas.width/2, canvas.height/2);
};

  return (
    <div style={{ margin: '1rem 0' }}>
      {isRendering && <p>Rendering PDF...</p>}
      <canvas 
        ref={canvasRef} 
        style={{ 
          border: '1px solid #ccc',
          maxWidth: '100%',
          height: '300px',
          display: isRendering ? 'none' : 'block'
        }}
      />
    </div>
  );
};

export default CanvasPreview;