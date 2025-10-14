import { reactive } from 'vue';
import type {
  UiState,
  Mode,
  ItemControls,
  ContextMenu,
  Scroll,
  Mouse,
  IconCollectionState,
  UiStateStore
} from 'src/types';
import {
  CoordsUtils,
  incrementZoom,
  decrementZoom,
  getStartingMode
} from 'src/utils';
import { INITIAL_UI_STATE } from 'src/config';
import { EditorModeEnum, DialogTypeEnum } from 'src/types';

let _store: UiStateStore | null = null;

export function useUiStateStore(): UiStateStore {
  if (_store) return _store;

  const state: UiState = {
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
  };

  const store = reactive({
    // state
    ...state,

    // actions
    setView(view: string) {
      store.view = view;
    },

    setMainMenuOptions(mainMenuOptions: UiState['mainMenuOptions']) {
      store.mainMenuOptions = mainMenuOptions;
    },

    setEditorMode(mode: keyof typeof EditorModeEnum) {
      store.editorMode = mode;
      store.mode = getStartingMode(mode);
    },

    setIconCategoriesState(iconCategoriesState: IconCollectionState[]) {
      store.iconCategoriesState = iconCategoriesState;
    },

    resetUiState() {
      store.mode = getStartingMode(store.editorMode);
      store.scroll = {
        position: CoordsUtils.zero(),
        offset: CoordsUtils.zero()
      };
      store.itemControls = null;
      store.zoom = 1;
    },

    setMode(mode: Mode) {
      store.mode = mode;
    },

    setDialog(dialog: keyof typeof DialogTypeEnum | null) {
      store.dialog = dialog;
    },

    setIsMainMenuOpen(isMainMenuOpen: boolean) {
      store.isMainMenuOpen = isMainMenuOpen;
      store.itemControls = null;
    },

    incrementZoom() {
      const { zoom, scroll } = incrementZoom(store.zoom, store.scroll);
      store.zoom = zoom;
      store.scroll = scroll;
    },

    decrementZoom() {
      const { zoom, scroll } = decrementZoom(store.zoom, store.scroll);
      store.zoom = zoom;
      store.scroll = scroll;
    },

    setZoom(zoom: number) {
      store.zoom = zoom;
    },

    setScroll(scroll: Scroll) {
      store.scroll = scroll;
    },

    setItemControls(itemControls: ItemControls | null) {
      store.itemControls = itemControls;
    },

    setContextMenu(contextMenu: ContextMenu | null) {
      store.contextMenu = contextMenu;
    },

    setMouse(mouse: Mouse) {
      store.mouse = mouse;
    },

    setEnableDebugTools(enableDebugTools: boolean) {
      store.enableDebugTools = enableDebugTools;
    },

    setRendererEl(el: HTMLDivElement | null) {
      store.rendererEl = el;
    }
  }) as unknown as UiStateStore;

  _store = store;
  return store;
}
