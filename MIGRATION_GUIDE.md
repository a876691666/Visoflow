# React to Vue 3 Migration Guide

This document outlines the migration process from React to Vue 3 for the Isoflow project.

## 🎯 Migration Goals

1. Convert from React/TSX to Vue 3 with Composition API
2. Replace Zustand with Pinia for state management
3. Switch from Webpack to Vite for build system
4. Maintain TypeScript support throughout
5. Replace Material-UI with native CSS/Vue components

## 📋 Completed Tasks

### 1. Project Configuration

- ✅ Created new `package.json` with Vue 3 dependencies
- ✅ Set up Vite configuration (`vite.config.ts`)
- ✅ Updated TypeScript configuration for Vue
- ✅ Created ESLint configuration for Vue projects
- ✅ Set up Vitest for testing

### 2. Build System

- ✅ Removed Webpack configurations
- ✅ Created Vite build setup with library mode
- ✅ Set up development server configuration

### 3. State Management

- ✅ Created Pinia stores to replace Zustand:
  - `modelStore.ts` - Application model state
  - `sceneStore.ts` - Scene-specific data
  - `uiStateStore.ts` - UI state management

### 4. Core Components

- ✅ Created main `Isoflow.vue` component
- ✅ Created `App.vue` for development
- ✅ Set up router configuration
- ✅ Created example components structure

### 5. Component Conversion Examples

- ✅ `IconButton.tsx` → `IconButton.vue`
- ✅ `UiOverlay.tsx` → `UiOverlay.vue`
- ✅ `Renderer.tsx` → `Renderer.vue`

## 🚧 Remaining Tasks

### High Priority

1. **Complete Component Conversion** - Convert all remaining TSX components to Vue
2. **Hooks to Composables** - Convert React hooks to Vue composables
3. **Event System Migration** - Adapt React event handling to Vue
4. **Theme System** - Replace Material-UI theme with Vue-compatible solution

### Medium Priority

1. **Testing Migration** - Convert Jest tests to Vitest
2. **Documentation Update** - Update all documentation for Vue 3
3. **Build Optimization** - Optimize Vite build for production

### Low Priority

1. **Performance Optimization** - Vue-specific performance improvements
2. **Developer Experience** - Enhanced development tools and debugging

## 🔧 Key Migration Patterns

### State Management

```typescript
// Before (Zustand)
const useStore = create((set, get) => ({
  value: 0,
  increment: () => set((state) => ({ value: state.value + 1 }))
}));

// After (Pinia)
export const useStore = defineStore('store', {
  state: () => ({ value: 0 }),
  actions: {
    increment() {
      this.value++;
    }
  }
});
```

### Component Structure

```tsx
// Before (React)
const Component = ({ prop1, prop2, onEvent }) => {
  const [state, setState] = useState(initial);

  useEffect(() => {
    // side effects
  }, [dependency]);

  return <div onClick={onEvent}>{state}</div>;
};
```

```vue
<!-- After (Vue 3) -->
<template>
  <div @click="onEvent">{{ state }}</div>
</template>

<script setup lang="ts">
interface Props {
  prop1: string;
  prop2: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{ event: [data: any] }>();

const state = ref(initial);

onMounted(() => {
  // side effects
});

const onEvent = () => emit('event', data);
</script>
```

### Store Usage

```typescript
// Before (React)
const Component = () => {
  const value = useStore(state => state.value)
  const increment = useStore(state => state.increment)

  return <button onClick={increment}>{value}</button>
}
```

```vue
<!-- After (Vue 3) -->
<template>
  <button @click="store.increment">{{ store.value }}</button>
</template>

<script setup lang="ts">
const store = useStore();
</script>
```

## 📁 File Structure Changes

```
Before:
src/
├── components/          # React .tsx files
├── stores/             # Zustand stores
├── hooks/              # React hooks
├── types/              # TypeScript types
└── utils/              # Utilities

After:
src/
├── components/          # Vue .vue files
├── stores/             # Pinia stores
├── composables/        # Vue composables (was hooks/)
├── types/              # TypeScript types
└── utils/              # Utilities
```

## 🎨 Styling Migration

### Material-UI to Native CSS

- Replace `<Box>` with native `<div>` elements
- Convert `sx` props to CSS classes or inline styles
- Use CSS custom properties for theming
- Implement Vue's scoped styling

### Example:

```tsx
// Before (Material-UI)
<Box
  sx={{
    display: 'flex',
    p: 2,
    bgcolor: 'primary.main'
  }}
>
  Content
</Box>
```

```vue
<!-- After (Native CSS) -->
<div class="container">
  Content
</div>

<style scoped>
.container {
  display: flex;
  padding: 16px;
  background-color: #1976d2;
}
</style>
```

## 🧪 Testing Migration

### Jest to Vitest

- Update test files from `.test.tsx` to `.test.ts`
- Replace React Testing Library with Vue Testing Library
- Update test configuration for Vite

## 📝 Next Steps

1. **Install Dependencies**: Run `npm install` to install Vue 3 dependencies
2. **Component Conversion**: Start converting remaining components one by one
3. **Test Each Component**: Ensure each converted component works correctly
4. **Integration Testing**: Test component interactions
5. **Performance Optimization**: Optimize for Vue 3 patterns

## 🐛 Known Issues

1. TypeScript errors are expected until all dependencies are installed
2. Some components may need additional props/events adjustment
3. Paper.js integration needs testing with Vue lifecycle

## 💡 Tips for Contributors

1. **Start with Leaf Components**: Convert components with no dependencies first
2. **Maintain Type Safety**: Keep all TypeScript types intact
3. **Follow Vue Patterns**: Use Vue 3 Composition API patterns consistently
4. **Test Incrementally**: Test each component as you convert it
5. **Keep Functionality**: Ensure all original functionality is preserved

---

For questions or issues during migration, please refer to:

- [Vue 3 Documentation](https://vuejs.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
