/**
 * Render sequence diagram as SVG
 */

export function renderSequenceDiagram(data) {
  if (data.error) {
    return { error: data.error };
  }

  const { participants, messages } = data;

  // SVG dimensions and spacing
  const participantWidth = 120;
  const participantHeight = 40;
  const participantSpacing = 150;
  const messageSpacing = 60;
  const topMargin = 20;
  const sideMargin = 50;
  const lifelineExtension = 40;

  const width = sideMargin * 2 + (participants.length * participantSpacing);
  const height = topMargin + participantHeight + (messages.length * messageSpacing) + lifelineExtension;

  // Create participant positions
  const participantPositions = {};
  participants.forEach((p, i) => {
    participantPositions[p] = sideMargin + (i * participantSpacing) + (participantWidth / 2);
  });

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

  // Draw messages
  messages.forEach((msg, i) => {
    const y = lifelineStartY + (i + 1) * messageSpacing;
    const x1 = participantPositions[msg.from];
    const x2 = participantPositions[msg.to];
    const isResponse = msg.type === 'response';

    // Draw arrow line
    svg += `<line class="message-line ${isResponse ? 'response' : ''}" x1="${x1}" y1="${y}" x2="${x2 - 10}" y2="${y}"/>`;

    // Draw arrowhead
    const arrowDirection = x2 > x1 ? 1 : -1;
    svg += `<polygon class="arrow" points="${x2 - 10 * arrowDirection},${y} ${x2 - 10 * arrowDirection - 5 * arrowDirection},${y - 5} ${x2 - 10 * arrowDirection - 5 * arrowDirection},${y + 5}"/>`;

    // Draw message text
    const textX = (x1 + x2) / 2;
    const textY = y - 5;
    svg += `<text class="message-text" x="${textX}" y="${textY}" text-anchor="middle">${msg.message}</text>`;
  });

  svg += '</svg>';

  return { svg, width, height };
}
