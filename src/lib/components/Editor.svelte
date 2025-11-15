<script>
  import { diagramText, updateHistory, undo, redo, canUndo, canRedo } from '../stores/diagram.js';
  import { onMount } from 'svelte';

  let value = '';
  let textareaElement;
  let lineNumbersElement;
  let highlightedElement;
  let canUndoValue = false;
  let canRedoValue = false;
  let inputTimeout;

  // Subscribe to stores
  diagramText.subscribe(v => {
    value = v;
    updateLineNumbers();
    updateSyntaxHighlight();
  });

  canUndo.subscribe(v => canUndoValue = v);
  canRedo.subscribe(v => canRedoValue = v);

  // Update store when text changes with debounced history
  function handleInput(e) {
    diagramText.set(e.target.value);

    // Debounce history updates (500ms)
    clearTimeout(inputTimeout);
    inputTimeout = setTimeout(() => {
      updateHistory(e.target.value);
    }, 500);
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
      window.dispatchEvent(new CustomEvent('save-diagram'));
    }

    // Ctrl/Cmd + Z - Undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
    }

    // Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z - Redo
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      redo();
    }

    // Ctrl/Cmd + F - Find (to be implemented)
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('find-in-editor'));
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
      // Highlight class relationships
      .replace(/\b(extends|implements|uses|has|owns)\b/g, '<span class="keyword">$1</span>')
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
    Server -> Database: Validate
    Database --> Server: Valid
    Server --> User: Success Response
  else [invalid credentials]
    Server --> User: Error Response
  end`,
    sequenceLoop: `sequence:
  Client -> API: Request Data
  loop [for each page]
    API -> Database: Query Page
    Database --> API: Page Results
  end
  API --> Client: Complete Dataset`,
    class: `class:
  Shape {
    #color: string
    #x: int
    #y: int
    +draw()
    +move()
    +getArea()
  }
  Circle extends Shape {
    -radius: double
    +draw()
    +getArea()
  }
  Rectangle extends Shape {
    -width: double
    -height: double
    +draw()
    +getArea()
  }
  Canvas has Shape {
    +shapes: List
    +addShape()
    +render()
  }
  Window owns Canvas {
    +title: string
    +show()
    +close()
  }`,
    classRelationships: `class:
  IRepository {
    +save()
    +find()
  }
  UserRepository implements IRepository {
    -connection: Database
    +save()
    +find()
  }
  UserService uses UserRepository {
    +createUser()
    +getUser()
  }
  Department has Employee {
    +name: string
    +addEmployee()
  }
  Car owns Engine {
    +model: string
    +start()
  }
  Employee {
    +id: string
    +name: string
  }
  Engine {
    +cylinders: int
    +run()
  }
  Database {
    +query()
  }`,
    allFeatures: `sequence:
  User -> App: Request Order
  App -> Auth: Check Credentials

  alt [authenticated]
    Auth --> App: Token Valid
    App -> OrderService: Create Order

    loop [for each item in cart]
      OrderService -> Inventory: Check Stock
      Inventory --> OrderService: Available
    end

    alt [all items available]
      OrderService -> Payment: Process

      opt [has discount code]
        Payment -> Promo: Validate Code
        Promo --> Payment: Discount Applied
      end

      alt [payment approved]
        Payment --> OrderService: Success

        par [parallel notifications]
          OrderService -> Email: Send Receipt
          OrderService -> SMS: Send Tracking
        end

        OrderService -> Database: Save Order
        Database --> OrderService: Order ID
        OrderService --> App: Order Complete
      else [payment declined]
        Payment --> OrderService: Failed
        OrderService --> App: Payment Error
      end
    else [items unavailable]
      OrderService --> App: Out of Stock
    end
  else [not authenticated]
    Auth --> App: Invalid Token
    App --> User: Please Login
  end

  App --> User: Final Response`
  };

  export function loadExample(type) {
    diagramText.set(examples[type]);
  }
</script>

<div class="editor-container">
  <div class="editor-header">
    <div class="header-left">
      <h3>Editor</h3>
      <span class="shortcut-hint">Ctrl+Z undo • Ctrl+Y redo • Ctrl+S save</span>
    </div>
    <div class="editor-actions">
      <div class="undo-redo">
        <button
          class="icon-btn"
          on:click={undo}
          disabled={!canUndoValue}
          title="Undo (Ctrl+Z)"
        >↶</button>
        <button
          class="icon-btn"
          on:click={redo}
          disabled={!canRedoValue}
          title="Redo (Ctrl+Y)"
        >↷</button>
      </div>
      <div class="examples">
        <button class="all-features-btn" on:click={() => loadExample('allFeatures')}>All Features</button>
        <button on:click={() => loadExample('sequence')}>If/Else</button>
        <button on:click={() => loadExample('sequenceLoop')}>Loop</button>
        <button on:click={() => loadExample('class')}>Class</button>
      </div>
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

  .editor-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .undo-redo {
    display: flex;
    gap: 4px;
    padding-right: 12px;
    border-right: 1px solid #ddd;
  }

  .icon-btn {
    width: 32px;
    height: 32px;
    padding: 0;
    font-size: 20px;
    background: white;
    color: #666;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-btn:hover:not(:disabled) {
    background: #f5f5f5;
    color: #333;
    border-color: #999;
  }

  .icon-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
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

  .examples .all-features-btn {
    background: #9C27B0;
    font-weight: 600;
    padding: 6px 14px;
  }

  .examples .all-features-btn:hover {
    background: #7B1FA2;
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
