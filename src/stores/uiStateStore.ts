import { defineStore } from 'pinia'
import {
  CoordsUtils,
  incrementZoom,
  decrementZoom,
  getStartingMode
} from 'src/utils'
import { UiState } from 'src/types'
import { INITIAL_UI_STATE } from 'src/config'

export const useUiStateStore = defineStore('uiState', {
  state: (): UiState => ({
    zoom: INITIAL_UI_STATE.zoom,
    scroll: INITIAL_UI_STATE.scroll,
    view: '',
    mainMenuOptions: [],
    editorMode: 'EXPLORABLE_READONLY',
    mode: getStartingMode('EXPLORABLE_READONLY'),
    iconCategoriesState: [],
    isMainMenuOpen: false,
    dialog: null,
    rendererEl: null,
    contextMenu: null,
    mouse: {
      position: { screen: CoordsUtils.zero(), tile: CoordsUtils.zero() },
      mousedown: null,
      delta: null
    },
    itemControls: null,
    enableDebugTools: false,
    selectedItems: [] as string[],
    showDebugInfo: false,
    showShortcutsGuide: false,
  }),

  actions: {
    setView(view: string) {
      this.view = view
    },
    setMainMenuOptions(mainMenuOptions: any) {
      this.mainMenuOptions = mainMenuOptions
    },
    setEditorMode(mode: any) {
      this.editorMode = mode
      this.mode = getStartingMode(mode)
    },
    setIconCategoriesState(iconCategoriesState: any) {
      this.iconCategoriesState = iconCategoriesState
    },
    resetUiState() {
      this.mode = getStartingMode(this.editorMode)
      this.scroll = {
        position: CoordsUtils.zero(),
        offset: CoordsUtils.zero()
      }
      this.itemControls = null
      this.zoom = 1
    },
    setMode(mode: any) {
      this.mode = mode
    },
    setDialog(dialog: any) {
      this.dialog = dialog
    },
    setIsMainMenuOpen(isMainMenuOpen: boolean) {
      this.isMainMenuOpen = isMainMenuOpen
      this.itemControls = null
    },
    incrementZoomLevel() {
      this.zoom = incrementZoom(this.zoom)
    },
    decrementZoomLevel() {
      this.zoom = decrementZoom(this.zoom)
    },
    setZoom(zoom: number) {
      this.zoom = zoom
    },
    setScroll({ position, offset }: any) {
      this.scroll = { position, offset: offset ?? this.scroll.offset }
    },
    setItemControls(itemControls: any) {
      this.itemControls = itemControls
    },
    setContextMenu(contextMenu: any) {
      this.contextMenu = contextMenu
    },
    setMouse(mouse: any) {
      this.mouse = mouse
    },
    setEnableDebugTools(enableDebugTools: boolean) {
      this.enableDebugTools = enableDebugTools
    },
    setRendererEl(el: HTMLDivElement | null) {
      this.rendererEl = el
    },
    setSelectedItems(selectedItems: string[]) {
      this.selectedItems = selectedItems
    },
    setShowDebugInfo(showDebugInfo: boolean) {
      this.showDebugInfo = showDebugInfo
    },
    setShowShortcutsGuide(showShortcutsGuide: boolean) {
      this.showShortcutsGuide = showShortcutsGuide
    }
  }
})