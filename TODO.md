# UML Diagram Creator - TODO

## ✅ Completed
- [x] Initialize Svelte + Vite project
- [x] Install dependencies
- [x] Set up project structure
- [x] Create basic UI layout (editor + preview split view)
- [x] Implement text editor component
- [x] Create UML parser for sequence diagrams
- [x] Create UML parser for class diagrams
- [x] Implement SVG renderer for sequence diagrams
- [x] Implement SVG renderer for class diagrams
- [x] Add SVG export functionality
- [x] Add PNG export functionality
- [x] Add PDF export functionality
- [x] Implement localStorage save/load
- [x] Add live preview (auto-update on text change)
- [x] Add error handling and validation
- [x] Add example templates/snippets
- [x] Responsive design for mobile
- [x] Create Vercel deployment config

### Editor Improvements (v1.1)
- [x] Add line numbers to editor
- [x] Implement syntax highlighting with VS Code-like dark theme
- [x] Add keyboard shortcuts (Tab for indent, Ctrl+S for save)
- [x] Add "New" button to clear diagram
- [x] Add tooltips for all buttons
- [x] Improve editor styling with dark theme

### Preview Improvements (v1.1)
- [x] Add zoom controls (zoom in/out/reset)
- [x] Add status bar showing line count and element count
- [x] Improve error messages with helpful examples
- [x] Add visual feedback for valid diagrams
- [x] Better empty state with icon

### Control Structures (v1.2)
- [x] Add support for loops in sequence diagrams (`loop [condition]` ... `end`)
- [x] Add support for if/else conditionals (`alt [condition]` ... `else` ... `end`)
- [x] Add support for optional flows (`opt [condition]` ... `end`)
- [x] Add support for parallel execution (`par` ... `end`)
- [x] Render fragments with proper UML boxes and labels
- [x] Syntax highlighting for control structure keywords
- [x] Update examples to showcase control structures
- [x] Nested control structures support

### Premium Features (v1.3) - Compete with Paid Tools!
- [x] **Undo/Redo** - Full history (100 levels), Ctrl+Z/Ctrl+Y, debounced updates
- [x] **Import/Export .uml files** - Save and load diagrams as portable text files
- [x] **Copy as Markdown** - Embed diagrams in docs with base64 SVG
- [x] **Shareable links** - Generate URLs with encoded diagrams
- [x] **Load from URL** - Auto-load diagrams on startup from URL params
- [x] **6 Color themes** - Blue, Purple, Green, Orange, Dark Mode, Pastel
- [x] **Theme selector** - Live theme switching in preview
- [x] **9 Example templates** - Organized dropdown (6 sequence + 3 class)
- [x] **Undo/Redo UI** - Visual buttons with disabled states
- [x] **File operations module** - Centralized import/export utilities
- [x] **Theme system** - SVG recoloring with theme store

## 📋 TODO

### Phase 3: Storage & UX
- [ ] Create project management UI (list, delete diagrams)
- [ ] Add saved diagrams sidebar/panel

### Phase 4: Polish & Deploy
- [ ] Add dark/light theme toggle
- [ ] Performance optimization
- [ ] Deploy to Vercel
- [ ] Add documentation/help section
- [ ] Add custom icon/favicon

## 🐛 Known Issues
- None yet

## 💡 Future Ideas
- Collaboration features
- More diagram types (activity, state, etc.)
- Import from PlantUML/Mermaid syntax
- Cloud storage integration
