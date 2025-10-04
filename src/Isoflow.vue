<template>
  <div class="isoflow-theme">
    <div
      class="isoflow-container"
      :style="{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        position: 'relative',
        overflow: 'hidden',
        transform: 'translateZ(0)'
      }"
    >
      <Renderer v-bind="renderer" />
      <UiOverlay />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch, ref } from 'vue';
import { useModelStore } from './stores/modelStore';
import { useSceneStore } from './stores/sceneStore';
import { useUiStateStore } from './stores/uiStateStore';
import { setWindowCursor, modelFromModelStore } from './utils';
import { INITIAL_DATA, MAIN_MENU_OPTIONS } from './config';
import { useInitialDataManager } from './hooks/useInitialDataManager';
import Renderer from './components/Renderer/Renderer.vue';
import UiOverlay from './components/UiOverlay/UiOverlay.vue';
import type { IsoflowProps } from './types';
import { provideIsoflow } from './context/isoflowContext';

interface Props {
  initialData?: IsoflowProps['initialData'];
  mainMenuOptions?: IsoflowProps['mainMenuOptions'];
  width?: IsoflowProps['width'];
  height?: IsoflowProps['height'];
  onModelUpdated?: IsoflowProps['onModelUpdated'];
  enableDebugTools?: IsoflowProps['enableDebugTools'];
  editorMode?: IsoflowProps['editorMode'];
  renderer?: IsoflowProps['renderer'];
}

const props = withDefaults(defineProps<Props>(), {
  mainMenuOptions: () => MAIN_MENU_OPTIONS,
  width: '100%',
  height: '100%',
  enableDebugTools: false,
  editorMode: 'EDITABLE'
});

const emit = defineEmits<{
  modelUpdated: [model: any];
}>();

// Stores (Pinia) and provide as context for children
const modelStore = useModelStore();
const sceneStore = useSceneStore();
const uiStateStore = useUiStateStore();
provideIsoflow({ modelStore, sceneStore, uiStateStore });

// Initial data manager
const initialDataManager = useInitialDataManager();

// Model tracking
const model = ref(modelFromModelStore(modelStore));

onMounted(() => {
  // Load initial data
  const dataToLoad = { ...INITIAL_DATA, ...props.initialData };
  initialDataManager.load(dataToLoad);

  // Set UI state
  uiStateStore.setEditorMode(props.editorMode);
  uiStateStore.setMainMenuOptions(props.mainMenuOptions);
  uiStateStore.setEnableDebugTools(props.enableDebugTools);

  // Clean up cursor on unmount
  return () => {
    setWindowCursor('default');
  };
});

onUnmounted(() => {
  setWindowCursor('default');
});

// Watch for prop changes
watch(
  () => props.editorMode,
  (newMode) => {
    uiStateStore.setEditorMode(newMode);
  }
);

watch(
  () => props.mainMenuOptions,
  (newOptions) => {
    uiStateStore.setMainMenuOptions(newOptions);
  }
);

watch(
  () => props.enableDebugTools,
  (newValue) => {
    uiStateStore.setEnableDebugTools(newValue);
  }
);

// Watch for model changes and emit updates
watch(
  () => modelFromModelStore(modelStore),
  (newModel) => {
    model.value = newModel;
    if (initialDataManager.isReady && props.onModelUpdated) {
      props.onModelUpdated(newModel);
      emit('modelUpdated', newModel);
    }
  },
  { deep: true }
);

// Provide composition API for external access
const useIsoflow = () => {
  return {
    Model: modelStore,
    uiState: uiStateStore,
    rendererEl: ref(() => uiStateStore.rendererEl)
  };
};

// Export for external use
defineExpose({
  useIsoflow,
  modelStore,
  uiStateStore,
  sceneStore
});
</script>

<style scoped>
.isoflow-theme {
  width: 100%;
  height: 100%;
}

.isoflow-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}
</style>
