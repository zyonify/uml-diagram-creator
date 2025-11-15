# UML Diagram Creator

A free, text-based UML diagram creator with export functionality. Create sequence and class diagrams using simple syntax.

## Features

### Core Features
- **Text-based editing** - Write diagrams using simple, intuitive syntax with syntax highlighting
- **Real-time preview** - See your diagram update as you type
- **Multiple diagram types** - Support for sequence and class diagrams
- **Control structures** - Loops, conditionals (if/else), optional flows, and parallel execution in sequence diagrams
- **Line numbers** - Professional code editor with line numbers and dark theme

### Export & Sharing
- **Multiple export formats** - Download as SVG, PNG, PDF, or .uml files
- **Import/Export** - Save and load your diagrams as .uml files
- **Copy as Markdown** - Embed diagrams in documentation with one click
- **Shareable links** - Generate URLs to share diagrams with others
- **Local storage** - Save diagrams in your browser (no account needed)

### Advanced Features
- **Undo/Redo** - Full history support (Ctrl+Z/Ctrl+Y)
- **Color themes** - 6 beautiful color schemes (Default Blue, Purple Dream, Fresh Green, Warm Orange, Dark Mode, Soft Pastel)
- **Zoom controls** - Scale diagrams from 50% to 200%
- **Template library** - 9 example templates to get started quickly
- **Keyboard shortcuts** - Efficient workflow with hotkeys
- **No account required** - Everything runs in your browser, completely private

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Syntax Examples

### Sequence Diagram

```
sequence:
  User -> Server: Login Request
  Server -> Database: Validate Credentials
  Database --> Server: User Data
  Server --> User: Login Success
```

### Sequence Diagram with Conditionals

```
sequence:
  User -> Server: Login
  alt [valid credentials]
    Server -> Database: Get User
    Database --> Server: User Data
    Server --> User: Success
  else [invalid]
    Server --> User: Failed
  end
```

### Sequence Diagram with Loops

```
sequence:
  User -> Server: Get Items
  loop [for each item]
    Server -> Database: Query Item
    Database --> Server: Item Data
  end
  Server --> User: All Items
```

### Class Diagram

```
class:
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
  }
```

## Syntax Guide

### Sequence Diagrams

#### Basic Messages
- Start with `sequence:`
- Use `->` for requests
- Use `-->` for responses
- Format: `From -> To: Message`

#### Control Structures
- **Loop**: `loop [condition]` ... `end`
- **If/Else**: `alt [condition]` ... `else [condition]` ... `end`
- **Optional**: `opt [condition]` ... `end`
- **Parallel**: `par` ... `end`

### Class Diagrams

#### Members
- Start with `class:`
- Use `+` for public members
- Use `-` for private members
- Use `#` for protected members
- Format fields as: `+fieldName: type`
- Format methods as: `+methodName()`

#### Relationships
- **Inheritance**: `ChildClass extends ParentClass` (hollow triangle)
- **Implementation**: `MyClass implements IInterface` (dashed line + hollow triangle)
- **Dependency**: `ClassA uses ClassB` (dashed arrow)
- **Aggregation**: `Container has Item` (hollow diamond - weak ownership)
- **Composition**: `Owner owns Part` (filled diamond - strong ownership)

## Deployment

This app is ready to deploy to Vercel, Netlify, GitHub Pages, Cloudflare Pages, or any static hosting service.

**📖 See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.**

### Quick Deploy to Vercel

```bash
npx vercel
```

The app includes a `vercel.json` configuration file for optimal deployment with proper SPA routing support.

## Tech Stack

- Svelte 5
- Vite
- Vanilla JavaScript
- SVG rendering

## License

MIT
