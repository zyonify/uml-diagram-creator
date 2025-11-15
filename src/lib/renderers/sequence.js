/**
 * Render sequence diagram with control structures as SVG
 */

import { applyAspectRatio } from '../stores/aspectRatio.js';

export function renderSequenceDiagram(data, aspectRatio = 'auto') {
  if (data.error) {
    return { error: data.error };
  }

  const { participants, elements } = data;

  // SVG dimensions and spacing
  const participantWidth = 120;
  const participantHeight = 40;
  const participantSpacing = 150;
  const messageSpacing = 60;
  const topMargin = 20;
  const sideMargin = 50;
  const lifelineExtension = 40;
  const fragmentPadding = 10;
  const fragmentHeaderHeight = 25;

  // Create participant positions
  const participantPositions = {};
  participants.forEach((p, i) => {
    participantPositions[p] = sideMargin + (i * participantSpacing) + (participantWidth / 2);
  });

  // Calculate total height by counting all elements recursively
  function countElements(elementList) {
    let count = 0;
    for (const element of elementList) {
      if (element.type === 'message') {
        count++;
      } else if (element.type === 'fragment') {
        count++; // For fragment header
        if (element.kind === 'alt' && element.alternatives.length > 0) {
          // Count all alternatives
          for (const alt of element.alternatives) {
            count += countElements(alt.elements);
            count++; // For divider between alternatives
          }
        } else {
          count += countElements(element.elements);
        }
        count++; // For fragment padding
      }
    }
    return count;
  }

  const totalElements = countElements(elements);
  const width = sideMargin * 2 + (participants.length * participantSpacing);
  const height = topMargin + participantHeight + (totalElements * messageSpacing) + lifelineExtension;

  // Generate SVG
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;

  // Styles
  svg += `
    <defs>
      <style>
        .participant-box { fill: #4A90E2; stroke: #2E5C8A; stroke-width: 2; }
        .participant-text { fill: white; font-family: Arial, sans-serif; font-size: 14px; text-anchor: middle; }
        .lifeline { stroke: #999; stroke-width: 1; stroke-dasharray: 5,5; }
        .message-line { stroke: #333; stroke-width: 2; fill: none; }
        .message-line.response { stroke-dasharray: 5,5; }
        .message-text { fill: #333; font-family: Arial, sans-serif; font-size: 12px; }
        .arrow { fill: #333; }
        .fragment-box { fill: none; stroke: #666; stroke-width: 1.5; }
        .fragment-header { fill: #E8EAF6; stroke: #666; stroke-width: 1; }
        .fragment-label { fill: #333; font-family: Arial, sans-serif; font-size: 11px; font-weight: bold; }
        .fragment-condition { fill: #666; font-family: Arial, sans-serif; font-size: 10px; }
        .fragment-divider { stroke: #999; stroke-width: 1; stroke-dasharray: 3,3; }
      </style>
    </defs>
  `;

  // Draw participants
  participants.forEach((p, i) => {
    const x = sideMargin + (i * participantSpacing);
    const y = topMargin;

    svg += `
      <rect class="participant-box" x="${x}" y="${y}" width="${participantWidth}" height="${participantHeight}" rx="5"/>
      <text class="participant-text" x="${x + participantWidth / 2}" y="${y + participantHeight / 2 + 5}">${p}</text>
    `;
  });

  // Draw lifelines
  const lifelineStartY = topMargin + participantHeight;
  const lifelineEndY = height - lifelineExtension;

  participants.forEach((p) => {
    const x = participantPositions[p];
    svg += `<line class="lifeline" x1="${x}" y1="${lifelineStartY}" x2="${x}" y2="${lifelineEndY}"/>`;
  });

  // Track current Y position
  let currentY = lifelineStartY;

  // Render elements recursively
  function renderElements(elementList, depth = 0) {
    for (const element of elementList) {
      if (element.type === 'message') {
        currentY += messageSpacing;
        const x1 = participantPositions[element.from];
        const x2 = participantPositions[element.to];
        const isResponse = element.messageType === 'response';

        // Draw arrow line
        svg += `<line class="message-line ${isResponse ? 'response' : ''}" x1="${x1}" y1="${currentY}" x2="${x2 - 10}" y2="${currentY}"/>`;

        // Draw arrowhead
        const arrowDirection = x2 > x1 ? 1 : -1;
        svg += `<polygon class="arrow" points="${x2 - 10 * arrowDirection},${currentY} ${x2 - 10 * arrowDirection - 5 * arrowDirection},${currentY - 5} ${x2 - 10 * arrowDirection - 5 * arrowDirection},${currentY + 5}"/>`;

        // Draw message text
        const textX = (x1 + x2) / 2;
        const textY = currentY - 5;
        svg += `<text class="message-text" x="${textX}" y="${textY}" text-anchor="middle">${element.message}</text>`;

      } else if (element.type === 'fragment') {
        const fragmentStartY = currentY + messageSpacing / 2;
        const fragmentStartIndex = currentY;

        // Skip to leave space for header
        currentY += messageSpacing;

        // Get fragment label
        const fragmentLabels = {
          loop: 'loop',
          alt: 'alt',
          opt: 'opt',
          par: 'par'
        };
        const label = fragmentLabels[element.kind] || element.kind;

        // Render fragment contents
        if (element.kind === 'alt' && element.alternatives.length > 0) {
          // Render alternatives
          for (let i = 0; i < element.alternatives.length; i++) {
            const alt = element.alternatives[i];

            if (i > 0) {
              // Draw divider between alternatives
              currentY += messageSpacing / 3;
              const dividerY = currentY;
              svg += `<line class="fragment-divider" x1="${sideMargin}" y1="${dividerY}" x2="${width - sideMargin}" y2="${dividerY}"/>`;

              // Draw alternative condition
              svg += `<text class="fragment-condition" x="${sideMargin + 15}" y="${dividerY + 12}">[${alt.condition}]</text>`;
              currentY += messageSpacing / 3;
            }

            renderElements(alt.elements, depth + 1);
          }
        } else {
          renderElements(element.elements, depth + 1);
        }

        const fragmentEndY = currentY + messageSpacing / 2;

        // Draw fragment box
        const boxX = sideMargin - fragmentPadding;
        const boxY = fragmentStartY;
        const boxWidth = width - 2 * sideMargin + 2 * fragmentPadding;
        const boxHeight = fragmentEndY - fragmentStartY;

        svg += `<rect class="fragment-box" x="${boxX}" y="${boxY}" width="${boxWidth}" height="${boxHeight}" rx="3"/>`;

        // Draw fragment header
        const headerWidth = 60;
        svg += `<path class="fragment-header" d="M ${boxX} ${boxY + fragmentHeaderHeight} L ${boxX} ${boxY} L ${boxX + headerWidth} ${boxY} L ${boxX + headerWidth + 10} ${boxY + fragmentHeaderHeight} L ${boxX} ${boxY + fragmentHeaderHeight} Z"/>`;

        // Draw fragment label and condition
        svg += `<text class="fragment-label" x="${boxX + 5}" y="${boxY + 12}">${label}</text>`;
        if (element.condition && element.kind !== 'alt') {
          svg += `<text class="fragment-condition" x="${boxX + headerWidth + 15}" y="${boxY + 12}">[${element.condition}]</text>`;
        } else if (element.kind === 'alt' && element.alternatives.length > 0 && element.alternatives[0].condition) {
          svg += `<text class="fragment-condition" x="${boxX + headerWidth + 15}" y="${boxY + 12}">[${element.alternatives[0].condition}]</text>`;
        }

        currentY = fragmentEndY;
      }
    }
  }

  renderElements(elements);

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
