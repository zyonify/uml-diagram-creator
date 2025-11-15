import { writable } from 'svelte/store';

// Available aspect ratios
export const aspectRatios = {
  auto: { name: 'Auto (Free)', ratio: null },
  '16:9': { name: '16:9 (Slides)', ratio: 16/9 },
  '4:3': { name: '4:3 (Presentation)', ratio: 4/3 },
  'a4-portrait': { name: 'A4 Portrait', ratio: 1/1.414 },
  'a4-landscape': { name: 'A4 Landscape', ratio: 1.414 },
  'square': { name: 'Square (1:1)', ratio: 1 }
};

// Current aspect ratio
export const currentAspectRatio = writable('auto');

// Get aspect ratio value
export function getAspectRatio(ratioName) {
  return aspectRatios[ratioName] || aspectRatios.auto;
}

// Apply aspect ratio to dimensions
export function applyAspectRatio(width, height, ratioName) {
  const aspectRatio = getAspectRatio(ratioName);

  if (!aspectRatio.ratio) {
    // Auto mode - use natural dimensions
    return { width, height };
  }

  const currentRatio = width / height;

  if (currentRatio > aspectRatio.ratio) {
    // Too wide, constrain width
    return {
      width: Math.round(height * aspectRatio.ratio),
      height
    };
  } else {
    // Too tall, constrain height
    return {
      width,
      height: Math.round(width / aspectRatio.ratio)
    };
  }
}
