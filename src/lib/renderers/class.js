/**
 * Render class diagram as SVG
 */

export function renderClassDiagram(data) {
  if (data.error) {
    return { error: data.error };
  }

  const { classes, relationships = [] } = data;

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
        .rel-extends { stroke: #333; stroke-width: 2; fill: none; marker-end: url(#hollow-triangle); }
        .rel-implements { stroke: #333; stroke-width: 2; fill: none; stroke-dasharray: 5,5; marker-end: url(#hollow-triangle); }
        .rel-uses { stroke: #333; stroke-width: 2; fill: none; stroke-dasharray: 5,5; marker-end: url(#simple-arrow); }
        .rel-has { stroke: #333; stroke-width: 2; fill: none; marker-start: url(#hollow-diamond); }
        .rel-owns { stroke: #333; stroke-width: 2; fill: none; marker-start: url(#filled-diamond); }
      </style>
      <!-- Hollow triangle for inheritance/implements -->
      <marker id="hollow-triangle" markerWidth="12" markerHeight="12" refX="11" refY="6" orient="auto">
        <polygon points="0 0, 12 6, 0 12" fill="white" stroke="#333" stroke-width="2"/>
      </marker>
      <!-- Simple arrow for association/uses -->
      <marker id="simple-arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
        <polygon points="0 0, 10 5, 0 10" fill="#333"/>
      </marker>
      <!-- Hollow diamond for aggregation (has) -->
      <marker id="hollow-diamond" markerWidth="14" markerHeight="14" refX="1" refY="7" orient="auto">
        <polygon points="0 7, 7 0, 14 7, 7 14" fill="white" stroke="#333" stroke-width="2"/>
      </marker>
      <!-- Filled diamond for composition (owns) -->
      <marker id="filled-diamond" markerWidth="14" markerHeight="14" refX="1" refY="7" orient="auto">
        <polygon points="0 7, 7 0, 14 7, 7 14" fill="#333"/>
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

  // Draw relationship arrows
  relationships.forEach(rel => {
    const fromIndex = classes.findIndex(c => c.name === rel.from);
    const toIndex = classes.findIndex(c => c.name === rel.to);

    if (fromIndex !== -1 && toIndex !== -1) {
      const fromPos = classPositions[fromIndex];
      const toPos = classPositions[toIndex];

      // Calculate arrow positions based on relationship type
      let x1, y1, x2, y2;

      // For has/owns (aggregation/composition), arrow goes from owner to owned
      // Diamond is at the owner end
      if (rel.type === 'has' || rel.type === 'owns') {
        x1 = fromPos.x + fromPos.width / 2;
        y1 = fromPos.y + fromPos.height;
        x2 = toPos.x + toPos.width / 2;
        y2 = toPos.y;
      } else {
        // For extends/implements/uses, arrow points to the target
        x1 = fromPos.x + fromPos.width / 2;
        y1 = fromPos.y;
        x2 = toPos.x + toPos.width / 2;
        y2 = toPos.y + toPos.height;
      }

      const className = `rel-${rel.type}`;
      svg += `<line class="${className}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
    }
  });

  svg += '</svg>';

  return { svg, width, height };
}
