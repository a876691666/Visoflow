import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useModelStore } from 'src/stores/modelStore'
import { useUiStateStore } from 'src/stores/uiStateStore'
import { ModeActions, State, SlimMouseEvent } from 'src/types'
import { getMouse, getItemAtTile } from 'src/utils'
import { useResizeObserver } from 'src/composables/useResizeObserver'
import { useScene } from 'src/composables/useScene'
// TODO: Re-implement interaction modes for Vue3
// import { Cursor } from '../interaction/modes/Cursor'
// import { DragItems } from '../interaction/modes/DragItems'
// import { DrawRectangle } from '../interaction/modes/Rectangle/DrawRectangle'
// import { TransformRectangle } from '../interaction/modes/Rectangle/TransformRectangle'
// import { Connector } from '../interaction/modes/Connector'
// import { Pan } from '../interaction/modes/Pan'
// import { PlaceIcon } from '../interaction/modes/PlaceIcon'
// import { TextBox } from '../interaction/modes/TextBox'

const modes: { [k in string]: ModeActions } = {
  // TODO: Re-implement modes for Vue3
}

const getModeFunction = (mode: ModeActions, e: SlimMouseEvent) => {
  switch (e.type) {
    case 'mousemove':
      return mode.mousemove
    case 'mousedown':
      return mode.mousedown
    case 'mouseup':
      return mode.mouseup
    default:
      return null
  }
}

export const useInteractionManager = () => {
  const rendererRef = ref<HTMLElement>()
  const reducerTypeRef = ref<string>()
  
  const modelStore = useModelStore()
  const uiStateStore = useUiStateStore()
  const scene = useScene()
  
  const { size: rendererSize } = useResizeObserver(uiStateStore.rendererEl)

  const onMouseEvent = (e: SlimMouseEvent) => {
    if (!rendererRef.value) return

    const mode = modes[uiStateStore.mode.type]
    const modeFunction = getModeFunction(mode, e)

    if (!modeFunction) return

    const nextMouse = getMouse({
      interactiveElement: rendererRef.value,
      zoom: uiStateStore.zoom,
      scroll: uiStateStore.scroll,
      lastMouse: uiStateStore.mouse,
      mouseEvent: e,
      rendererSize: rendererSize.value
    })

    uiStateStore.setMouse(nextMouse)

    const baseState: State = {
      model: modelStore,
      scene: scene,
      uiState: uiStateStore,
      rendererRef: rendererRef.value,
      rendererSize: rendererSize.value,
      isRendererInteraction: rendererRef.value === e.target
    }

    if (reducerTypeRef.value !== uiStateStore.mode.type) {
      const prevReducer = reducerTypeRef.value
        ? modes[reducerTypeRef.value]
        : null

      if (prevReducer && prevReducer.exit) {
        prevReducer.exit(baseState)
      }

      if (mode.entry) {
        mode.entry(baseState)
      }
    }

    modeFunction(baseState)
    reducerTypeRef.value = uiStateStore.mode.type
  }

  const onContextMenu = (e: SlimMouseEvent) => {
    e.preventDefault()

    const itemAtTile = getItemAtTile({
      tile: uiStateStore.mouse.position.tile,
      scene: scene
    })

    if (itemAtTile?.type === 'RECTANGLE') {
      uiStateStore.setContextMenu({
        item: itemAtTile,
        tile: uiStateStore.mouse.position.tile
      })
    } else if (uiStateStore.contextMenu) {
      uiStateStore.setContextMenu(null)
    }
  }

  const setupEventListeners = () => {
    if (uiStateStore.mode.type === 'INTERACTIONS_DISABLED') return

    const el = window

    const onTouchStart = (e: TouchEvent) => {
      onMouseEvent({
        ...e,
        clientX: Math.floor(e.touches[0].clientX),
        clientY: Math.floor(e.touches[0].clientY),
        type: 'mousedown'
      })
    }

    const onTouchMove = (e: TouchEvent) => {
      onMouseEvent({
        ...e,
        clientX: Math.floor(e.touches[0].clientX),
        clientY: Math.floor(e.touches[0].clientY),
        type: 'mousemove'
      })
    }

    const onTouchEnd = (e: TouchEvent) => {
      onMouseEvent({
        ...e,
        clientX: 0,
        clientY: 0,
        type: 'mouseup'
      })
    }

    const onScroll = (e: WheelEvent) => {
      if (e.deltaY > 0) {
        uiStateStore.decrementZoom()
      } else {
        uiStateStore.incrementZoom()
      }
    }

    el.addEventListener('mousemove', onMouseEvent)
    el.addEventListener('mousedown', onMouseEvent)
    el.addEventListener('mouseup', onMouseEvent)
    el.addEventListener('contextmenu', onContextMenu)
    el.addEventListener('touchstart', onTouchStart)
    el.addEventListener('touchmove', onTouchMove)
    el.addEventListener('touchend', onTouchEnd)
    uiStateStore.rendererEl?.addEventListener('wheel', onScroll)

    return () => {
      el.removeEventListener('mousemove', onMouseEvent)
      el.removeEventListener('mousedown', onMouseEvent)
      el.removeEventListener('mouseup', onMouseEvent)
      el.removeEventListener('contextmenu', onContextMenu)
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
      uiStateStore.rendererEl?.removeEventListener('wheel', onScroll)
    }
  }

  let cleanup: (() => void) | undefined

  onMounted(() => {
    cleanup = setupEventListeners()
  })

  onUnmounted(() => {
    cleanup?.()
  })

  watch(() => uiStateStore.mode.type, () => {
    // Re-setup event listeners when mode changes
    cleanup?.()
    cleanup = setupEventListeners()
  })

  const setInteractionsElement = (element: HTMLElement) => {
    rendererRef.value = element
  }

  return {
    setInteractionsElement
  }
}