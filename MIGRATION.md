# Isoflow React to Vue3 Migration

This document outlines the migration from React to Vue3 setup API + TypeScript + Vite.

## Key Changes

### Build System
- **Old**: Webpack + Jest
- **New**: Vite + Vitest

### State Management
- **Old**: Zustand with React Context
- **New**: Pinia stores

### Component System
- **Old**: React components (.tsx)
- **New**: Vue3 Single File Components (.vue) with setup API

### Hooks/Composables
- **Old**: React hooks in `src/hooks/`
- **New**: Vue3 composables in `src/composables/`

### Styling
- **Old**: Material-UI (MUI) + Emotion
- **New**: Custom CSS (Material-UI removed to eliminate React dependency)

## Migration Status

### ✅ Completed
- Package.json dependencies updated
- Vite configuration
- TypeScript configuration
- Pinia stores (modelStore, uiStateStore, sceneStore)
- Main Isoflow component
- Basic project structure

### 🚧 In Progress / Placeholder
- Individual UI components (Renderer, UiOverlay, etc.)
- Composables (converted from React hooks)
- Interaction system
- Scene management

### ❌ To Do
- Complete component conversion
- Styling system implementation
- Testing setup
- Full interaction system
- Documentation

## Usage

```typescript
import { createApp } from 'vue'
import { Isoflow, useIsoflow } from 'isoflow'

// In your Vue app
const app = createApp(App)
app.use(Isoflow)

// In a component
<template>
  <Isoflow 
    :initial-data="data"
    width="800px"
    height="600px"
    @model-updated="onModelUpdated"
  />
</template>
```

## Development

```bash
npm run dev        # Start development server
npm run build:lib  # Build library
npm run test       # Run tests
```