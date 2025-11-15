<script>
  export let showLegend = false;

  function closeLegend() {
    showLegend = false;
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      closeLegend();
    }
  }
</script>

{#if showLegend}
  <div class="modal-backdrop" on:click={handleBackdropClick}>
    <div class="modal-content">
      <div class="modal-header">
        <h2>UML Diagram Syntax Guide</h2>
        <button class="close-btn" on:click={closeLegend}>&times;</button>
      </div>
      <div class="modal-body">
        <!-- Sequence Diagrams -->
        <section>
          <h3>Sequence Diagrams</h3>

          <h4>Basic Messages (UML 2.5 Standard)</h4>
          <ul>
            <li><strong>Solid arrow</strong> <code>-&gt;</code> = Synchronous call/request (one object calling another)</li>
            <li><strong>Dotted arrow</strong> <code>--&gt;</code> = Return/response message (returning data or acknowledgment)</li>
          </ul>

          <div class="example">
            <strong>Example:</strong>
            <pre>sequence:
  Client -> Server: Login Request
  Server --> Client: Success Response</pre>
          </div>

          <h4>Control Structures</h4>
          <ul>
            <li><strong>Loop</strong>: <code>loop [condition]</code> ... <code>end</code> - Iteration</li>
            <li><strong>If/Else</strong>: <code>alt [condition]</code> ... <code>else [condition]</code> ... <code>end</code> - Conditionals</li>
            <li><strong>Optional</strong>: <code>opt [condition]</code> ... <code>end</code> - Optional flow</li>
            <li><strong>Parallel</strong>: <code>par</code> ... <code>end</code> - Concurrent execution</li>
          </ul>

          <div class="example">
            <strong>Example:</strong>
            <pre>sequence:
  User -> Server: Login
  alt [valid credentials]
    Server --> User: Success
  else [invalid]
    Server --> User: Failed
  end</pre>
          </div>
        </section>

        <!-- Class Diagrams -->
        <section>
          <h3>Class Diagrams</h3>

          <h4>Visibility Modifiers</h4>
          <ul>
            <li><code>+</code> = Public members</li>
            <li><code>-</code> = Private members</li>
            <li><code>#</code> = Protected members</li>
          </ul>

          <h4>Member Format</h4>
          <ul>
            <li>Fields: <code>+fieldName: type</code></li>
            <li>Methods: <code>+methodName()</code></li>
          </ul>

          <div class="example">
            <strong>Example:</strong>
            <pre>{`class:
  MyClass {
    +publicField: string
    -privateField: int
    #protectedField: bool
    +publicMethod()
  }`}</pre>
          </div>

          <h4>Relationships (UML 2.5 Standard)</h4>

          <p><strong>Solid Lines:</strong></p>
          <ul>
            <li><strong>Inheritance</strong>: <code>ChildClass extends ParentClass</code> → Solid line with hollow triangle</li>
            <li><strong>Aggregation</strong>: <code>Container has Item</code> → Solid line with hollow diamond (weak "has-a")</li>
            <li><strong>Composition</strong>: <code>Owner owns Part</code> → Solid line with filled diamond (strong "owns-a")</li>
          </ul>

          <p><strong>Dashed Lines:</strong></p>
          <ul>
            <li><strong>Implementation</strong>: <code>MyClass implements IInterface</code> → Dashed line with hollow triangle</li>
            <li><strong>Dependency</strong>: <code>ClassA uses ClassB</code> → Dashed arrow (temporary usage)</li>
          </ul>

          <div class="example">
            <strong>Example:</strong>
            <pre>{`class:
  Shape {
    +draw()
  }
  Circle extends Shape {
    +draw()
  }
  Canvas has Shape {
    +shapes: List
  }
  Window owns Canvas {
    +canvas: Canvas
  }`}</pre>
          </div>
        </section>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
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
    padding: 20px;
  }

  .modal-content {
    background: white;
    border-radius: 8px;
    max-width: 800px;
    width: 100%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #ddd;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 24px;
    color: #333;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 32px;
    color: #666;
    cursor: pointer;
    line-height: 1;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s;
  }

  .close-btn:hover {
    color: #333;
  }

  .modal-body {
    padding: 24px;
    overflow-y: auto;
    flex: 1;
  }

  section {
    margin-bottom: 32px;
  }

  section:last-child {
    margin-bottom: 0;
  }

  h3 {
    font-size: 20px;
    color: #333;
    margin: 0 0 16px 0;
    padding-bottom: 8px;
    border-bottom: 2px solid #4A90E2;
  }

  h4 {
    font-size: 16px;
    color: #555;
    margin: 16px 0 8px 0;
  }

  ul {
    margin: 8px 0 16px 0;
    padding-left: 20px;
  }

  li {
    margin: 6px 0;
    color: #333;
    line-height: 1.6;
  }

  code {
    background: #f5f5f5;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    color: #d63384;
  }

  .example {
    background: #f9f9f9;
    border-left: 4px solid #4A90E2;
    padding: 12px 16px;
    margin: 12px 0;
    border-radius: 4px;
  }

  .example strong {
    color: #4A90E2;
    font-size: 14px;
  }

  .example pre {
    margin: 8px 0 0 0;
    padding: 12px;
    background: #1e1e1e;
    color: #d4d4d4;
    border-radius: 4px;
    overflow-x: auto;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.5;
  }

  p {
    margin: 8px 0;
    color: #333;
  }

  p strong {
    color: #555;
  }
</style>
