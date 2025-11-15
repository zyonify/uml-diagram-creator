/**
 * Render class diagram as SVG
 */

export function renderClassDiagram(data) {
  if (data.error) {
    return { error: data.error };
  }

  const { classes } = data;

  // SVG dimensions and spacing
  const classWidth = 200;
  const classSpacing = 80;
  const lineHeight = 25;
  const padding = 10;
  const headerHeight = 35;
  const sideMargin = 50;
  const topMargin = 50;

  // Calculate class heights
  const classHeights = classes.map(cls => {
    const fieldsHeight = cls.fields.length * lineHeight;
    const methodsHeight = cls.methods.length * lineHeight;
    return headerHeight + fieldsHeight + methodsHeight + padding * 3;
  });

  // Calculate positions
  let currentX = sideMargin;
  const classPositions = classes.map((cls, i) => {
    const pos = { x: currentX, y: topMargin, width: classWidth, height: classHeights[i] };
    currentX += classWidth + classSpacing;
    return pos;
  });

  const width = currentX - classSpacing + sideMargin;
  const height = topMargin + Math.max(...classHeights) + 100;

  // Generate SVG
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;

  // Styles
  svg += `
    <defs>
      <style>
        .class-box { fill: #f9f9f9; stroke: #333; stroke-width: 2; }
        .class-header { fill: #E8EAF6; stroke: #333; stroke-width: 2; }
        .class-name { fill: #333; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; text-anchor: middle; }
        .class-member { fill: #333; font-family: 'Courier New', monospace; font-size: 12px; }
        .divider { stroke: #333; stroke-width: 1; }
        .inheritance { stroke: #333; stroke-width: 2; fill: none; marker-end: url(#arrowhead); }
      </style>
      <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
        <polygon points="0 0, 10 3, 0 6" fill="white" stroke="#333" stroke-width="1"/>
      </marker>
    </defs>
  `;

  // Draw classes
  classes.forEach((cls, i) => {
    const pos = classPositions[i];
    const { x, y, width: w, height: h } = pos;

    // Class box
    svg += `<rect class="class-box" x="${x}" y="${y}" width="${w}" height="${h}" rx="5"/>`;

    // Header
    svg += `<rect class="class-header" x="${x}" y="${y}" width="${w}" height="${headerHeight}" rx="5"/>`;
    svg += `<text class="class-name" x="${x + w / 2}" y="${y + headerHeight / 2 + 6}">${cls.name}</text>`;

    // Divider after header
    let currentY = y + headerHeight;

    // Fields section
    if (cls.fields.length > 0) {
      cls.fields.forEach((field, fi) => {
        const fieldY = currentY + padding + (fi + 1) * lineHeight - 5;
        const visibility = field.visibility;
        svg += `<text class="class-member" x="${x + padding}" y="${fieldY}">${visibility}${field.name}: ${field.type}</text>`;
      });
      currentY += cls.fields.length * lineHeight + padding;
      svg += `<line class="divider" x1="${x}" y1="${currentY}" x2="${x + w}" y2="${currentY}"/>`;
    }

    // Methods section
    if (cls.methods.length > 0) {
      cls.methods.forEach((method, mi) => {
        const methodY = currentY + padding + (mi + 1) * lineHeight - 5;
        const visibility = method.visibility;
        svg += `<text class="class-member" x="${x + padding}" y="${methodY}">${visibility}${method.name}()</text>`;
      });
    }
  });

  // Draw inheritance arrows
  classes.forEach((cls, i) => {
    if (cls.extends) {
      const childPos = classPositions[i];
      const parentIndex = classes.findIndex(c => c.name === cls.extends);

      if (parentIndex !== -1) {
        const parentPos = classPositions[parentIndex];

        // Draw arrow from child to parent
        const x1 = childPos.x + childPos.width / 2;
        const y1 = childPos.y;
        const x2 = parentPos.x + parentPos.width / 2;
        const y2 = parentPos.y + parentPos.height;

        svg += `<line class="inheritance" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
      }
    }
  });

  svg += '</svg>';

  return { svg, width, height };
}
