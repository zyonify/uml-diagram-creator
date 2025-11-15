<script>
  import { exportAsSVG, exportAsPNG, exportAsPDF } from '../utils/export.js';
  import { exportAsUML, importUML, exportAsMarkdown, copyToClipboard, generateShareableLink } from '../utils/fileOperations.js';
  import { saveDiagram, diagramText } from '../stores/diagram.js';
  import Legend from './Legend.svelte';
  import { onMount } from 'svelte';

  export let getSVG;
  export let diagramType;

  let currentText = '';
  diagramText.subscribe(v => currentText = v);

  let showSaveDialog = false;
  let diagramName = '';
  let showLegend = false;

  // Listen for keyboard shortcut save event
  onMount(() => {
    const handleSaveShortcut = () => {
      handleSave();
    };
    window.addEventListener('save-diagram', handleSaveShortcut);
    return () => window.removeEventListener('save-diagram', handleSaveShortcut);
  });

  function handleExport(format) {
    const svg = getSVG();
    if (!svg) {
      alert('No diagram to export. Please create a diagram first.');
      return;
    }

    const filename = `diagram-${Date.now()}`;

    switch(format) {
      case 'svg':
        exportAsSVG(svg, filename + '.svg');
        break;
      case 'png':
        exportAsPNG(svg, filename + '.png');
        break;
      case 'pdf':
        exportAsPDF(svg, filename + '.pdf');
        break;
    }
  }

  function handleNew() {
    if (confirm('Clear current diagram? (Unsaved changes will be lost)')) {
      diagramText.set('');
    }
  }

  function handleImport() {
    importUML((text, filename) => {
      if (confirm(`Load diagram from "${filename}"? Current diagram will be replaced.`)) {
        diagramText.set(text);
      }
    });
  }

  function handleExportUML() {
    const text = document.querySelector('.editor')?.value || '';
    if (!text.trim()) {
      alert('No diagram to export');
      return;
    }
    const filename = `diagram-${Date.now()}.uml`;
    exportAsUML(text, filename);
  }

  async function handleCopyMarkdown() {
    const svg = getSVG();
    const text = document.querySelector('.editor')?.value || '';

    if (!svg || !text.trim()) {
      alert('No diagram to copy');
      return;
    }

    const markdown = exportAsMarkdown(svg, text);
    const success = await copyToClipboard(markdown);

    if (success) {
      alert('Diagram copied as Markdown!');
    } else {
      alert('Failed to copy to clipboard');
    }
  }

  async function handleShare() {
    const text = document.querySelector('.editor')?.value || '';
    if (!text.trim()) {
      alert('No diagram to share');
      return;
    }

    const link = generateShareableLink(text);
    const success = await copyToClipboard(link);

    if (success) {
      alert('Shareable link copied to clipboard!\n\nAnyone with this link can view your diagram.');
    } else {
      alert('Failed to copy link to clipboard');
    }
  }

  function handleSave() {
    showSaveDialog = true;
  }

  function confirmSave() {
    if (!diagramName.trim()) {
      alert('Please enter a diagram name');
      return;
    }

    const svg = getSVG();
    if (!svg) {
      alert('No diagram to save');
      return;
    }

    // Get current text from textarea
    const text = document.querySelector('.editor')?.value || '';
    saveDiagram(diagramName, diagramType, text);

    showSaveDialog = false;
    diagramName = '';
    alert('Diagram saved successfully!');
  }

  function cancelSave() {
    showSaveDialog = false;
    diagramName = '';
  }

  // Handle Enter key in save dialog
  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      confirmSave();
    } else if (e.key === 'Escape') {
      cancelSave();
    }
  }

  function openLegend() {
    showLegend = true;
  }
</script>

<div class="toolbar">
  <div class="toolbar-section">
    <h2>UML Diagram Creator</h2>
  </div>

  <div class="toolbar-section">
    <button class="toolbar-btn" on:click={handleNew} title="Clear diagram">
      📄 New
    </button>

    <button class="toolbar-btn" on:click={handleImport} title="Import .uml file">
      📂 Import
    </button>

    <button class="toolbar-btn" on:click={handleSave} title="Save to browser (Ctrl+S)">
      💾 Save
    </button>

    <div class="export-group">
      <span class="export-label">Export:</span>
      <button class="toolbar-btn export-btn" on:click={handleExportUML} title="Export as .uml file">
        UML
      </button>
      <button class="toolbar-btn export-btn" on:click={() => handleExport('svg')} title="Export as SVG">
        SVG
      </button>
      <button class="toolbar-btn export-btn" on:click={() => handleExport('png')} title="Export as PNG">
        PNG
      </button>
      <button class="toolbar-btn export-btn" on:click={() => handleExport('pdf')} title="Export as PDF">
        PDF
      </button>
    </div>

    <div class="share-group">
      <button class="toolbar-btn" on:click={handleCopyMarkdown} title="Copy as Markdown">
        📋 MD
      </button>
      <button class="toolbar-btn" on:click={handleShare} title="Generate shareable link">
        🔗 Share
      </button>
    </div>

    <button class="toolbar-btn help-btn" on:click={openLegend} title="Syntax Guide">
      ❓ Legend
    </button>
  </div>
</div>

{#if showSaveDialog}
  <div class="modal-overlay" on:click={cancelSave}>
    <div class="modal" on:click|stopPropagation on:keydown={handleKeyDown}>
      <h3>Save Diagram</h3>
      <input
        type="text"
        bind:value={diagramName}
        placeholder="Enter diagram name"
        class="name-input"
        autofocus
      />
      <div class="modal-hint">Press Enter to save, Esc to cancel</div>
      <div class="modal-actions">
        <button class="btn-cancel" on:click={cancelSave}>Cancel</button>
        <button class="btn-save" on:click={confirmSave}>Save</button>
      </div>
    </div>
  </div>
{/if}

<Legend bind:showLegend />

<style>
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }

  .toolbar-section {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }

  .toolbar-btn {
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
  }

  .toolbar-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  .export-group {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-left: 15px;
    border-left: 1px solid rgba(255, 255, 255, 0.2);
  }

  .export-label {
    font-size: 14px;
    opacity: 0.9;
  }

  .export-btn {
    padding: 6px 12px;
    font-size: 13px;
  }

  .share-group {
    display: flex;
    gap: 8px;
    padding-left: 15px;
    border-left: 1px solid rgba(255, 255, 255, 0.2);
  }

  .help-btn {
    margin-left: 15px;
    padding-left: 15px;
    border-left: 1px solid rgba(255, 255, 255, 0.2);
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background: white;
    padding: 25px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    min-width: 350px;
  }

  .modal h3 {
    margin: 0 0 20px 0;
    color: #333;
    font-size: 18px;
  }

  .name-input {
    width: 100%;
    padding: 10px;
    border: 2px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    margin-bottom: 20px;
    box-sizing: border-box;
  }

  .name-input:focus {
    outline: none;
    border-color: #667eea;
  }

  .modal-hint {
    font-size: 12px;
    color: #666;
    margin-bottom: 15px;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .btn-cancel, .btn-save {
    padding: 8px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  }

  .btn-cancel {
    background: #e0e0e0;
    color: #333;
  }

  .btn-cancel:hover {
    background: #d0d0d0;
  }

  .btn-save {
    background: #667eea;
    color: white;
  }

  .btn-save:hover {
    background: #5568d3;
  }
</style>
