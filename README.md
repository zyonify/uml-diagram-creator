# UML Diagram Creator

A free, text-based UML diagram creator with export functionality. Create sequence and class diagrams using simple syntax.

**✨ Now compatible with websequencediagrams.com syntax!**

## Features

### Core Features
- **Text-based editing** - Write diagrams using simple, intuitive syntax with syntax highlighting
- **Real-time preview** - See your diagram update as you type
- **Multiple diagram types** - Support for sequence and class diagrams
- **WebSequenceDiagrams.com compatible** - Use familiar compact syntax (`Alice->Bob:` or `Alice -> Bob:`)
- **Rich sequence features** - Titles, actors, participants, notes, and multiline text support
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

### Basic Sequence Diagram

```
sequence:
  title User Login Flow
  actor User
  participant Server
  participant Database

  User->Server: Login Request
  note over Server: Validates credentials
  Server->Database: Query User
  Database-->Server: User Data
  Server-->User: Login Success
```

### Sequence Diagram with Notes and Actors

```
sequence:
  title Payment Processing
  actor Customer
  participant Shop
  participant PaymentGateway

  Customer->Shop: Checkout
  note left of Customer: Enters card details
  Shop->PaymentGateway: Process Payment
  note over PaymentGateway: Validates card
  PaymentGateway-->Shop: Success
  note right of Shop: Updates inventory
  Shop-->Customer: Order Confirmed
```

### Sequence Diagram with Conditionals

```
sequence:
  title Authentication
  actor User
  participant Server

  User->Server: Login
  alt [valid credentials]
    Server->Database: Get User
    Database-->Server: User Data
    note over User, Server: Session created
    Server-->User: Success
  else [invalid]
    Server-->User: Failed
  end
```

### Sequence Diagram with Loops

```
sequence:
  User->Server: Get Items
  loop [for each item]
    Server->Database: Query Item
    Database-->Server: Item Data
  end
  Server-->User: All Items
```

### Class Diagram

```
class:
  Shape {
    #color: string
    #x: int
    #y: int
    +draw()
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
  }
  Window owns Canvas {
    +title: string
    +show()
  }
```

Shows: inheritance (extends), aggregation (has), composition (owns), and all visibility modifiers (+, -, #).

## Syntax Guide

### Sequence Diagrams

**Compatible with websequencediagrams.com syntax**

#### Basic Structure
- Start with `sequence:`
- **Title**: `title My Diagram` - Add a title to your diagram
- **Participants**:
  - `participant Name` - Declare a participant (shown as a box)
  - `actor Name` - Declare an actor (shown as a stick figure)
- **Comments**: Lines starting with `//` or `#` are ignored

#### Messages (UML 2.5 Standard)
- **Synchronous call** `->` = Solid line with filled arrowhead (caller waits)
- **Asynchronous call** `->>` = Solid line with open arrowhead (caller doesn't wait)
- **Return/Response** `-->` = Dashed line with open arrowhead (returning data)
- **Format**: Both compact `Alice->Bob:Message` and spaced `Alice -> Bob: Message` work

Example:
```
sequence:
  title My System
  actor User
  participant Server

  User->Server: Login Request (compact syntax)
  Server --> User: Success Response (spaced syntax)
```

#### Notes
- `note left of Actor: Text` - Note to the left
- `note right of Actor: Text` - Note to the right
- `note over Actor: Text` - Note over a participant
- `note over A, B: Text` - Note spanning multiple participants

#### Multiline Text
Use `\n` in any text (messages, notes, titles) to create line breaks:
```
title My Diagram\nWith Multiple Lines
User->Server: Send\nMultiline\nMessage
note over User: This is\na multiline\nnote
```

#### Control Structures
- **Loop**: `loop [condition]` ... `end` - Iteration
- **If/Else**: `alt [condition]` ... `else [condition]` ... `end` - Conditionals
- **Optional**: `opt [condition]` ... `end` - Optional flow
- **Parallel**: `par` ... `end` - Concurrent execution
- **Break**: `break [condition]` ... `end` - Exception/exit
- **Critical**: `critical [condition]` ... `end` - Atomic region

### Class Diagrams

#### Members
- Start with `class:`
- Use `+` for public members
- Use `-` for private members
- Use `#` for protected members
- Format fields as: `+fieldName: type`
- Format methods as: `+methodName()`

#### Relationships (UML 2.5 Standard)

**Solid Lines:**
- **Inheritance**: `ChildClass extends ParentClass` → Solid line with hollow triangle
- **Aggregation**: `Container has Item` → Solid line with hollow diamond (weak "has-a")
- **Composition**: `Owner owns Part` → Solid line with filled diamond (strong "owns-a")

**Dashed Lines:**
- **Implementation**: `MyClass implements IInterface` → Dashed line with hollow triangle
- **Dependency**: `ClassA uses ClassB` → Dashed arrow (temporary usage)

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
