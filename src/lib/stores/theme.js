import { writable } from 'svelte/store';

// Available themes
export const themes = {
  default: {
    name: 'Default Blue',
    participant: { fill: '#4A90E2', stroke: '#2E5C8A', text: 'white' },
    message: { stroke: '#333', text: '#333' },
    fragment: { stroke: '#666', fill: '#E8EAF6', text: '#333' },
    class: { fill: '#f9f9f9', stroke: '#333', header: '#E8EAF6', text: '#333' }
  },
  purple: {
    name: 'Purple Dream',
    participant: { fill: '#9C27B0', stroke: '#7B1FA2', text: 'white' },
    message: { stroke: '#4A148C', text: '#4A148C' },
    fragment: { stroke: '#7B1FA2', fill: '#F3E5F5', text: '#4A148C' },
    class: { fill: '#fafafa', stroke: '#7B1FA2', header: '#F3E5F5', text: '#4A148C' }
  },
  green: {
    name: 'Fresh Green',
    participant: { fill: '#4CAF50', stroke: '#388E3C', text: 'white' },
    message: { stroke: '#1B5E20', text: '#1B5E20' },
    fragment: { stroke: '#388E3C', fill: '#E8F5E9', text: '#1B5E20' },
    class: { fill: '#fafafa', stroke: '#388E3C', header: '#E8F5E9', text: '#1B5E20' }
  },
  orange: {
    name: 'Warm Orange',
    participant: { fill: '#FF9800', stroke: '#F57C00', text: 'white' },
    message: { stroke: '#E65100', text: '#E65100' },
    fragment: { stroke: '#F57C00', fill: '#FFF3E0', text: '#E65100' },
    class: { fill: '#fafafa', stroke: '#F57C00', header: '#FFF3E0', text: '#E65100' }
  },
  dark: {
    name: 'Dark Mode',
    participant: { fill: '#37474F', stroke: '#263238', text: 'white' },
    message: { stroke: '#CFD8DC', text: '#CFD8DC' },
    fragment: { stroke: '#607D8B', fill: '#455A64', text: '#CFD8DC' },
    class: { fill: '#37474F', stroke: '#CFD8DC', header: '#455A64', text: '#CFD8DC' }
  },
  pastel: {
    name: 'Soft Pastel',
    participant: { fill: '#81D4FA', stroke: '#4FC3F7', text: '#01579B' },
    message: { stroke: '#0277BD', text: '#0277BD' },
    fragment: { stroke: '#4FC3F7', fill: '#E1F5FE', text: '#01579B' },
    class: { fill: '#fafafa', stroke: '#4FC3F7', header: '#E1F5FE', text: '#01579B' }
  }
};

// Current theme
export const currentTheme = writable('default');

// Get theme colors
export function getThemeColors(themeName) {
  return themes[themeName] || themes.default;
}

// Apply theme to renderers (will be used in renderer functions)
export function applyThemeToSVG(svg, themeName) {
  const theme = getThemeColors(themeName);

  return svg
    .replace(/fill: #4A90E2/g, `fill: ${theme.participant.fill}`)
    .replace(/stroke: #2E5C8A/g, `stroke: ${theme.participant.stroke}`)
    .replace(/\.participant-text { fill: white/g, `.participant-text { fill: ${theme.participant.text}`)
    .replace(/\.message-line { stroke: #333/g, `.message-line { stroke: ${theme.message.stroke}`)
    .replace(/\.message-text { fill: #333/g, `.message-text { fill: ${theme.message.text}`)
    .replace(/\.arrow { fill: #333/g, `.arrow { fill: ${theme.message.stroke}`)
    .replace(/\.fragment-box { fill: none; stroke: #666/g, `.fragment-box { fill: none; stroke: ${theme.fragment.stroke}`)
    .replace(/\.fragment-header { fill: #E8EAF6; stroke: #666/g, `.fragment-header { fill: ${theme.fragment.fill}; stroke: ${theme.fragment.stroke}`)
    .replace(/\.fragment-label { fill: #333/g, `.fragment-label { fill: ${theme.fragment.text}`)
    .replace(/\.fragment-condition { fill: #666/g, `.fragment-condition { fill: ${theme.fragment.text}`)
    .replace(/\.class-box { fill: #f9f9f9; stroke: #333/g, `.class-box { fill: ${theme.class.fill}; stroke: ${theme.class.stroke}`)
    .replace(/\.class-header { fill: #E8EAF6; stroke: #333/g, `.class-header { fill: ${theme.class.header}; stroke: ${theme.class.stroke}`)
    .replace(/\.class-name { fill: #333/g, `.class-name { fill: ${theme.class.text}`)
    .replace(/\.class-member { fill: #333/g, `.class-member { fill: ${theme.class.text}`);
}
