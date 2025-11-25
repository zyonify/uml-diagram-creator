/**
 * Parse sequence diagram syntax with control structures
 * Format (compatible with websequencediagrams.com):
 * sequence:
 *   title My Diagram Title
 *   participant Alice
 *   actor Bob
 *   Alice->Server: Synchronous Request (compact syntax)
 *   Alice ->> Server: Asynchronous Request (spaced syntax)
 *   Server -> Server: Self Message
 *   note left of Alice: Note text
 *   note over Alice, Bob: Multi-participant note
 *   loop [condition]
 *     Server -> Database: Query
 *   end
 *   Server --> Alice: Response
 *
 * Supported operators: loop, alt/else, opt, par, break, strict, seq, critical
 */

export function parseSequenceDiagram(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('//') && !line.startsWith('#'));

  if (!lines[0] || !lines[0].toLowerCase().startsWith('sequence:')) {
    return { error: 'Diagram must start with "sequence:"' };
  }

  const participants = new Map(); // Map of name -> type (participant, actor, etc.)
  const elements = []; // Can be messages, notes, or fragments
  const fragmentStack = []; // Stack to track nested fragments
  let title = null;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // Check for title
    const titleMatch = line.match(/^title\s+(.+)$/i);
    if (titleMatch) {
      title = titleMatch[1].replace(/\\n/g, '\n');
      continue;
    }

    // Check for participant declarations
    const participantMatch = line.match(/^(participant|actor|boundary|control|entity|database)\s+(.+)$/i);
    if (participantMatch) {
      const type = participantMatch[1].toLowerCase();
      const name = participantMatch[2].trim();
      participants.set(name, type);
      continue;
    }

    // Check for notes
    const noteOverMatch = line.match(/^note\s+over\s+(.+?):\s*(.+)$/i);
    if (noteOverMatch) {
      const participantList = noteOverMatch[1].split(',').map(p => p.trim());
      const noteText = noteOverMatch[2].replace(/\\n/g, '\n');

      // Add participants if not already declared
      participantList.forEach(p => {
        if (!participants.has(p)) {
          participants.set(p, 'participant');
        }
      });

      const note = {
        type: 'note',
        position: 'over',
        participants: participantList,
        text: noteText
      };

      // Add to current context (fragment or root)
      if (fragmentStack.length > 0) {
        const currentFragment = fragmentStack[fragmentStack.length - 1];
        if (currentFragment.currentAlt) {
          currentFragment.currentAlt.elements.push(note);
        } else {
          currentFragment.elements.push(note);
        }
      } else {
        elements.push(note);
      }
      continue;
    }

    const notePositionMatch = line.match(/^note\s+(left|right)\s+of\s+(.+?):\s*(.+)$/i);
    if (notePositionMatch) {
      const position = notePositionMatch[1].toLowerCase();
      const participant = notePositionMatch[2].trim();
      const noteText = notePositionMatch[3].replace(/\\n/g, '\n');

      // Add participant if not already declared
      if (!participants.has(participant)) {
        participants.set(participant, 'participant');
      }

      const note = {
        type: 'note',
        position: position,
        participants: [participant],
        text: noteText
      };

      // Add to current context (fragment or root)
      if (fragmentStack.length > 0) {
        const currentFragment = fragmentStack[fragmentStack.length - 1];
        if (currentFragment.currentAlt) {
          currentFragment.currentAlt.elements.push(note);
        } else {
          currentFragment.elements.push(note);
        }
      } else {
        elements.push(note);
      }
      continue;
    }

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

    // Match message: Actor->Server:Message (compact) or Actor -> Server: Message (spaced)
    // Support both websequencediagrams.com compact syntax and spaced syntax
    const messageMatch = line.match(/^(.+?)\s*(--?>|->?>|<<--?|<--?)\s*(.+?):\s*(.+)$/);
    if (messageMatch) {
      const [, from, arrow, to, message] = messageMatch;
      const fromTrimmed = from.trim();
      const toTrimmed = to.trim();

      // Add participants if not already declared
      if (!participants.has(fromTrimmed)) {
        participants.set(fromTrimmed, 'participant');
      }
      if (!participants.has(toTrimmed)) {
        participants.set(toTrimmed, 'participant');
      }

      // Determine message type based on arrow
      let messageType = 'sync'; // Default synchronous
      if (arrow === '-->' || arrow === '<--') {
        messageType = 'response';
      } else if (arrow === '->>' || arrow === '<<--') {
        messageType = 'async';
      }

      const msg = {
        type: 'message',
        from: fromTrimmed,
        to: toTrimmed,
        message: message.trim().replace(/\\n/g, '\n'),
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

  // Convert participants Map to array with type info
  const participantList = Array.from(participants.entries()).map(([name, type]) => ({
    name,
    type
  }));

  return {
    title,
    participants: participantList,
    elements
  };
}
