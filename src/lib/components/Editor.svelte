<script>
  import { diagramText } from '../stores/diagram.js';
  import { onMount } from 'svelte';

  let value = '';
  let textareaElement;
  let lineNumbersElement;
  let highlightedElement;

  // Subscribe to store
  diagramText.subscribe(v => {
    value = v;
    updateLineNumbers();
    updateSyntaxHighlight();
  });

  // Update store when text changes
  function handleInput(e) {
    diagramText.set(e.target.value);
  }

  // Handle keyboard shortcuts
  function handleKeyDown(e) {
    // Tab key - insert spaces instead
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      diagramText.set(newValue);

      // Restore cursor position after Svelte updates
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }

    // Ctrl/Cmd + S - trigger save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      // Dispatch custom event that Toolbar can listen to
      window.dispatchEvent(new CustomEvent('save-diagram'));
    }
  }

  // Handle scroll sync
  function handleScroll(e) {
    if (lineNumbersElement) {
      lineNumbersElement.scrollTop = e.target.scrollTop;
    }
    if (highlightedElement) {
      highlightedElement.scrollTop = e.target.scrollTop;
      highlightedElement.scrollLeft = e.target.scrollLeft;
    }
  }

  // Update line numbers
  function updateLineNumbers() {
    if (!lineNumbersElement) return;
    const lines = value.split('\n').length;
    lineNumbersElement.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
  }

  // Syntax highlighting
  function updateSyntaxHighlight() {
    if (!highlightedElement) return;

    let highlighted = value
      // Escape HTML
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Highlight keywords
      .replace(/^(sequence|class):/gm, '<span class="keyword">$1:</span>')
      // Highlight control structures
      .replace(/^(loop|alt|opt|par|else|end)\b/gm, '<span class="keyword">$1</span>')
      // Highlight extends
      .replace(/\bextends\b/g, '<span class="keyword">extends</span>')
      // Highlight arrows
      .replace(/(--?>|<--?)/g, '<span class="arrow">$1</span>')
      // Highlight conditions in square brackets
      .replace(/\[([^\]]+)\]/g, '<span class="condition">[$1]</span>')
      // Highlight visibility modifiers
      .replace(/^(\s*)([+\-#])/gm, '$1<span class="modifier">$2</span>')
      // Highlight types (but not inside conditions which are already highlighted)
      .replace(/:\s*(\w+)(?![^\<]*\<\/span\>)/g, ': <span class="type">$1</span>')
      // Highlight braces
      .replace(/([{}])/g, '<span class="brace">$1</span>')
      // Highlight comments
      .replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>');

    highlightedElement.innerHTML = highlighted + '\n';
  }

  onMount(() => {
    updateLineNumbers();
    updateSyntaxHighlight();
  });

  // Example templates
  const examples = {
    sequence: `sequence:
  User -> Server: Login Request
  alt [valid credentials]
    Server -> Database: Get User
    Database --> Server: User Data
    Server --> User: Login Success
  else [invalid]
    Server --> User: Login Failed
  end`,
    sequenceLoop: `sequence:
  User -> Server: Get Items
  loop [for each item]
    Server -> Database: Query Item
    Database --> Server: Item Data
  end
  Server --> User: All Items`,
    class: `class:
  User {
    +id: string
    +name: string
    +email: string
    +login()
    +logout()
  }
  Admin extends User {
    +permissions: array
    +manageUsers()
  }`
  };

  export function loadExample(type) {
    diagramText.set(examples[type]);
  }
</script>

<div class="editor-container">
  <div class="editor-header">
    <div class="header-left">
      <h3>Editor</h3>
      <span class="shortcut-hint">Ctrl+S to save • Tab for indent</span>
    </div>
    <div class="examples">
      <button on:click={() => loadExample('sequence')}>If/Else</button>
      <button on:click={() => loadExample('sequenceLoop')}>Loop</button>
      <button on:click={() => loadExample('class')}>Class</button>
    </div>
  </div>
  <div class="editor-wrapper">
    <pre class="line-numbers" bind:this={lineNumbersElement} aria-hidden="true"></pre>
    <pre class="syntax-highlight" bind:this={highlightedElement} aria-hidden="true"></pre>
    <textarea
      class="editor"
      bind:this={textareaElement}
      bind:value={value}
      on:input={handleInput}
      on:keydown={handleKeyDown}
      on:scroll={handleScroll}
      placeholder="Start typing your UML diagram here...&#10;&#10;Example:&#10;sequence:&#10;  Actor -> Server: Request&#10;  Server --> Actor: Response"
      spellcheck="false"
    ></textarea>
  </div>
</div>

<style>
  .editor-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    border-right: 2px solid #ddd;
  }

  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    background: #f5f5f5;
    border-bottom: 1px solid #ddd;
  }

  .header-left {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .editor-header h3 {
    margin: 0;
    font-size: 16px;
    color: #333;
  }

  .shortcut-hint {
    font-size: 11px;
    color: #666;
    font-weight: normal;
  }

  .examples {
    display: flex;
    gap: 8px;
  }

  .examples button {
    padding: 6px 12px;
    font-size: 12px;
    background: #4A90E2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .examples button:hover {
    background: #357ABD;
  }

  .editor-wrapper {
    flex: 1;
    position: relative;
    overflow: hidden;
    background: #1e1e1e;
  }

  .line-numbers {
    position: absolute;
    left: 0;
    top: 0;
    padding: 15px 10px;
    margin: 0;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.6;
    color: #858585;
    background: #2d2d2d;
    text-align: right;
    width: 45px;
    user-select: none;
    overflow: hidden;
    border-right: 1px solid #404040;
  }

  .syntax-highlight {
    position: absolute;
    left: 55px;
    top: 0;
    padding: 15px;
    margin: 0;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.6;
    color: #d4d4d4;
    pointer-events: none;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow: hidden;
  }

  .editor {
    position: absolute;
    left: 55px;
    top: 0;
    right: 0;
    bottom: 0;
    padding: 15px;
    margin: 0;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.6;
    border: none;
    outline: none;
    resize: none;
    background: transparent;
    color: #d4d4d4;
    caret-color: #d4d4d4;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow: auto;
  }

  .editor::placeholder {
    color: #6a6a6a;
  }

  /* Syntax highlighting colors */
  :global(.syntax-highlight .keyword) {
    color: #569cd6;
    font-weight: bold;
  }

  :global(.syntax-highlight .arrow) {
    color: #dcdcaa;
    font-weight: bold;
  }

  :global(.syntax-highlight .modifier) {
    color: #4ec9b0;
  }

  :global(.syntax-highlight .type) {
    color: #4ec9b0;
  }

  :global(.syntax-highlight .brace) {
    color: #ffd700;
  }

  :global(.syntax-highlight .comment) {
    color: #6a9955;
    font-style: italic;
  }

  :global(.syntax-highlight .condition) {
    color: #ce9178;
  }
</style>
