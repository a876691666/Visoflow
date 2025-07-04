![readme-header](https://user-images.githubusercontent.com/1769678/223572353-788d5d38-cd28-40fa-96cd-9d29226f7e4b.png)

<h4 align="center">
  <a href="https://codesandbox.io/p/sandbox/github/markmanx/isoflow">Online playground</a> |
  <a href="https://isoflow.io/docs">Developer docs</a> |
  <a href="https://github.com/markmanx/isoflow">Github</a> |
  <a href="https://discord.gg/QYPkvZth7D">Discord</a> |
  <a href="https://hub.docker.com/r/markmanx/isoflow/tags">Docker image</a>
</h4>

<div align="center">
    <h1>A React component for drawing network diagrams.</h1>
</div>

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![CircleCI](https://circleci.com/gh/markmanx/isoflow.svg?style=shield)

</div>

## About Isoflow Community Edition

Isoflow is an open-core project. We offer the [Isoflow Community Edition](https://github.com/markmanx/isoflow) as fully-functional, open-source software under the MIT license. In addition, we also support our development efforts by offering **Isoflow Pro** with additional features for commercial use. You can read more about the differences between Pro and the Community Edition [here](https://isoflow.io/pro-vs-community-edition).

## Key features

- **Drag-and-drop editor** - Express your architecture with icons, regions and connectors.
- **Extensible icon system** - Create your own icon library, or use plugins for existing libraries including AWS, Azure, GCP, Kubernetes, and more.
- **Export options** - Export diagrams as code or images.

## Quick start

Install both the editor and isopacks from [npm](https://www.npmjs.com/package/isoflow):

- `npm install isoflow @isoflow/isopacks`

See our [documentation](https://isoflow.io/docs) for more information.

## Professional support

For professional support, please consider purchasing a license for Isoflow Pro. Isoflow Pro includes additional features and support options. For more information, visit [isoflow.io](https://isoflow.io).

## Found a bug or need support?

Please report bugs and issues [here](https://github.com/markmanx/isoflow/issues), or on our [Discord server](https://discord.gg/QYPkvZth7D).

# Isoflow Vue 3

An open-source Vue 3 component for drawing network diagrams. This project has been migrated from React to Vue 3 with Composition API and TypeScript.

## 🚀 Migration Status

This project is currently being migrated from React to Vue 3. Here's the current status:

### ✅ Completed

- ✅ Project setup with Vue 3 + Vite + TypeScript
- ✅ Pinia store setup (replacing Zustand)
- ✅ Basic component structure converted
- ✅ Main entry points created
- ✅ Build configuration with Vite

### 🚧 In Progress

- 🚧 Converting React components to Vue components
- 🚧 Hooks conversion to Vue Composables
- 🚧 Event handling migration
- 🚧 Testing setup with Vitest

### 📋 To Do

- ⏳ Complete component conversion
- ⏳ Theme system adaptation
- ⏳ Material-UI replacement with native CSS/Vue components
- ⏳ Paper.js integration testing
- ⏳ Complete test suite migration

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Build as Library

```bash
npm run build:lib
```

### Testing

```bash
npm run test
```

## 📦 Usage

### As a Vue Plugin

```typescript
import { createApp } from 'vue';
import Isoflow from 'isoflow';
import App from './App.vue';

const app = createApp(App);
app.use(Isoflow);
app.mount('#app');
```

### As a Component

```vue
<template>
  <Isoflow
    :initial-data="data"
    :width="800"
    :height="600"
    editor-mode="EDITABLE"
    @model-updated="onModelUpdated"
  />
</template>

<script setup lang="ts">
import { Isoflow } from 'isoflow';

const data = {
  // Your diagram data
};

const onModelUpdated = (model) => {
  console.log('Model updated:', model);
};
</script>
```

## 🏗️ Architecture

### State Management

- **Pinia** for state management (replacing Zustand)
- **Composables** for reusable logic (replacing React hooks)

### Build System

- **Vite** for fast development and building
- **TypeScript** for type safety
- **Vue 3 Composition API** for modern Vue development

### Component Structure

```
src/
├── components/     # Vue components
├── stores/         # Pinia stores
├── hooks/          # Vue composables
├── types/          # TypeScript types
├── utils/          # Utility functions
└── styles/         # Global styles
```

## 🔄 Migration Notes

### Key Changes from React Version

1. **State Management**: Zustand → Pinia
2. **Component System**: React Components → Vue 3 Composition API
3. **Build System**: Webpack → Vite
4. **Testing**: Jest → Vitest
5. **Styling**: Material-UI → Native CSS with Vue bindings

### Breaking Changes

- Component API has been adapted for Vue 3 patterns
- Event handling uses Vue's event system
- Props and events follow Vue conventions

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Note**: This is an active migration project. Some features may not be fully functional yet. Please check the migration status above for current progress.
