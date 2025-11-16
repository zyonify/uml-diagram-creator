/**
 * Parse sequence diagram syntax with control structures
 * Format:
 * sequence:
 *   Actor -> Server: Synchronous Request
 *   Actor ->> Server: Asynchronous Request
 *   Server -> Server: Self Message
 *   loop [condition]
 *     Server -> Database: Query
 *   end
 *   Server --> Actor: Response
 *
 * Supported operators: loop, alt/else, opt, par, break, strict, seq, critical
 */

export function parseSequenceDiagram(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);

  if (!lines[0] || !lines[0].toLowerCase().startsWith('sequence:')) {
    return { error: 'Diagram must start with "sequence:"' };
  }

  const participants = new Set();
  const elements = []; // Can be messages or fragments
  const fragmentStack = []; // Stack to track nested fragments

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // Check for fragment start (loop, alt, opt, par, break, strict, seq, critical)
    const fragmentMatch = line.match(/^(loop|alt|opt|par|break|strict|seq|critical)(?:\s+\[(.+)\])?$/i);
    if (fragmentMatch) {
      const fragment = {
        type: 'fragment',
        kind: fragmentMatch[1].toLowerCase(),
        condition: fragmentMatch[2] || '',
        elements: [],
        alternatives: [] // For alt/else
      };

      if (fragmentStack.length > 0) {
        // Nested fragment
        const parent = fragmentStack[fragmentStack.length - 1];
        if (parent.currentAlt) {
          parent.currentAlt.elements.push(fragment);
        } else {
          parent.elements.push(fragment);
        }
      } else {
        elements.push(fragment);
      }

      fragmentStack.push(fragment);
      continue;
    }

    // Check for else (only valid in alt fragments)
    const elseMatch = line.match(/^else(?:\s+\[(.+)\])?$/i);
    if (elseMatch) {
      if (fragmentStack.length === 0 || fragmentStack[fragmentStack.length - 1].kind !== 'alt') {
        return { error: `'else' can only be used inside 'alt' blocks (line ${i + 1})` };
      }

      const altFragment = fragmentStack[fragmentStack.length - 1];
      const alternative = {
        condition: elseMatch[1] || 'else',
        elements: []
      };
      altFragment.alternatives.push(alternative);
      altFragment.currentAlt = alternative;
      continue;
    }

    // Check for fragment end
    if (line.toLowerCase() === 'end') {
      if (fragmentStack.length === 0) {
        return { error: `'end' without matching fragment start (line ${i + 1})` };
      }

      const fragment = fragmentStack.pop();

      // For alt fragments, if we have alternatives, move main elements to first alternative
      if (fragment.kind === 'alt' && fragment.alternatives.length > 0) {
        if (fragment.elements.length > 0) {
          fragment.alternatives.unshift({
            condition: fragment.condition,
            elements: fragment.elements
          });
          fragment.elements = [];
        }
      }

      delete fragment.currentAlt;
      continue;
    }

    // Match message: Actor -> Server: Message, Actor --> Server: Message, Actor ->> Server: Message
    const messageMatch = line.match(/^(.+?)\s*(-->?|->?>)\s*(.+?):\s*(.+)$/);
    if (messageMatch) {
      const [, from, arrow, to, message] = messageMatch;
      const fromTrimmed = from.trim();
      const toTrimmed = to.trim();

      participants.add(fromTrimmed);
      participants.add(toTrimmed);

      // Determine message type based on arrow
      let messageType = 'sync'; // Default synchronous
      if (arrow === '-->') {
        messageType = 'response';
      } else if (arrow === '->>') {
        messageType = 'async';
      }

      const msg = {
        type: 'message',
        from: fromTrimmed,
        to: toTrimmed,
        message: message.trim(),
        messageType: messageType,
        isSelfMessage: fromTrimmed === toTrimmed
      };

      // Add to current context (fragment or root)
      if (fragmentStack.length > 0) {
        const currentFragment = fragmentStack[fragmentStack.length - 1];
        if (currentFragment.currentAlt) {
          currentFragment.currentAlt.elements.push(msg);
        } else {
          currentFragment.elements.push(msg);
        }
      } else {
        elements.push(msg);
      }
    }
  }

  if (fragmentStack.length > 0) {
    return { error: `Unclosed fragment: '${fragmentStack[fragmentStack.length - 1].kind}' (missing 'end')` };
  }

  return {
    participants: Array.from(participants),
    elements
  };
}
