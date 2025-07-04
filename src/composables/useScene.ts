import { computed } from 'vue'
import { useModelStore } from 'src/stores/modelStore'
import { useUiStateStore } from 'src/stores/uiStateStore'
import { useSceneStore } from 'src/stores/sceneStore'

export const useScene = () => {
  const modelStore = useModelStore()
  const uiStateStore = useUiStateStore()
  const sceneStore = useSceneStore()

  const currentView = computed(() => {
    const viewId = uiStateStore.view
    const view = modelStore.views?.find((v: any) => v.id === viewId)
    return view || { id: '', name: '', items: [] }
  })

  const items = computed(() => {
    return currentView.value.items || []
  })

  const rectangles = computed(() => {
    return currentView.value.rectangles || []
  })

  const connectors = computed(() => {
    return sceneStore.connectors || {}
  })

  const textBoxes = computed(() => {
    return sceneStore.textBoxes || {}
  })

  return {
    currentView,
    items,
    rectangles,
    connectors,
    textBoxes
  }
}