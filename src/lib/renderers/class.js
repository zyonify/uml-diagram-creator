/**
 * Render class diagram as SVG
 */

import { applyAspectRatio } from '../stores/aspectRatio.js';

export function renderClassDiagram(data, aspectRatio = 'auto') {
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

  // Hierarchical layout: arrange classes in levels based on relationships
  const levels = [];
  const classLevel = new Map();
  const visited = new Set();

  // Helper function to calculate level recursively
  function calculateLevel(className, currentLevel = 0) {
    if (visited.has(className)) return classLevel.get(className);
    visited.add(className);

    const cls = classes.find(c => c.name === className);
    if (!cls) return currentLevel;

    // Find relationships where this class is the source
    const parentRels = relationships.filter(r =>
      r.from === className && (r.type === 'extends' || r.type === 'implements')
    );

    let maxParentLevel = -1;
    for (const rel of parentRels) {
      const parentLevel = calculateLevel(rel.to, currentLevel + 1);
      maxParentLevel = Math.max(maxParentLevel, parentLevel);
    }

    const level = maxParentLevel + 1;
    classLevel.set(className, level);

    if (!levels[level]) levels[level] = [];
    levels[level].push(className);

    return level;
  }

  // Calculate levels for all classes
  classes.forEach(cls => {
    if (!visited.has(cls.name)) {
      calculateLevel(cls.name);
    }
  });

  // Position classes in a grid layout
  const rowHeight = Math.max(...classHeights) + 100;
  const classPositions = [];
  const classNameToIndex = new Map();

  classes.forEach((cls, i) => {
    classNameToIndex.set(cls.name, i);
  });

  let maxWidth = 0;
  levels.forEach((levelClasses, level) => {
    const levelWidth = levelClasses.length * (classWidth + classSpacing);
    maxWidth = Math.max(maxWidth, levelWidth);

    levelClasses.forEach((className, indexInLevel) => {
      const classIndex = classNameToIndex.get(className);
      const x = sideMargin + indexInLevel * (classWidth + classSpacing);
      const y = topMargin + level * rowHeight;

      classPositions[classIndex] = {
        x,
        y,
        width: classWidth,
        height: classHeights[classIndex]
      };
    });
  });

  const width = Math.max(maxWidth + sideMargin * 2, 800);
  const height = topMargin + (levels.length * rowHeight) + 100;

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
        .rel-extends { stroke: #333; stroke-width: 1.5; fill: none; marker-end: url(#hollow-triangle); }
        .rel-implements { stroke: #333; stroke-width: 1.5; fill: none; stroke-dasharray: 5,5; marker-end: url(#hollow-triangle); }
        .rel-uses { stroke: #333; stroke-width: 1.5; fill: none; stroke-dasharray: 5,5; marker-end: url(#simple-arrow); }
        .rel-has { stroke: #333; stroke-width: 1.5; fill: none; marker-start: url(#hollow-diamond); }
        .rel-owns { stroke: #333; stroke-width: 1.5; fill: none; marker-start: url(#filled-diamond); }
      </style>
      <!-- Hollow triangle for inheritance/implements -->
      <marker id="hollow-triangle" markerWidth="12" markerHeight="12" refX="11" refY="6" orient="auto" markerUnits="strokeWidth">
        <polygon points="0 0, 12 6, 0 12" fill="white" stroke="#333" stroke-width="2"/>
      </marker>
      <!-- Simple arrow for association/uses -->
      <marker id="simple-arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="strokeWidth">
        <polygon points="0 0, 10 5, 0 10" fill="#333"/>
      </marker>
      <!-- Hollow diamond for aggregation (has) -->
      <marker id="hollow-diamond" markerWidth="14" markerHeight="14" refX="15" refY="7" orient="auto-start-reverse" markerUnits="strokeWidth">
        <polygon points="0 7, 7 0, 14 7, 7 14" fill="white" stroke="#333" stroke-width="1.5"/>
      </marker>
      <!-- Filled diamond for composition (owns) -->
      <marker id="filled-diamond" markerWidth="14" markerHeight="14" refX="15" refY="7" orient="auto-start-reverse" markerUnits="strokeWidth">
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

  // Draw relationship arrows with intelligent routing
  relationships.forEach(rel => {
    const fromIndex = classes.findIndex(c => c.name === rel.from);
    const toIndex = classes.findIndex(c => c.name === rel.to);

    if (fromIndex !== -1 && toIndex !== -1) {
      const fromPos = classPositions[fromIndex];
      const toPos = classPositions[toIndex];

      // Calculate edge connection points based on relative positions
      let x1, y1, x2, y2;

      // Check if classes are on different vertical levels
      const fromLevel = classLevel.get(classes[fromIndex].name) || 0;
      const toLevel = classLevel.get(classes[toIndex].name) || 0;
      const verticalDiff = Math.abs(fromPos.y - toPos.y);
      const isVerticalLayout = verticalDiff > 50;

      const className = `rel-${rel.type}`;

      if (isVerticalLayout) {
        // Vertical relationship (parent above child or has/owns)
        if (fromPos.y < toPos.y) {
          // From is above To: connect bottom of from to top of to
          x1 = fromPos.x + fromPos.width / 2;
          y1 = fromPos.y + fromPos.height;
          x2 = toPos.x + toPos.width / 2;
          y2 = toPos.y;
        } else {
          // From is below To: connect top of from to bottom of to
          x1 = fromPos.x + fromPos.width / 2;
          y1 = fromPos.y;
          x2 = toPos.x + toPos.width / 2;
          y2 = toPos.y + toPos.height;
        }

        // Use straight line for vertical connections
        svg += `<line class="${className}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
      } else {
        // Horizontal relationship (same level)
        const goingRight = fromPos.x < toPos.x;

        if (goingRight) {
          // Start from right edge of source
          x1 = fromPos.x + fromPos.width;
          y1 = fromPos.y + fromPos.height / 2;
          // End at left edge of target
          x2 = toPos.x;
          y2 = toPos.y + toPos.height / 2;
        } else {
          // Start from left edge of source
          x1 = fromPos.x;
          y1 = fromPos.y + fromPos.height / 2;
          // End at right edge of target
          x2 = toPos.x + toPos.width;
          y2 = toPos.y + toPos.height / 2;
        }

        svg += `<line class="${className}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
      }
    }
  });

  svg += '</svg>';

  // Apply aspect ratio constraints
  const adjustedDimensions = applyAspectRatio(width, height, aspectRatio);

  // Update SVG dimensions if aspect ratio was applied
  if (adjustedDimensions.width !== width || adjustedDimensions.height !== height) {
    svg = svg.replace(
      `<svg width="${width}" height="${height}"`,
      `<svg width="${adjustedDimensions.width}" height="${adjustedDimensions.height}" viewBox="0 0 ${width} ${height}"`
    );
  }

  return { svg, width: adjustedDimensions.width, height: adjustedDimensions.height };
}
