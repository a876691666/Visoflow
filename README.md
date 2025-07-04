# Isoflow Vue3

An open-source Vue3 component library for drawing network diagrams.

> **Note**: This project has been migrated from React to Vue3 setup API + TypeScript + Vite. See [MIGRATION.md](./MIGRATION.md) for details.

## 🚀 Quick Start

### Installation

```bash
npm install isoflow
```

### Usage

```vue
<template>
  <div>
    <Isoflow 
      :initial-data="diagramData"
      width="800px"
      height="600px"
      editor-mode="EDITABLE"
      @model-updated="onModelUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { Isoflow } from 'isoflow'

const diagramData = {
  // Your diagram data here
}

const onModelUpdated = (model: any) => {
  console.log('Model updated:', model)
}
</script>
```

### Plugin Installation

```typescript
import { createApp } from 'vue'
import Isoflow from 'isoflow'
import App from './App.vue'

const app = createApp(App)
app.use(Isoflow)
app.mount('#app')
```

## 🛠 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build library
npm run build:lib

# Run tests
npm run test

# Type checking
npm run type-check
```

## 📚 API Reference

### Isoflow Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initial-data` | `InitialData` | `undefined` | Initial diagram data |
| `width` | `string \| number` | `'100%'` | Component width |
| `height` | `string \| number` | `'100%'` | Component height |
| `editor-mode` | `'EDITABLE' \| 'EXPLORABLE_READONLY' \| 'NON_INTERACTIVE'` | `'EDITABLE'` | Editor interaction mode |
| `enable-debug-tools` | `boolean` | `false` | Enable debug tools |
| `main-menu-options` | `MainMenuOptions` | `MAIN_MENU_OPTIONS` | Main menu configuration |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `model-updated` | `model: any` | Fired when the diagram model is updated |

### Composables

#### useIsoflow()

```typescript
import { useIsoflow } from 'isoflow'

const { Model, uiState, rendererEl } = useIsoflow()
```

Returns:
- `Model` - Pinia store for model data
- `uiState` - Pinia store for UI state
- `rendererEl` - Ref to the renderer element

## 🏗 Architecture

### State Management
- **Pinia**: Modern state management for Vue3
- **Model Store**: Handles diagram data (items, views, icons, colors)
- **UI State Store**: Manages UI state (zoom, scroll, mode, etc.)
- **Scene Store**: Manages scene-specific data

### Build System
- **Vite**: Fast build tool and dev server
- **Vue3**: Composition API with `<script setup>` syntax
- **TypeScript**: Full type safety
- **Vitest**: Testing framework

## 🔄 Migration from React

This project was originally built with React and has been migrated to Vue3. Key changes:

- **React → Vue3**: Components converted to SFC with Composition API
- **Zustand → Pinia**: State management migration
- **Webpack → Vite**: Build system modernization
- **Jest → Vitest**: Testing framework update
- **Material-UI removed**: To eliminate React dependencies

See [MIGRATION.md](./MIGRATION.md) for detailed migration information.

## 📝 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Known Issues

This migration is in progress. Current known issues:

- [ ] TypeScript errors in legacy components need resolution
- [ ] Some interaction components need Vue3 conversion
- [ ] Testing setup needs completion
- [ ] Documentation needs updating

## 📞 Support

For questions and support, please open an issue on GitHub.