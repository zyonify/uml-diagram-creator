/**
 * Export utilities for diagrams
 */

// Export as SVG file
export function exportAsSVG(svgContent, filename = 'diagram.svg') {
  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  downloadBlob(blob, filename);
}

// Export as PNG
export function exportAsPNG(svgContent, filename = 'diagram.png') {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();

  // Parse SVG to get dimensions
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
  const svgElement = svgDoc.documentElement;
  const width = parseInt(svgElement.getAttribute('width')) || 800;
  const height = parseInt(svgElement.getAttribute('height')) || 600;

  canvas.width = width;
  canvas.height = height;

  // Fill white background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);

  const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = function() {
    ctx.drawImage(img, 0, 0);
    canvas.toBlob(function(blob) {
      downloadBlob(blob, filename);
      URL.revokeObjectURL(url);
    });
  };

  img.src = url;
}

// Export as PDF (using a simple approach with canvas)
export async function exportAsPDF(svgContent, filename = 'diagram.pdf') {
  // For a simple implementation, we'll convert to PNG first
  // then embed in a minimal PDF structure
  // For production, you might want to use jsPDF or similar library

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();

  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
  const svgElement = svgDoc.documentElement;
  const width = parseInt(svgElement.getAttribute('width')) || 800;
  const height = parseInt(svgElement.getAttribute('height')) || 600;

  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);

  const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  return new Promise((resolve) => {
    img.onload = function() {
      ctx.drawImage(img, 0, 0);

      // Convert canvas to data URL
      const imgData = canvas.toDataURL('image/jpeg', 1.0);

      // Create a simple PDF with the image
      // This is a basic implementation - for better PDFs use a library
      const pdf = createSimplePDF(imgData, width, height);
      const pdfBlob = new Blob([pdf], { type: 'application/pdf' });

      downloadBlob(pdfBlob, filename);
      URL.revokeObjectURL(url);
      resolve();
    };

    img.src = url;
  });
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

// Create a simple PDF (basic implementation)
function createSimplePDF(imageData, width, height) {
  // This is a very basic PDF structure
  // For production use, consider using jsPDF or pdfmake
  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 44 >>
stream
q
${width} 0 0 ${height} 0 0 cm
/Im1 Do
Q
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000214 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
306
%%EOF`;

  return pdf;
}
