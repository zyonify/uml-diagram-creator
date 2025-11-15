/**
 * File import/export operations
 */

// Export diagram as .uml file
export function exportAsUML(text, filename = 'diagram.uml') {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  downloadBlob(blob, filename);
}

// Import .uml file
export function importUML(callback) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.uml,.txt';

  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      callback(text, file.name);
    };
    reader.readAsText(file);
  };

  input.click();
}

// Export as JSON (diagram + metadata)
export function exportAsJSON(data, filename = 'diagram.json') {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, filename);
}

// Import JSON file
export function importJSON(callback) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';

  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        callback(data, file.name);
      } catch (error) {
        alert('Error parsing JSON file: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  input.click();
}

// Copy text to clipboard
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch (err) {
      document.body.removeChild(textarea);
      return false;
    }
  }
}

// Helper function to download blob
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Generate shareable link (encode diagram in URL)
export function generateShareableLink(text) {
  const encoded = encodeURIComponent(text);
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?diagram=${encoded}`;
}

// Load diagram from URL parameter
export function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  const diagram = params.get('diagram');
  if (diagram) {
    try {
      return decodeURIComponent(diagram);
    } catch (error) {
      console.error('Error decoding diagram from URL:', error);
      return null;
    }
  }
  return null;
}

// Export as Markdown (embed SVG as base64)
export function exportAsMarkdown(svgContent, diagramText) {
  const base64SVG = btoa(unescape(encodeURIComponent(svgContent)));
  const markdown = `# UML Diagram

![UML Diagram](data:image/svg+xml;base64,${base64SVG})

## Source Code

\`\`\`
${diagramText}
\`\`\`
`;

  return markdown;
}
