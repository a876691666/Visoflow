<template>
  <div>
    <GlobalStyles />
    <div
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { IsoflowProps } from 'src/types'
import { setWindowCursor, modelFromModelStore } from 'src/utils'
import { useModelStore } from 'src/stores/modelStore'
import { useUiStateStore } from 'src/stores/uiStateStore'
import { useSceneStore } from 'src/stores/sceneStore'
import { INITIAL_DATA, MAIN_MENU_OPTIONS } from 'src/config'
import { useInitialDataManager } from 'src/composables/useInitialDataManager'
import { Renderer } from 'src/components/Renderer/Renderer.vue'
import { UiOverlay } from 'src/components/UiOverlay/UiOverlay.vue'
import GlobalStyles from 'src/styles/GlobalStyles.vue'

interface Props extends IsoflowProps {}

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

const modelStore = useModelStore()
const uiStateStore = useUiStateStore()
const sceneStore = useSceneStore()
const initialDataManager = useInitialDataManager()

const model = computed(() => modelFromModelStore(modelStore))

onMounted(() => {
  const dataToLoad = { ...INITIAL_DATA, ...props.initialData }
  initialDataManager.load(dataToLoad)
  
  uiStateStore.setEditorMode(props.editorMode)
  uiStateStore.setMainMenuOptions(props.mainMenuOptions)
  uiStateStore.setEnableDebugTools(props.enableDebugTools)
})

onUnmounted(() => {
  setWindowCursor('default')
})

watch(
  () => props.editorMode,
  (newMode) => {
    uiStateStore.setEditorMode(newMode)
  }
)

watch(
  () => props.mainMenuOptions,
  (newOptions) => {
    uiStateStore.setMainMenuOptions(newOptions)
  }
)

watch(
  () => props.enableDebugTools,
  (newValue) => {
    uiStateStore.setEnableDebugTools(newValue)
  }
)

watch(
  model,
  (newModel) => {
    if (initialDataManager.isReady && props.onModelUpdated) {
      emit('modelUpdated', newModel)
      props.onModelUpdated(newModel)
    }
  },
  { deep: true }
)
</script>