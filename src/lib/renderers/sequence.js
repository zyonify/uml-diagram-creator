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
        .activation-box { fill: #f0f0f0; stroke: #666; stroke-width: 1; }
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

  // Track activation boxes for each participant
  const activations = {}; // { participant: [{ startY, endY, depth }] }
  participants.forEach(p => {
    activations[p] = [];
  });

  // Track active call stack for each participant
  const activeStack = {}; // { participant: [{ startY, depth }] }
  participants.forEach(p => {
    activeStack[p] = [];
  });

  // Render elements recursively
  function renderElements(elementList, depth = 0) {
    for (const element of elementList) {
      if (element.type === 'message') {
        currentY += messageSpacing;
        const x1 = participantPositions[element.from];
        const x2 = participantPositions[element.to];

        const isResponse = element.messageType === 'response';
        const isAsync = element.messageType === 'async';
        const isSelfMessage = element.isSelfMessage;

        // Track activations
        if (!isResponse) {
          // Synchronous or async call: sender and receiver activate
          const senderDepth = activeStack[element.from].length;
          activeStack[element.from].push({ startY: currentY, depth: senderDepth });

          if (!isSelfMessage) {
            const receiverDepth = activeStack[element.to].length;
            activeStack[element.to].push({ startY: currentY, depth: receiverDepth });
          } else {
            // For self-messages, create a nested activation
            const nestedDepth = activeStack[element.from].length;
            activeStack[element.from].push({ startY: currentY, depth: nestedDepth });
          }
        } else {
          // Response: receiver deactivates, sender may deactivate
          if (activeStack[element.from].length > 0) {
            const activation = activeStack[element.from].pop();
            activations[element.from].push({
              startY: activation.startY,
              endY: currentY,
              depth: activation.depth
            });
          }

          // Also close sender's activation if they were waiting
          if (!isSelfMessage && activeStack[element.to].length > 0) {
            const activation = activeStack[element.to].pop();
            activations[element.to].push({
              startY: activation.startY,
              endY: currentY,
              depth: activation.depth
            });
          }
        }

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

          // Draw message text
          svg += `<text class="message-text" x="${x + loopWidth + 5}" y="${currentY + loopHeight / 2 + 4}" text-anchor="start">${element.message}</text>`;

          currentY += loopHeight / 2; // Add extra spacing for self-messages
        } else {
          // Regular messages between different participants
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

          // Draw message text
          const textX = (x1 + x2) / 2;
          const textY = currentY - 5;
          svg += `<text class="message-text" x="${textX}" y="${textY}" text-anchor="middle">${element.message}</text>`;
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

  // Draw activation boxes
  const activationWidth = 10;
  const activationOffset = 5; // Offset for nested activations

  participants.forEach(p => {
    const centerX = participantPositions[p];

    activations[p].forEach(activation => {
      const x = centerX - activationWidth / 2 + (activation.depth * activationOffset);
      const y = activation.startY;
      const height = activation.endY - activation.startY;

      svg += `<rect class="activation-box" x="${x}" y="${y}" width="${activationWidth}" height="${height}"/>`;
    });
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
