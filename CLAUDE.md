# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js-based intelligent resume showcase with AI chat functionality. It combines static resume presentation with dynamic AI interaction capabilities using the Dify Client for conversational AI features.

## Common Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Linting
npm run lint        # Check for lint errors
npm run fix         # Auto-fix lint errors
npm run eslint-fix  # Alternative lint fix

# PDF generation
npm run build:pdf   # Generate resume PDF using Puppeteer
```

## Architecture Overview

### Core Structure
- **Next.js 14 App Router**: Modern routing with app directory structure
- **AI Integration**: Dify Client integration for conversational AI features  
- **Resume Rendering**: JSON-based resume data with PDF export capability
- **Multi-modal Interface**: Chat interface with workflow visualization

### Key Components
- `app/components/RenderResume/`: Static resume rendering from JSON data
- `app/components/Chat/`: Core chat functionality with streaming responses
- `app/components/Ask/`: AI interaction interface with conversation management
- `app/components/workflow/`: Workflow visualization for AI processes
- `script/pdf.js`: Puppeteer-based PDF generation system

### Data Flow
1. Resume data stored in `app/components/RenderResume/resume.json`
2. AI chat handled through Dify Client with streaming responses
3. PDF generation uses Puppeteer to render live page at port 3001
4. Internationalization previously supported (i18n files currently removed)

## Technical Configuration

### TypeScript Setup
- Strict mode enabled with comprehensive type checking
- Path aliases: `@/*` maps to project root
- Custom global types in `app/global.d.ts`

### Styling System
- **Tailwind CSS**: Primary styling framework with custom color palette
- **CSS Modules**: Component-specific styles (`.module.css` files)
- **Custom Typography**: Extended typography configuration in `typography.js`
- **Responsive Design**: Mobile-first with custom breakpoints (mobile: 100px, tablet: 640px, pc: 769px)

### Build & Development
- ESLint errors and TypeScript errors ignored during builds (configured for rapid development)
- Husky pre-commit hooks with lint-staged
- Supports MDX files alongside standard React components
- Source maps disabled in production

## PDF Generation System

The project includes a sophisticated PDF generation system (`script/pdf.js`):
- Spawns temporary Next.js server on port 3001
- Uses Puppeteer to capture rendered page
- Applies print-specific CSS optimizations
- Generates both PDF and HTML versions
- Includes font optimization for Chinese characters

## Development Notes

- Project uses Chinese language as primary locale (`zh-Hans`)
- Monaco Editor integrated for code editing features
- SWR for data fetching and caching
- React Error Boundary implementation for error handling
- Structured JSON resume data enables easy content updates
- AI chat features require proper Dify Client configuration

## File Organization

```
app/
├── api/              # Next.js API routes
├── components/       # React components
│   ├── Ask/         # AI interaction components
│   ├── Chat/        # Core chat functionality
│   ├── RenderResume/ # Resume rendering
│   ├── workflow/    # AI workflow visualization
│   └── base/        # Shared base components
├── styles/          # Global styles
script/              # Build and utility scripts
service/             # API service layer
```

When working with this codebase, prioritize understanding the resume JSON structure, AI integration patterns, and the PDF generation workflow.