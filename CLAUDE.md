<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Excel Compare** - a web-based pure frontend Excel content comparison application built with Next.js 14, TypeScript, and Tailwind CSS. It simulates vimdiff's dual-pane split-screen interface, allowing users to upload two Excel files with independent Sheet switching. The system uses Myers difference algorithm to calculate differences and provides intelligent folding functionality (default hiding consecutive identical rows), focusing on core differences with bidirectional synchronized scrolling.

## Development Commands

```bash
# Development
npm run dev          # Start development server on localhost:3000
npm run build        # Build for production
npm start           # Start production server
npm run lint        # Run ESLint

# AI Development Center Testing
# Test AI features by navigating to /admin/ai-dev in development
```

## Architecture

### Excel Processing Architecture
- **Frontend-Only Processing**: All Excel files processed completely in the browser using Web Workers
- **SheetJS Integration**: Uses xlsx library for Excel file parsing and data extraction
- **Difference Algorithm**: Implements Myers difference algorithm for precise change detection
- **Dual-Pane Layout**: Simulates vimdiff interface with independent left/right panels
- **Intelligent Folding**: Automatically hides consecutive identical rows to highlight differences

### Multi-language Support
- **Routing**: Subdirectory-based internationalization (`/`, `/zh`, `/ja`)
- **Translation System**: JSON dictionaries in `src/dictionaries/`
- **Automatic Detection**: Browser language detection with fallbacks
- **Path Management**: Locale-aware routing utilities in `src/lib/i18n-config.ts`

### Performance Optimization
- **Web Worker Integration**: Complex difference calculations run in background threads
- **Synchronized Scrolling**: Bidirectional sync between left and right panels
- **Memory Management**: Efficient handling of large Excel files with chunked processing
- **Smart Rendering**: Virtual scrolling and folding mechanisms for optimal performance

### AI Development Center
- **Natural Language Processing**: Converts user requests to Excel comparison feature enhancements
- **Project Context Analysis**: Analyzes codebase structure via GitHub API
- **Batch Operations**: Uses Git Trees API for efficient multi-file commits
- **Safety Features**: File path validation and human review requirements

## Key Directories and Files

```
src/
├── app/                          # Next.js App Router
│   ├── [lang]/                   # Internationalization routes
│   ├── api/                      # API routes
│   │   ├── admin/                # Admin panel routes
│   │   ├── login/                # Authentication
│   │   └── check-auth/           # Auth verification
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── ui/                       # Shadcn/ui components
│   ├── excel-compare/            # Excel comparison components
│   │   ├── ExcelUploadArea.tsx   # Main file upload and comparison container
│   │   ├── DataPreviewPanelI18n.tsx # Data preview panel with internationalization
│   │   ├── FileUploadZoneI18n.tsx # File upload zone with internationalization
│   │   ├── SheetSelectorI18n.tsx # Sheet selector with internationalization
│   │   ├── VirtualExcelTable.tsx # Virtualized Excel table component
│   │   └── table.tsx             # General UI table components
│   ├── Layout.js                 # Main layout wrapper
│   ├── Navigation.js             # Navigation with auth state
│   └── LanguageSwitcher.tsx      # Multi-language switcher
├── lib/                          # Utilities and core logic
│   ├── auth.js                   # JWT authentication
│   ├── excelParser.js            # Excel file processing with SheetJS
│   ├── diffAlgorithm.js          # Myers difference algorithm
│   ├── webWorker.js              # Web Worker for background processing
│   ├── openrouter.js             # AI API integration
│   ├── codeContext.js            # Project context analysis
│   └── githubCommit.js           # GitHub batch operations
├── workers/                      # Web Worker scripts
│   └── diffWorker.js             # Difference calculation worker
└── dictionaries/                 # Translation files
    ├── en.json, zh.json, ja.json # Language translations
```

## Core Components

### Excel Processing Components
- **ExcelUploadArea**: Main container managing dual file upload and comparison workflow
- **DataPreviewPanelI18n**: Internationalized data preview panel with sheet switching
- **FileUploadZoneI18n**: Internationalized drag & drop file upload zone
- **SheetSelectorI18n**: Internationalized dropdown for selecting Excel sheets
- **VirtualExcelTable**: High-performance virtualized table for large Excel datasets
- **table**: Reusable UI table components from Shadcn/ui

### Algorithm Implementation
- **Myers Difference**: Efficient O(ND) algorithm for change detection
- **Line Alignment**: Inserts placeholder rows for proper alignment
- **Block Optimization**: Merges adjacent changes into MODIFIED blocks
- **Cell-level Diff**: Granular comparison within modified blocks

## Environment Variables

Required for development and production (optional for basic Excel comparison):

```env
# AI Development Center (Optional)
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repo_name
JWT_SECRET=your_jwt_secret_key
DOMAIN=localhost                  # Production domain in production
ACCESS_USERNAME=your_admin_username
ACCESS_PASSWORD=your_secure_access_password
```

**Note**: Environment variables are only required for AI development center features. Basic Excel comparison works without any configuration.

## Core Libraries and APIs

### Excel Processing
- **SheetJS (xlsx)**: Excel file parsing and data extraction library
- **Myers Difference Algorithm**: Efficient text comparison and change detection
- **Web Worker API**: Browser-native background processing

### Frontend Framework
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript development
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/UI**: Modern React component library

### AI Integration (Optional)
- **OpenRouter AI**: Claude 3.5 Sonnet API for feature enhancement
- **Project Analysis**: GitHub API-based codebase structure analysis

### Security Features
- **Path Validation**: Prevents modification of system files (.env, .git, etc.)
- **Input Sanitization**: Validates all user inputs and file paths
- **JWT Security**: Domain-bound tokens with expiration

## Development Workflow

### Excel Feature Development
1. Create Excel processing components in `src/components/excel-compare/`
2. Implement difference algorithms in `src/lib/diffAlgorithm.js`
3. Add Web Worker scripts in `src/workers/`
4. Test with various Excel file formats and sizes
5. Optimize performance for large files

### AI-Powered Development
1. Navigate to `/admin/ai-dev`
2. Configure OpenRouter and GitHub tokens
3. Describe Excel comparison enhancements in natural language
4. Review generated code changes
5. Commit to GitHub with batch operations

### Authentication Flow
- Login at `/login` with `ACCESS_USERNAME`/`ACCESS_PASSWORD`
- JWT token stored in HTTP-only cookie
- Auto-logout after 1 hour for security
- Middleware protects sensitive API routes

## Special Considerations

### Excel File Processing
- **Client-Side Only**: All Excel files processed in browser, no server upload
- **Memory Management**: Efficient handling of large files with streaming
- **Format Support**: Compatible with .xlsx, .xls, .xlsm, .xlsb formats
- **Performance**: Web Worker ensures UI responsiveness during processing

### Batch Commit Operations
The AI development center uses GitHub's Git Trees API for efficient operations:
- Multiple file changes in single commit
- Avoids API rate limits
- Atomic operations ensure consistency

### File Safety
AI-generated code follows strict path validation:
- Cannot modify system files (.env, .git, etc.)
- Cannot delete files (disabled for safety)
- Cannot access user's Excel files or browser storage
- All changes require human review before commit

### Multi-language Development
- All user-facing text should support internationalization
- Use `getDictionary` for translations
- Path utilities handle locale-aware routing
- Fallback to English for missing translations

### Browser Compatibility
- **Web Workers**: Requires modern browsers with Worker support
- **File API**: Uses File and FileReader APIs for Excel processing
- **ES6+ Features**: Leverages modern JavaScript for performance
- **Responsive Design**: Optimized for desktop and tablet use

## Testing Excel Features

To test Excel comparison functionality:
1. Prepare test Excel files with various formats (.xlsx, .xls, .xlsm)
2. Test files of different sizes (small, medium, large)
3. Verify Sheet switching works independently
4. Test difference algorithm with various data types
5. Validate synchronized scrolling functionality
6. Test folding/unfolding of identical rows
7. Verify Web Worker performance with large files

## Testing AI Features

To test the AI development center locally:
1. Configure OpenRouter API key in `/admin/ai-dev`
2. Set up GitHub token with `repo` permissions
3. Create a test branch for experimentation
4. Use Excel comparison enhancement requests
5. Always review generated code before committing

## Common Patterns

### Excel Component Structure
Excel comparison components follow this pattern:
```typescript
interface ExcelComparisonProps {
  leftFile: File | null;
  rightFile: File | null;
  onComparisonStart: () => void;
  onComparisonComplete: (result: ComparisonResult) => void;
}

const ExcelComparison: React.FC<ExcelComparisonProps> = ({
  leftFile,
  rightFile,
  onComparisonStart,
  onComparisonComplete
}) => {
  // Component implementation
};
```

### Web Worker Communication
Web Worker communication pattern:
```javascript
// Main thread
const worker = new Worker('/workers/diffWorker.js');
worker.postMessage({ type: 'COMPARE', data: { leftData, rightData } });

// Worker thread
self.onmessage = (event) => {
  const { type, data } = event.data;
  if (type === 'COMPARE') {
    const result = performDiff(data.leftData, data.rightData);
    self.postMessage({ type: 'RESULT', data: result });
  }
};
```

### Difference Algorithm Implementation
Myers algorithm implementation pattern:
```javascript
function myersDiff(a, b) {
  // Implement O(ND) difference algorithm
  // Return array of operations: INSERT, DELETE, MODIFIED, SAME
}
```

### API Route Security
All sensitive API routes implement:
- Middleware-level protection
- JWT verification
- Input validation
- Error handling with proper status codes

### Component Architecture
- Shadcn/ui components for UI elements
- Server components for initial page load
- Client components for interactive Excel comparison
- Responsive design with Tailwind CSS
- Web Workers for background processing

## Development Guidelines
- After each modification, must test whether the code can be compiled successfully, and fix it if it fails
- Never run npm run dev
- Must answer in Chinese
- Must use Chinese for all documents except CLAUDE.md