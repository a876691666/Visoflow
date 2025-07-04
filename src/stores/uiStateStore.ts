import { defineStore } from 'pinia'
import type { UiState, Mode, ItemControls, ContextMenu, Scroll, Mouse, IconCollectionState } from 'src/types'
import { CoordsUtils, incrementZoom, decrementZoom, getStartingMode } from 'src/utils'
import { INITIAL_UI_STATE } from 'src/config'
import { EditorModeEnum, DialogTypeEnum } from 'src/types'

export const useUiStateStore = defineStore('uiState', {
  state: (): UiState => ({
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
    zoom: INITIAL_UI_STATE.zoom,
    scroll: INITIAL_UI_STATE.scroll
  }),

  actions: {
    setView(view: string) {
      this.view = view
    },

    setMainMenuOptions(mainMenuOptions: UiState['mainMenuOptions']) {
      this.mainMenuOptions = mainMenuOptions
    },

    setEditorMode(mode: keyof typeof EditorModeEnum) {
      this.editorMode = mode
      this.mode = getStartingMode(mode)
    },

    setIconCategoriesState(iconCategoriesState: IconCollectionState[]) {
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

    setMode(mode: Mode) {
      this.mode = mode
    },

    setDialog(dialog: keyof typeof DialogTypeEnum | null) {
      this.dialog = dialog
    },

    setIsMainMenuOpen(isMainMenuOpen: boolean) {
      this.isMainMenuOpen = isMainMenuOpen
      this.itemControls = null
    },

    incrementZoom() {
      this.zoom = incrementZoom(this.zoom)
    },

    decrementZoom() {
      this.zoom = decrementZoom(this.zoom)
    },

    setZoom(zoom: number) {
      this.zoom = zoom
    },

    setScroll(scroll: Scroll) {
      this.scroll = scroll
    },

    setItemControls(itemControls: ItemControls | null) {
      this.itemControls = itemControls
    },

    setContextMenu(contextMenu: ContextMenu | null) {
      this.contextMenu = contextMenu
    },

    setMouse(mouse: Mouse) {
      this.mouse = mouse
    },

    setEnableDebugTools(enableDebugTools: boolean) {
      this.enableDebugTools = enableDebugTools
    },

    setRendererEl(el: HTMLDivElement | null) {
      this.rendererEl = el
    }
  }
}) 