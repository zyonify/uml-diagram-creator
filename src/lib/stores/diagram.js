import { writable } from 'svelte/store';

// Store for current diagram text
export const diagramText = writable('');

// Store for diagram type ('sequence' or 'class')
export const diagramType = writable('sequence');

// Store for saved diagrams
export const savedDiagrams = writable([]);

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
