<template>
  <div
    v-if="initialDataManager.isReady.value"
    :style="{
      width: props.width || '100%',
      height: props.height || '100%',
      position: 'relative',
      overflow: 'hidden',
      transform: 'translateZ(0)'
    }"
  >
    <Renderer v-bind="props.renderer" />
    <UiOverlay />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { IsoflowProps } from 'src/types'
import { setWindowCursor } from 'src/utils'
import { useModelStore } from 'src/stores/modelStore'
import { useUiStateStore } from 'src/stores/uiStateStore'
import Renderer from 'src/components/Renderer/Renderer.vue'
import UiOverlay from 'src/components/UiOverlay/UiOverlay.vue'
import { INITIAL_DATA, MAIN_MENU_OPTIONS } from 'src/config'
import { useInitialDataManager } from 'src/hooks/useInitialDataManager'

interface Props extends Partial<IsoflowProps> {
  width?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  mainMenuOptions: () => MAIN_MENU_OPTIONS,
  width: '100%',
  height: '100%',
  enableDebugTools: false,
  editorMode: 'EDITABLE'
})

const emit = defineEmits<{
  modelUpdated: [model: any]
}>()

const uiStateStore = useUiStateStore()
const modelStore = useModelStore()
const initialDataManager = useInitialDataManager()

// Watch for initial data changes
watch(
  () => props.initialData,
  (newInitialData) => {
    if (newInitialData) {
      initialDataManager.load({ ...INITIAL_DATA, ...newInitialData })
    }
  },
  { immediate: true }
)

// Watch for editor mode changes
watch(
  () => props.editorMode,
  (newEditorMode) => {
    if (newEditorMode) {
      uiStateStore.setEditorMode(newEditorMode)
    }
  },
  { immediate: true }
)

// Watch for main menu options changes
watch(
  () => props.mainMenuOptions,
  (newMainMenuOptions) => {
    if (newMainMenuOptions) {
      uiStateStore.setMainMenuOptions(newMainMenuOptions)
    }
  },
  { immediate: true }
)

// Watch for debug tools changes
watch(
  () => props.enableDebugTools,
  (newEnableDebugTools) => {
    uiStateStore.setEnableDebugTools(newEnableDebugTools)
  },
  { immediate: true }
)

// Watch for model changes and emit updates
watch(
  () => modelStore.$state,
  (newModel) => {
    if (initialDataManager.isReady.value && props.onModelUpdated) {
      emit('modelUpdated', newModel)
    }
  },
  { deep: true }
)

onMounted(() => {
  // Initialize with default data if no initial data provided
  if (!props.initialData) {
    initialDataManager.load(INITIAL_DATA)
  }
})

onUnmounted(() => {
  setWindowCursor('default')
})
</script>