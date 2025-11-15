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
  let zoom = 100;
  let lineCount = 0;
  let elementCount = 0;

  // Subscribe to stores
  diagramType.subscribe(v => currentType = v);
  diagramText.subscribe(v => {
    currentText = v;
    lineCount = v.split('\n').length;
    updatePreview();
  });

  function updatePreview() {
    if (!currentText.trim()) {
      svgContent = '';
      error = '';
      elementCount = 0;
      return;
    }

    try {
      // Detect diagram type from text
      if (currentText.trim().toLowerCase().startsWith('sequence:')) {
        currentType = 'sequence';
        const parsed = parseSequenceDiagram(currentText);
        if (parsed.error) {
          error = getHelpfulError(parsed.error, 'sequence');
          svgContent = '';
          elementCount = 0;
        } else {
          const result = renderSequenceDiagram(parsed);
          if (result.error) {
            error = getHelpfulError(result.error, 'sequence');
            svgContent = '';
            elementCount = 0;
          } else {
            svgContent = result.svg;
            error = '';
            elementCount = parsed.messages?.length || 0;
          }
        }
      } else if (currentText.trim().toLowerCase().startsWith('class:')) {
        currentType = 'class';
        const parsed = parseClassDiagram(currentText);
        if (parsed.error) {
          error = getHelpfulError(parsed.error, 'class');
          svgContent = '';
          elementCount = 0;
        } else {
          const result = renderClassDiagram(parsed);
          if (result.error) {
            error = getHelpfulError(result.error, 'class');
            svgContent = '';
            elementCount = 0;
          } else {
            svgContent = result.svg;
            error = '';
            elementCount = parsed.classes?.length || 0;
          }
        }
      } else {
        error = getHelpfulError('Diagram must start with "sequence:" or "class:"', 'general');
        svgContent = '';
        elementCount = 0;
      }

      // Update diagram type store
      diagramType.set(currentType);
    } catch (e) {
      error = 'Error rendering diagram: ' + e.message;
      svgContent = '';
      elementCount = 0;
    }
  }

  function getHelpfulError(errorMsg, type) {
    let helpText = errorMsg;

    if (type === 'sequence') {
      helpText += '\n\nExample:\nsequence:\n  Actor -> Server: Message\n  Server --> Actor: Response';
    } else if (type === 'class') {
      helpText += '\n\nExample:\nclass:\n  ClassName {\n    +field: type\n    +method()\n  }';
    } else {
      helpText += '\n\nStart your diagram with either "sequence:" or "class:"';
    }

    return helpText;
  }

  function zoomIn() {
    zoom = Math.min(zoom + 10, 200);
  }

  function zoomOut() {
    zoom = Math.max(zoom - 10, 50);
  }

  function resetZoom() {
    zoom = 100;
  }

  export function getSVG() {
    return svgContent;
  }
</script>

<div class="preview-container">
  <div class="preview-header">
    <h3>Preview</h3>
    <div class="header-controls">
      {#if svgContent}
        <div class="zoom-controls">
          <button class="zoom-btn" on:click={zoomOut} title="Zoom out">−</button>
          <span class="zoom-level">{zoom}%</span>
          <button class="zoom-btn" on:click={zoomIn} title="Zoom in">+</button>
          <button class="zoom-btn reset" on:click={resetZoom} title="Reset zoom">⟲</button>
        </div>
      {/if}
      <span class="diagram-type">{currentType === 'sequence' ? 'Sequence Diagram' : 'Class Diagram'}</span>
    </div>
  </div>
  <div class="preview-content">
    {#if error}
      <div class="error">
        <div class="error-title">⚠️ Error</div>
        <div class="error-message">{error}</div>
      </div>
    {:else if svgContent}
      <div class="svg-wrapper" style="transform: scale({zoom / 100}); transform-origin: top center;">
        {@html svgContent}
      </div>
    {:else}
      <div class="empty-state">
        <div class="empty-icon">📊</div>
        <p>Start typing to see your diagram preview</p>
        <p class="hint">Begin with "sequence:" or "class:"</p>
      </div>
    {/if}
  </div>
  <div class="preview-footer">
    <span class="status-item">Lines: {lineCount}</span>
    {#if svgContent}
      <span class="status-item">
        {currentType === 'sequence' ? 'Messages' : 'Classes'}: {elementCount}
      </span>
      <span class="status-item success">✓ Valid</span>
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

  .header-controls {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .zoom-controls {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #e8e8e8;
    padding: 4px 8px;
    border-radius: 6px;
  }

  .zoom-btn {
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 26px;
    height: 26px;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .zoom-btn:hover {
    background: #f5f5f5;
    border-color: #999;
  }

  .zoom-btn.reset {
    font-size: 14px;
  }

  .zoom-level {
    font-size: 12px;
    color: #666;
    min-width: 40px;
    text-align: center;
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
    border-left: 4px solid #ef5350;
    border-radius: 4px;
    padding: 15px;
    color: #c62828;
  }

  .error-title {
    font-weight: bold;
    font-size: 16px;
    margin-bottom: 10px;
  }

  .error-message {
    font-family: 'Courier New', monospace;
    font-size: 13px;
    white-space: pre-wrap;
    line-height: 1.6;
  }

  .empty-state {
    text-align: center;
    color: #999;
    padding: 80px 20px;
  }

  .empty-icon {
    font-size: 64px;
    margin-bottom: 20px;
    opacity: 0.3;
  }

  .empty-state p {
    margin: 10px 0;
    font-size: 16px;
  }

  .hint {
    font-size: 14px;
    color: #bbb;
  }

  .preview-footer {
    display: flex;
    gap: 15px;
    padding: 8px 15px;
    background: #f9f9f9;
    border-top: 1px solid #ddd;
    font-size: 12px;
    color: #666;
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .status-item.success {
    color: #4caf50;
    font-weight: 500;
  }
</style>
