import React, { useState } from 'react';
import './CodeOutput.css';

/**
 * CodeOutput Component - Displays generated CanvasJS code with copy functionality
 * @param {string} canvasCode - The generated CanvasJS code to display
 * @returns {JSX.Element} - The rendered code output component
 */
const CodeOutput = ({ canvasCode }) => {
  const [copied, setCopied] = useState(false);

  /**
   * Handles copying the code to clipboard
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(canvasCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy code to clipboard');
    }
  };

  return (
    <div className="code-output-container">
      <div className="code-header">
        <h3>Generated CanvasJS Code</h3>
        <div className="code-actions">
          <button
            onClick={handleCopy}
            className={`copy-btn ${copied ? 'copied' : ''}`}
            aria-label="Copy code to clipboard"
            disabled={!canvasCode}
          >
            {copied ? (
              <>
                <span className="icon">✓</span>
                Copied!
              </>
            ) : (
              <>
                <span className="icon">⎘</span>
                Copy Code
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="code-content">
        <pre>
          <code>{canvasCode || '// Your generated code will appear here...'}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeOutput;