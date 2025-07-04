import { computed } from 'vue'
import { useModelStore } from 'src/stores/modelStore'
import { useUiStateStore } from 'src/stores/uiStateStore'

export const useIsoflow = () => {
  const modelStore = useModelStore()
  const uiStateStore = useUiStateStore()

  const rendererEl = computed(() => uiStateStore.rendererEl)

  return {
    Model: modelStore,
    uiState: uiStateStore,
    rendererEl
  }
}