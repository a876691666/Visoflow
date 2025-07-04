import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useUiStateStore } from 'src/stores/uiStateStore'
import { Size, Coords } from 'src/types'
import {
  getUnprojectedBounds as getUnprojectedBoundsUtil,
  getFitToViewParams as getFitToViewParamsUtil,
  CoordsUtils
} from 'src/utils'
import { useScene } from 'src/hooks/useScene'

// 简化的尺寸观察器
const useSimpleResizeObserver = (element: HTMLElement | null) => {
  const size = ref<Size>({ width: 0, height: 0 })

  const updateSize = () => {
    if (element) {
      const rect = element.getBoundingClientRect()
      size.value = { width: rect.width, height: rect.height }
    }
  }

  onMounted(() => {
    updateSize()
    window.addEventListener('resize', updateSize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateSize)
  })

  return { size }
}

export const useDiagramUtils = () => {
  const scene = useScene()
  const uiStateStore = useUiStateStore()
  
  const rendererEl = computed(() => uiStateStore.rendererEl)
  const { size: rendererSize } = useSimpleResizeObserver(rendererEl.value)

  const getUnprojectedBounds = (): Size & Coords => {
    return getUnprojectedBoundsUtil(scene.currentView.value)
  }

  const getFitToViewParams = (viewportSize: Size) => {
    return getFitToViewParamsUtil(scene.currentView.value, viewportSize)
  }

  const fitToView = async () => {
    const { zoom, scroll } = getFitToViewParams(rendererSize.value)

    uiStateStore.setScroll({
      position: scroll,
      offset: CoordsUtils.zero()
    })
    uiStateStore.setZoom(zoom)
  }

  return {
    getUnprojectedBounds,
    fitToView,
    getFitToViewParams
  }
}