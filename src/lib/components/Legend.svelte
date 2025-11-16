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

          <h4>Message Types (UML 2.5 Standard)</h4>
          <ul>
            <li><strong>Synchronous call</strong> <code>-&gt;</code> = Solid line with filled arrowhead (caller waits for response)</li>
            <li><strong>Asynchronous call</strong> <code>-&gt;&gt;</code> = Solid line with open arrowhead (caller doesn't wait)</li>
            <li><strong>Return/Response</strong> <code>--&gt;</code> = Dashed line with open arrowhead (returning data)</li>
            <li><strong>Self-message</strong> <code>A -&gt; A: Message</code> = Message to same participant (loops back)</li>
          </ul>

          <div class="example">
            <strong>Example:</strong>
            <pre>sequence:
  Client -> Server: Sync Request
  Client ->> Queue: Async Message
  Server -> Server: Process Data
  Server --> Client: Response</pre>
          </div>

          <h4>Control Structures (Combined Fragments)</h4>
          <ul>
            <li><strong>Loop</strong>: <code>loop [condition]</code> ... <code>end</code> - Iteration/repetition</li>
            <li><strong>Alternative</strong>: <code>alt [condition]</code> ... <code>else [condition]</code> ... <code>end</code> - Conditionals</li>
            <li><strong>Optional</strong>: <code>opt [condition]</code> ... <code>end</code> - Optional flow</li>
            <li><strong>Parallel</strong>: <code>par</code> ... <code>end</code> - Concurrent execution</li>
            <li><strong>Break</strong>: <code>break [condition]</code> ... <code>end</code> - Exception/exit from enclosing fragment</li>
            <li><strong>Critical</strong>: <code>critical [condition]</code> ... <code>end</code> - Atomic region (no interleaving)</li>
            <li><strong>Strict</strong>: <code>strict</code> ... <code>end</code> - Strict sequential ordering</li>
            <li><strong>Sequence</strong>: <code>seq</code> ... <code>end</code> - Weak sequencing</li>
          </ul>

          <div class="example">
            <strong>Example:</strong>
            <pre>sequence:
  User -> Server: Login
  alt [valid credentials]
    Server --> User: Success
  else [invalid]
    Server --> User: Failed
    break [too many attempts]
      Server -> Server: Block Account
    end
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
    +PublicField: string
    -PrivateField: int
    #ProtectedField: bool
    +PublicMethod()
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
    +Draw()
  }
  Circle extends Shape {
    +Draw()
  }
  Canvas has Shape {
    +Shapes: List<Shape>
  }
  Window owns Canvas {
    +Canvas: Canvas
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
