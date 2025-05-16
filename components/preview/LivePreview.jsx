import React, { useEffect, useRef, useState } from 'react';

const LivePreview = ({ html, css, js, libraries = [] }) => {
    const iframeRef = useRef(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (iframeRef.current) {
            try {
                const document = iframeRef.current.contentDocument;

                // Przygotowanie linków do bibliotek
                const libraryLinks = libraries.map(lib => {
                    if (lib.url.endsWith('.css')) {
                        return `<link rel="stylesheet" href="${lib.url}">`;
                    } else {
                        return `<script src="${lib.url}"></script>`;
                    }
                }).join('\n');

                const content = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              ${libraryLinks}
              <style>${css}</style>
              <script>
                // Przechwytywanie błędów JavaScript
                window.onerror = function(message, source, lineno, colno, error) {
                  const errorElement = document.getElementById('js-error');
                  if (errorElement) {
                    errorElement.textContent = 'JavaScript Error: ' + message;
                    errorElement.style.display = 'block';
                  }
                  return true;
                };
              </script>
            </head>
            <body>
              <div id="js-error" style="display:none; background-color:#ffebee; color:#c62828; padding:10px; margin-bottom:10px; border-radius:4px; font-family:monospace;"></div>
              ${html}
              <script>${js}</script>
            </body>
          </html>
        `;

                document.open();
                document.write(content);
                document.close();
                setError(null);
            } catch (err) {
                setError('Wystąpił błąd podczas renderowania podglądu.');
                console.error('Błąd podglądu:', err);
            }
        }
    }, [html, css, js, libraries]);

    return (
        <div className="live-preview-container">
            {error && <div className="preview-error">{error}</div>}
            <iframe
                ref={iframeRef}
                title="preview"
                className="preview-iframe"
                sandbox="allow-scripts"
            />
        </div>
    );
};

export default LivePreview;
