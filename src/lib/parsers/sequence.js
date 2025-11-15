/**
 * Parse sequence diagram syntax
 * Format:
 * sequence:
 *   Actor -> Server: Request
 *   Server -> Database: Query
 *   Database --> Server: Data
 *   Server --> Actor: Response
 */

export function parseSequenceDiagram(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);

  if (!lines[0] || !lines[0].toLowerCase().startsWith('sequence:')) {
    return { error: 'Diagram must start with "sequence:"' };
  }

  const participants = new Set();
  const messages = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // Match: Actor -> Server: Message or Actor --> Server: Message
    const match = line.match(/^(.+?)\s*(-->?)\s*(.+?):\s*(.+)$/);

    if (match) {
      const [, from, arrow, to, message] = match;
      const fromTrimmed = from.trim();
      const toTrimmed = to.trim();

      participants.add(fromTrimmed);
      participants.add(toTrimmed);

      messages.push({
        from: fromTrimmed,
        to: toTrimmed,
        message: message.trim(),
        type: arrow === '-->' ? 'response' : 'request'
      });
    }
  }

  return {
    participants: Array.from(participants),
    messages
  };
}
