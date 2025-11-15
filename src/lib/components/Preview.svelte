<script>
  import { diagramText, diagramType } from '../stores/diagram.js';
  import { parseSequenceDiagram } from '../parsers/sequence.js';
  import { parseClassDiagram } from '../parsers/class.js';
  import { renderSequenceDiagram } from '../renderers/sequence.js';
  import { renderClassDiagram } from '../renderers/class.js';

  let svgContent = '';
  let error = '';
  let currentType = 'sequence';
  let currentText = '';

  // Subscribe to stores
  diagramType.subscribe(v => currentType = v);
  diagramText.subscribe(v => {
    currentText = v;
    updatePreview();
  });

  function updatePreview() {
    if (!currentText.trim()) {
      svgContent = '';
      error = '';
      return;
    }

    try {
      // Detect diagram type from text
      if (currentText.trim().toLowerCase().startsWith('sequence:')) {
        currentType = 'sequence';
        const parsed = parseSequenceDiagram(currentText);
        if (parsed.error) {
          error = parsed.error;
          svgContent = '';
        } else {
          const result = renderSequenceDiagram(parsed);
          if (result.error) {
            error = result.error;
            svgContent = '';
          } else {
            svgContent = result.svg;
            error = '';
          }
        }
      } else if (currentText.trim().toLowerCase().startsWith('class:')) {
        currentType = 'class';
        const parsed = parseClassDiagram(currentText);
        if (parsed.error) {
          error = parsed.error;
          svgContent = '';
        } else {
          const result = renderClassDiagram(parsed);
          if (result.error) {
            error = result.error;
            svgContent = '';
          } else {
            svgContent = result.svg;
            error = '';
          }
        }
      } else {
        error = 'Diagram must start with "sequence:" or "class:"';
        svgContent = '';
      }

      // Update diagram type store
      diagramType.set(currentType);
    } catch (e) {
      error = 'Error rendering diagram: ' + e.message;
      svgContent = '';
    }
  }

  export function getSVG() {
    return svgContent;
  }
</script>

<div class="preview-container">
  <div class="preview-header">
    <h3>Preview</h3>
    <span class="diagram-type">{currentType === 'sequence' ? 'Sequence Diagram' : 'Class Diagram'}</span>
  </div>
  <div class="preview-content">
    {#if error}
      <div class="error">
        <strong>Error:</strong> {error}
      </div>
    {:else if svgContent}
      <div class="svg-wrapper">
        {@html svgContent}
      </div>
    {:else}
      <div class="empty-state">
        <p>Start typing to see your diagram preview</p>
        <p class="hint">Begin with "sequence:" or "class:"</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .preview-container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    background: #f5f5f5;
    border-bottom: 1px solid #ddd;
  }

  .preview-header h3 {
    margin: 0;
    font-size: 16px;
    color: #333;
  }

  .diagram-type {
    font-size: 12px;
    color: #666;
    background: #e0e0e0;
    padding: 4px 10px;
    border-radius: 12px;
  }

  .preview-content {
    flex: 1;
    overflow: auto;
    padding: 20px;
    background: white;
  }

  .svg-wrapper {
    display: flex;
    justify-content: center;
    align-items: flex-start;
  }

  .error {
    background: #ffebee;
    border: 1px solid #ef5350;
    border-radius: 4px;
    padding: 15px;
    color: #c62828;
  }

  .error strong {
    display: block;
    margin-bottom: 5px;
  }

  .empty-state {
    text-align: center;
    color: #999;
    padding: 60px 20px;
  }

  .empty-state p {
    margin: 10px 0;
  }

  .hint {
    font-size: 14px;
    color: #bbb;
  }
</style>
