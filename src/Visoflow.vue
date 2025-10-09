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
      <UiOverlay v-if="uiStateStore.rendererEl" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import { useUiStateStore } from './stores/uiStateStore';
import { setWindowCursor } from './utils';
import { INITIAL_DATA, MAIN_MENU_OPTIONS } from './config';
import { useInitialDataManager } from './hooks/useInitialDataManager';
import Renderer from './components/Renderer/Renderer.vue';
import UiOverlay from './components/UiOverlay/UiOverlay.vue';
import type { IsoflowProps } from './types';
import { provideIsoflow } from './context/isoflowContext';
import { useSceneStore } from './stores/provider';

interface Props {
  initialData?: IsoflowProps['initialData'];
  mainMenuOptions?: IsoflowProps['mainMenuOptions'];
  width?: IsoflowProps['width'];
  height?: IsoflowProps['height'];
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

const sceneStore = useSceneStore();
const uiStateStore = useUiStateStore();

provideIsoflow({ uiStateStore });

const initialDataManager = useInitialDataManager(sceneStore);

onMounted(() => {
  const dataToLoad = { ...INITIAL_DATA, ...props.initialData };
  initialDataManager.load(dataToLoad);

  uiStateStore.setEditorMode(props.editorMode);
  uiStateStore.setMainMenuOptions(props.mainMenuOptions);
  uiStateStore.setEnableDebugTools(props.enableDebugTools);

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

watch(
  () => sceneStore.model,
  (newModel) => {
    if (initialDataManager.isReady) {
      emit('modelUpdated', newModel);
    }
  }
);

const useVisoflow = () => {
  return {
    uiState: uiStateStore,
    useSceneStore: () => sceneStore,
    rendererEl: () => uiStateStore.rendererEl
  };
};

// Export for external use
defineExpose({
  useVisoflow
});
</script>

<style>
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
.isoflow-theme img {
  user-select: none !important;
  /* pointer-events: none !important; */
  -webkit-user-drag: none !important;
}
</style>
