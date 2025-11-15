<script>
  import { diagramText } from '../stores/diagram.js';

  let value = '';

  // Subscribe to store
  diagramText.subscribe(v => value = v);

  // Update store when text changes
  function handleInput(e) {
    diagramText.set(e.target.value);
  }

  // Example templates
  const examples = {
    sequence: `sequence:
  User -> Server: Login Request
  Server -> Database: Validate Credentials
  Database --> Server: User Data
  Server --> User: Login Success`,
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
    <h3>Editor</h3>
    <div class="examples">
      <button on:click={() => loadExample('sequence')}>Sequence Example</button>
      <button on:click={() => loadExample('class')}>Class Example</button>
    </div>
  </div>
  <textarea
    class="editor"
    bind:value={value}
    on:input={handleInput}
    placeholder="Start typing your UML diagram here...&#10;&#10;Example:&#10;sequence:&#10;  Actor -> Server: Request&#10;  Server --> Actor: Response"
    spellcheck="false"
  ></textarea>
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

  .editor-header h3 {
    margin: 0;
    font-size: 16px;
    color: #333;
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

  .editor {
    flex: 1;
    padding: 15px;
    font-family: 'Courier New', Consolas, monospace;
    font-size: 14px;
    line-height: 1.6;
    border: none;
    outline: none;
    resize: none;
    background: #fafafa;
    color: #333;
  }

  .editor::placeholder {
    color: #999;
  }
</style>
