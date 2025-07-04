import { computed } from 'vue'
import {
  ModelItem,
  ViewItem,
  Connector,
  TextBox,
  Rectangle,
  ItemReference,
  LayerOrderingAction,
  View
} from 'src/types'
import { useUiStateStore } from 'src/stores/uiStateStore'
import { useModelStore } from 'src/stores/modelStore'
import { useSceneStore } from 'src/stores/sceneStore'
import * as reducers from 'src/stores/reducers'
import type { State } from 'src/stores/reducers/types'
import { getItemByIdOrThrow } from 'src/utils'
import {
  CONNECTOR_DEFAULTS,
  RECTANGLE_DEFAULTS,
  TEXTBOX_DEFAULTS
} from 'src/config'

// 默认视图结构
const DEFAULT_VIEW = {
  id: '',
  name: '',
  items: [] as ViewItem[],
  connectors: [] as Connector[],
  rectangles: [] as Rectangle[],
  textBoxes: [] as TextBox[]
} as const

export const useScene = () => {
  const modelStore = useModelStore()
  const sceneStore = useSceneStore()
  const uiStateStore = useUiStateStore()

  const currentViewId = computed(() => uiStateStore.view)

  const currentView = computed((): View => {
    if (!currentViewId.value || !modelStore.views?.length) {
      return DEFAULT_VIEW
    }
    try {
      const result = getItemByIdOrThrow(modelStore.views, currentViewId.value)
      return result.value as View
    } catch {
      return DEFAULT_VIEW
    }
  })

  const items = computed(() => {
    return currentView.value.items ?? []
  })

  const colors = computed(() => {
    return modelStore.colors ?? []
  })

  const connectors = computed(() => {
    const viewConnectors = currentView.value.connectors ?? []
    return viewConnectors.map((connector: Connector) => {
      const sceneConnector = sceneStore.connectors[connector.id]

      return {
        ...CONNECTOR_DEFAULTS,
        ...connector,
        ...sceneConnector
      }
    })
  })

  const rectangles = computed(() => {
    const viewRectangles = currentView.value.rectangles ?? []
    return viewRectangles.map((rectangle: Rectangle) => {
      return {
        ...RECTANGLE_DEFAULTS,
        ...rectangle
      }
    })
  })

  const textBoxes = computed(() => {
    const viewTextBoxes = currentView.value.textBoxes ?? []
    return viewTextBoxes.map((textBox: TextBox) => {
      const sceneTextBox = sceneStore.textBoxes[textBox.id]

      return {
        ...TEXTBOX_DEFAULTS,
        ...textBox,
        ...sceneTextBox
      }
    })
  })

  const getState = (): State => {
    return {
      model: modelStore.get(),
      scene: sceneStore.get()
    }
  }

  const setState = (newState: State) => {
    modelStore.set(newState.model)
    sceneStore.set(newState.scene)
  }

  const createModelItem = (newModelItem: ModelItem) => {
    const newState = reducers.createModelItem(newModelItem, getState())
    setState(newState)
  }

  const updateModelItem = (id: string, updates: Partial<ModelItem>) => {
    const newState = reducers.updateModelItem(id, updates, getState())
    setState(newState)
  }

  const deleteModelItem = (id: string) => {
    const newState = reducers.deleteModelItem(id, getState())
    setState(newState)
  }

  const createViewItem = (newViewItem: ViewItem) => {
    if (!currentViewId.value) return
    
    const newState = reducers.view({
      action: 'CREATE_VIEWITEM',
      payload: newViewItem,
      ctx: { viewId: currentViewId.value, state: getState() }
    })
    setState(newState)
  }

  const updateViewItem = (id: string, updates: Partial<ViewItem>) => {
    if (!currentViewId.value) return

    const newState = reducers.view({
      action: 'UPDATE_VIEWITEM',
      payload: { id, ...updates },
      ctx: { viewId: currentViewId.value, state: getState() }
    })
    setState(newState)
  }

  const deleteViewItem = (id: string) => {
    if (!currentViewId.value) return

    const newState = reducers.view({
      action: 'DELETE_VIEWITEM',
      payload: id,
      ctx: { viewId: currentViewId.value, state: getState() }
    })
    setState(newState)
  }

  const createConnector = (newConnector: Connector) => {
    if (!currentViewId.value) return

    const newState = reducers.view({
      action: 'CREATE_CONNECTOR',
      payload: newConnector,
      ctx: { viewId: currentViewId.value, state: getState() }
    })
    setState(newState)
  }

  const updateConnector = (id: string, updates: Partial<Connector>) => {
    if (!currentViewId.value) return

    const newState = reducers.view({
      action: 'UPDATE_CONNECTOR',
      payload: { id, ...updates },
      ctx: { viewId: currentViewId.value, state: getState() }
    })
    setState(newState)
  }

  const deleteConnector = (id: string) => {
    if (!currentViewId.value) return

    const newState = reducers.view({
      action: 'DELETE_CONNECTOR',
      payload: id,
      ctx: { viewId: currentViewId.value, state: getState() }
    })
    setState(newState)
  }

  const createTextBox = (newTextBox: TextBox) => {
    if (!currentViewId.value) return

    const newState = reducers.view({
      action: 'CREATE_TEXTBOX',
      payload: newTextBox,
      ctx: { viewId: currentViewId.value, state: getState() }
    })
    setState(newState)
  }

  const updateTextBox = (id: string, updates: Partial<TextBox>) => {
    if (!currentViewId.value) return

    const newState = reducers.view({
      action: 'UPDATE_TEXTBOX',
      payload: { id, ...updates },
      ctx: { viewId: currentViewId.value, state: getState() }
    })
    setState(newState)
  }

  const deleteTextBox = (id: string) => {
    if (!currentViewId.value) return

    const newState = reducers.view({
      action: 'DELETE_TEXTBOX',
      payload: id,
      ctx: { viewId: currentViewId.value, state: getState() }
    })
    setState(newState)
  }

  const createRectangle = (newRectangle: Rectangle) => {
    if (!currentViewId.value) return

    const newState = reducers.view({
      action: 'CREATE_RECTANGLE',
      payload: newRectangle,
      ctx: { viewId: currentViewId.value, state: getState() }
    })
    setState(newState)
  }

  const updateRectangle = (id: string, updates: Partial<Rectangle>) => {
    if (!currentViewId.value) return

    const newState = reducers.view({
      action: 'UPDATE_RECTANGLE',
      payload: { id, ...updates },
      ctx: { viewId: currentViewId.value, state: getState() }
    })
    setState(newState)
  }

  const deleteRectangle = (id: string) => {
    if (!currentViewId.value) return

    const newState = reducers.view({
      action: 'DELETE_RECTANGLE',
      payload: id,
      ctx: { viewId: currentViewId.value, state: getState() }
    })
    setState(newState)
  }

  const changeLayerOrder = (action: LayerOrderingAction, item: ItemReference) => {
    if (!currentViewId.value) return

    const newState = reducers.view({
      action: 'CHANGE_LAYER_ORDER',
      payload: { action, item },
      ctx: { viewId: currentViewId.value, state: getState() }
    })
    setState(newState)
  }

  return {
    items,
    connectors,
    colors,
    rectangles,
    textBoxes,
    currentView,
    createModelItem,
    updateModelItem,
    deleteModelItem,
    createViewItem,
    updateViewItem,
    deleteViewItem,
    createConnector,
    updateConnector,
    deleteConnector,
    createTextBox,
    updateTextBox,
    deleteTextBox,
    createRectangle,
    updateRectangle,
    deleteRectangle,
    changeLayerOrder
  }
}