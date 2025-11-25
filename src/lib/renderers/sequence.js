/**
 * Render sequence diagram with control structures as SVG
 */

import { applyAspectRatio } from '../stores/aspectRatio.js';

export function renderSequenceDiagram(data, aspectRatio = 'auto') {
  if (data.error) {
    return { error: data.error };
  }

  const { title, participants, elements } = data;

  // SVG dimensions and spacing
  const participantWidth = 120;
  const participantHeight = 40;
  const actorHeight = 60; // Taller for actor icon
  const participantSpacing = 150;
  const messageSpacing = 60;
  let topMargin = 20;
  const titleHeight = 40;
  const sideMargin = 50;
  const lifelineExtension = 40;
  const fragmentPadding = 10;
  const fragmentHeaderHeight = 25;
  const noteWidth = 120;
  const noteHeight = 40;

  // Add space for title if present
  if (title) {
    topMargin += titleHeight;
  }

  // Create participant positions
  const participantPositions = {};
  participants.forEach((p, i) => {
    const name = p.name || p; // Support both old and new format
    participantPositions[name] = sideMargin + (i * participantSpacing) + (participantWidth / 2);
  });

  // Calculate bounds - scan all elements to find min/max X positions needed
  let minX = sideMargin;
  let maxX = sideMargin + (participants.length * participantSpacing);

  function calculateBounds(elementList) {
    for (const element of elementList) {
      if (element.type === 'note') {
        if (element.position === 'left') {
          const participantX = participantPositions[element.participants[0]];
          const noteX = participantX - participantWidth / 2 - noteWidth - 10;
          minX = Math.min(minX, noteX);
        } else if (element.position === 'right') {
          const participantX = participantPositions[element.participants[0]];
          const noteX = participantX + participantWidth / 2 + 10;
          maxX = Math.max(maxX, noteX + noteWidth);
        } else if (element.position === 'over') {
          const firstParticipant = element.participants[0];
          const lastParticipant = element.participants[element.participants.length - 1];
          const x1 = participantPositions[firstParticipant];
          const x2 = participantPositions[lastParticipant];
          const noteX = Math.min(x1, x2) - noteWidth / 2;
          const noteW = Math.abs(x2 - x1) + noteWidth;
          minX = Math.min(minX, noteX);
          maxX = Math.max(maxX, noteX + noteW);
        }
      } else if (element.type === 'fragment') {
        if (element.kind === 'alt' && element.alternatives.length > 0) {
          for (const alt of element.alternatives) {
            calculateBounds(alt.elements);
          }
        } else {
          calculateBounds(element.elements);
        }
      }
    }
  }

  calculateBounds(elements);

  // Add extra padding to ensure nothing is cut off
  const extraPadding = 20;
  minX = Math.min(minX - extraPadding, 0);
  maxX = maxX + extraPadding;

  // Calculate total height by counting all elements recursively
  function countElements(elementList) {
    let count = 0;
    for (const element of elementList) {
      if (element.type === 'message' || element.type === 'note') {
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
  const width = maxX - minX;
  const height = topMargin + participantHeight + (totalElements * messageSpacing) + lifelineExtension;

  // Calculate offset to shift content if minX is negative
  const xOffset = minX < 0 ? -minX : 0;

  // Generate SVG with viewBox to handle coordinate system
  let svg = `<svg width="${width}" height="${height}" viewBox="${minX} 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

  // Styles
  svg += `
    <defs>
      <style>
        .title-text { fill: #333; font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; text-anchor: middle; }
        .participant-box { fill: #4A90E2; stroke: #2E5C8A; stroke-width: 2; }
        .participant-text { fill: white; font-family: Arial, sans-serif; font-size: 14px; text-anchor: middle; }
        .actor-head { fill: #4A90E2; stroke: #2E5C8A; stroke-width: 2; }
        .actor-body { stroke: #2E5C8A; stroke-width: 2; fill: none; }
        .lifeline { stroke: #999; stroke-width: 1; stroke-dasharray: 5,5; }
        .message-line { stroke: #333; stroke-width: 2; fill: none; }
        .message-line.response { stroke-dasharray: 5,5; }
        .message-text { fill: #333; font-family: Arial, sans-serif; font-size: 12px; }
        .arrow { fill: #333; }
        .arrow-open { stroke: #333; stroke-width: 2; fill: none; }
        .fragment-box { fill: none; stroke: #666; stroke-width: 1.5; }
        .fragment-header { fill: #E8EAF6; stroke: #666; stroke-width: 1; }
        .fragment-label { fill: #333; font-family: Arial, sans-serif; font-size: 11px; font-weight: bold; }
        .fragment-condition { fill: #666; font-family: Arial, sans-serif; font-size: 10px; }
        .fragment-divider { stroke: #999; stroke-width: 1; stroke-dasharray: 3,3; }
        .note-box { fill: #FFFACD; stroke: #DAA520; stroke-width: 1.5; }
        .note-text { fill: #333; font-family: Arial, sans-serif; font-size: 11px; }
        .note-fold { fill: #F0E68C; stroke: #DAA520; stroke-width: 1; }
      </style>
    </defs>
  `;

  // Draw title if present
  if (title) {
    const titleLines = title.split('\n');
    const titleY = 20;
    titleLines.forEach((line, idx) => {
      svg += `<text class="title-text" x="${width / 2}" y="${titleY + (idx * 20)}">${line}</text>`;
    });
  }

  // Helper function to draw actor icon
  function drawActor(x, y, name) {
    const centerX = x + participantWidth / 2;
    const headRadius = 8;
    const bodyStartY = y + 20;
    const bodyEndY = y + 35;
    const armY = y + 27;
    const armSpan = 15;
    const legEndY = y + 50;
    const legSpan = 10;

    // Head
    svg += `<circle class="actor-head" cx="${centerX}" cy="${y + 12}" r="${headRadius}"/>`;
    // Body
    svg += `<line class="actor-body" x1="${centerX}" y1="${bodyStartY}" x2="${centerX}" y2="${bodyEndY}"/>`;
    // Arms
    svg += `<line class="actor-body" x1="${centerX - armSpan}" y1="${armY}" x2="${centerX + armSpan}" y2="${armY}"/>`;
    // Legs
    svg += `<line class="actor-body" x1="${centerX}" y1="${bodyEndY}" x2="${centerX - legSpan}" y2="${legEndY}"/>`;
    svg += `<line class="actor-body" x1="${centerX}" y1="${bodyEndY}" x2="${centerX + legSpan}" y2="${legEndY}"/>`;
    // Name
    svg += `<text class="message-text" x="${centerX}" y="${y + 58}" text-anchor="middle">${name}</text>`;
  }

  // Draw participants
  participants.forEach((p, i) => {
    const x = sideMargin + (i * participantSpacing);
    const y = topMargin;
    const name = p.name || p;
    const type = p.type || 'participant';

    if (type === 'actor') {
      drawActor(x, y, name);
    } else {
      // Default participant box
      svg += `
        <rect class="participant-box" x="${x}" y="${y}" width="${participantWidth}" height="${participantHeight}" rx="5"/>
        <text class="participant-text" x="${x + participantWidth / 2}" y="${y + participantHeight / 2 + 5}">${name}</text>
      `;
    }
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

  // Helper function to render note with folded corner
  function renderNote(x, y, width, height, text) {
    const foldSize = 10;
    // Main note rectangle (with top-right corner cut)
    const notePath = `M ${x} ${y} L ${x + width - foldSize} ${y} L ${x + width} ${y + foldSize} L ${x + width} ${y + height} L ${x} ${y + height} Z`;
    svg += `<path class="note-box" d="${notePath}"/>`;

    // Folded corner
    const foldPath = `M ${x + width - foldSize} ${y} L ${x + width - foldSize} ${y + foldSize} L ${x + width} ${y + foldSize}`;
    svg += `<path class="note-fold" d="${foldPath}"/>`;

    // Note text (support multiline)
    const lines = text.split('\n');
    const lineHeight = 14;
    const textStartY = y + 18;
    lines.forEach((line, idx) => {
      svg += `<text class="note-text" x="${x + width / 2}" y="${textStartY + (idx * lineHeight)}" text-anchor="middle">${line}</text>`;
    });
  }

  // Render elements recursively
  function renderElements(elementList, depth = 0) {
    for (const element of elementList) {
      if (element.type === 'note') {
        currentY += messageSpacing;

        if (element.position === 'over') {
          // Note over participant(s)
          const firstParticipant = element.participants[0];
          const lastParticipant = element.participants[element.participants.length - 1];
          const x1 = participantPositions[firstParticipant];
          const x2 = participantPositions[lastParticipant];

          const noteX = Math.min(x1, x2) - noteWidth / 2;
          const noteW = Math.abs(x2 - x1) + noteWidth;

          renderNote(noteX, currentY - noteHeight / 2, noteW, noteHeight, element.text);
        } else if (element.position === 'left') {
          // Note to the left of participant
          const participantX = participantPositions[element.participants[0]];
          const noteX = participantX - participantWidth / 2 - noteWidth - 10;

          renderNote(noteX, currentY - noteHeight / 2, noteWidth, noteHeight, element.text);
        } else if (element.position === 'right') {
          // Note to the right of participant
          const participantX = participantPositions[element.participants[0]];
          const noteX = participantX + participantWidth / 2 + 10;

          renderNote(noteX, currentY - noteHeight / 2, noteWidth, noteHeight, element.text);
        }

      } else if (element.type === 'message') {
        currentY += messageSpacing;
        const x1 = participantPositions[element.from];
        const x2 = participantPositions[element.to];

        // Handle self-messages (loops back to same participant)
        if (element.isSelfMessage) {
          const loopWidth = 60;
          const loopHeight = 30;
          const x = x1;

          // Draw self-message arc
          const path = `M ${x} ${currentY} L ${x + loopWidth} ${currentY} L ${x + loopWidth} ${currentY + loopHeight} L ${x} ${currentY + loopHeight}`;
          const lineClass = element.messageType === 'response' ? 'response' : '';
          svg += `<path class="message-line ${lineClass}" d="${path}" fill="none"/>`;

          // Draw arrowhead at end of loop
          svg += `<polygon class="arrow" points="${x},${currentY + loopHeight} ${x + 5},${currentY + loopHeight - 5} ${x + 5},${currentY + loopHeight + 5}"/>`;

          // Draw message text (support multiline)
          const messageLines = element.message.split('\n');
          const lineHeight = 14;
          const startY = currentY + loopHeight / 2 + 4 - ((messageLines.length - 1) * lineHeight / 2);
          messageLines.forEach((line, idx) => {
            svg += `<text class="message-text" x="${x + loopWidth + 5}" y="${startY + (idx * lineHeight)}" text-anchor="start">${line}</text>`;
          });

          currentY += loopHeight / 2; // Add extra spacing for self-messages
        } else {
          // Regular messages between different participants
          const isResponse = element.messageType === 'response';
          const isAsync = element.messageType === 'async';
          const arrowDirection = x2 > x1 ? 1 : -1;
          const arrowTipX = x2;
          const arrowBaseX = x2 - 10 * arrowDirection;

          // Draw arrowhead first (so line doesn't overlap it)
          // Async and response use open arrowhead, sync uses filled
          if (isAsync || isResponse) {
            // Open arrowhead
            svg += `<polyline class="arrow-open" points="${arrowBaseX},${currentY - 5} ${arrowTipX},${currentY} ${arrowBaseX},${currentY + 5}" fill="none"/>`;
          } else {
            // Filled arrowhead (synchronous)
            svg += `<polygon class="arrow" points="${arrowTipX},${currentY} ${arrowBaseX},${currentY - 5} ${arrowBaseX},${currentY + 5}"/>`;
          }

          // Draw arrow line (stop before arrowhead)
          const lineEndX = x2 - 12 * arrowDirection;
          const lineClass = isResponse ? 'response' : '';
          svg += `<line class="message-line ${lineClass}" x1="${x1}" y1="${currentY}" x2="${lineEndX}" y2="${currentY}"/>`;

          // Draw message text (support multiline)
          const textX = (x1 + x2) / 2;
          const textY = currentY - 5;
          const messageLines = element.message.split('\n');
          if (messageLines.length === 1) {
            svg += `<text class="message-text" x="${textX}" y="${textY}" text-anchor="middle">${element.message}</text>`;
          } else {
            // Multiline message
            const lineHeight = 14;
            const startY = textY - ((messageLines.length - 1) * lineHeight / 2);
            messageLines.forEach((line, idx) => {
              svg += `<text class="message-text" x="${textX}" y="${startY + (idx * lineHeight)}" text-anchor="middle">${line}</text>`;
            });
          }
        }

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
          par: 'par',
          break: 'break',
          strict: 'strict',
          seq: 'seq',
          critical: 'critical'
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
    // Replace the existing viewBox-enabled SVG tag
    svg = svg.replace(
      `<svg width="${width}" height="${height}" viewBox="${minX} 0 ${width} ${height}"`,
      `<svg width="${adjustedDimensions.width}" height="${adjustedDimensions.height}" viewBox="${minX} 0 ${width} ${height}"`
    );
  }

  return { svg, width: adjustedDimensions.width, height: adjustedDimensions.height };
}
