<script>
  import { onMount } from 'svelte';
  import Toolbar from './lib/components/Toolbar.svelte';
  import Editor from './lib/components/Editor.svelte';
  import Preview from './lib/components/Preview.svelte';
  import { diagramType, loadDiagrams } from './lib/stores/diagram.js';

  let previewComponent;
  let currentDiagramType = 'sequence';

  diagramType.subscribe(v => currentDiagramType = v);

  onMount(() => {
    loadDiagrams();
  });

  function getSVG() {
    return previewComponent?.getSVG() || '';
  }
</script>

<main>
  <Toolbar getSVG={getSVG} diagramType={currentDiagramType} />

  <div class="workspace">
    <div class="editor-pane">
      <Editor />
    </div>
    <div class="preview-pane">
      <Preview bind:this={previewComponent} />
    </div>
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    overflow: hidden;
  }

  main {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f0f0f0;
  }

  .workspace {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    overflow: hidden;
  }

  .editor-pane, .preview-pane {
    overflow: hidden;
  }

  @media (max-width: 768px) {
    .workspace {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr 1fr;
    }
  }
</style>
