# UML Diagram Creator

A free, text-based UML diagram creator with export functionality. Create sequence and class diagrams using simple syntax.

## Features

- **Text-based editing** - Write diagrams using simple, intuitive syntax
- **Real-time preview** - See your diagram update as you type
- **Multiple diagram types** - Support for sequence and class diagrams
- **Export options** - Download diagrams as SVG, PNG, or PDF
- **Local storage** - Save and load diagrams in your browser
- **No account required** - Everything runs in your browser

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

- Start with `sequence:`
- Use `->` for requests
- Use `-->` for responses
- Format: `From -> To: Message`

### Class Diagrams

- Start with `class:`
- Use `+` for public members
- Use `-` for private members
- Use `#` for protected members
- Format fields as: `+fieldName: type`
- Format methods as: `+methodName()`
- Inheritance: `ChildClass extends ParentClass`

## Deployment

This app can be deployed to Vercel, Netlify, or any static hosting service.

### Deploy to Vercel

```bash
npm run build
# Upload the dist folder to Vercel
```

Or use the Vercel CLI:

```bash
npx vercel
```

## Tech Stack

- Svelte 5
- Vite
- Vanilla JavaScript
- SVG rendering

## License

MIT
