import { writable } from 'svelte/store';

// Store for current diagram text
export const diagramText = writable('');

// Store for diagram type ('sequence' or 'class')
export const diagramType = writable('sequence');

// Store for saved diagrams
export const savedDiagrams = writable([]);

// Undo/Redo functionality
const MAX_HISTORY = 100;
let history = [''];
let historyIndex = 0;
let isUndoRedo = false;

export const canUndo = writable(false);
export const canRedo = writable(false);

export function updateHistory(text) {
  if (isUndoRedo) return;

  // Remove any future history if we're not at the end
  if (historyIndex < history.length - 1) {
    history = history.slice(0, historyIndex + 1);
  }

  // Add to history
  history.push(text);

  // Limit history size
  if (history.length > MAX_HISTORY) {
    history.shift();
  } else {
    historyIndex++;
  }

  updateUndoRedoStates();
}

export function undo() {
  if (historyIndex > 0) {
    isUndoRedo = true;
    historyIndex--;
    diagramText.set(history[historyIndex]);
    updateUndoRedoStates();
    setTimeout(() => { isUndoRedo = false; }, 0);
  }
}

export function redo() {
  if (historyIndex < history.length - 1) {
    isUndoRedo = true;
    historyIndex++;
    diagramText.set(history[historyIndex]);
    updateUndoRedoStates();
    setTimeout(() => { isUndoRedo = false; }, 0);
  }
}

function updateUndoRedoStates() {
  canUndo.set(historyIndex > 0);
  canRedo.set(historyIndex < history.length - 1);
}

// Load saved diagrams from localStorage
export function loadDiagrams() {
  try {
    const saved = localStorage.getItem('uml-diagrams');
    if (saved) {
      savedDiagrams.set(JSON.parse(saved));
    }
  } catch (error) {
    console.error('Error loading diagrams:', error);
  }
}

// Save diagram to localStorage
export function saveDiagram(name, type, text) {
  savedDiagrams.update(diagrams => {
    const newDiagram = {
      id: Date.now(),
      name,
      type,
      text,
      createdAt: new Date().toISOString()
    };
    const updated = [...diagrams, newDiagram];
    localStorage.setItem('uml-diagrams', JSON.stringify(updated));
    return updated;
  });
}

// Delete diagram
export function deleteDiagram(id) {
  savedDiagrams.update(diagrams => {
    const updated = diagrams.filter(d => d.id !== id);
    localStorage.setItem('uml-diagrams', JSON.stringify(updated));
    return updated;
  });
}
