import { ref, watch, computed } from 'vue';
import {
  ModelItem,
  ViewItem,
  Connector,
  TextBox,
  Rectangle,
  ItemReference,
  LayerOrderingAction,
  SceneConnector,
  SceneTextBox
} from 'src/types';
import {
  useIsoflowModelStore,
  useIsoflowSceneStore,
  useIsoflowUiStateStore
} from 'src/context/isoflowContext';
import * as reducers from 'src/stores/reducers';
import type { State } from 'src/stores/reducers/types';
import { getItemByIdOrThrow } from 'src/utils';
import {
  CONNECTOR_DEFAULTS,
  RECTANGLE_DEFAULTS,
  TEXTBOX_DEFAULTS
} from 'src/config';

// 响应式数据
const currentView = ref<any>(null);
const items = ref<ViewItem[]>([]);
const colors = ref<any[]>([]);
const connectors = ref<(Connector & SceneConnector)[]>([]);
const rectangles = ref<Rectangle[]>([]);
const textBoxes = ref<(TextBox & SceneTextBox)[]>([]);

let watchTextBoxes: any;

export const useScene = () => {
  const modelStore = useIsoflowModelStore<any>();
  const sceneStore = useIsoflowSceneStore<any>();
  const uiStateStore = useIsoflowUiStateStore<any>();

  // 更新当前视图
  const updateCurrentView = () => {
    if (uiStateStore.view && modelStore.views) {
      currentView.value = getItemByIdOrThrow(
        modelStore.views,
        uiStateStore.view
      ).value;
    } else {
      currentView.value = null;
    }
  };

  // 更新items
  const updateItems = () => {
    items.value = currentView.value?.items ?? [];
  };

  // 更新colors
  const updateColors = () => {
    colors.value = modelStore.colors;
  };

  // 更新connectors
  const updateConnectors = () => {
    if (!currentView.value) return;
    connectors.value = (currentView.value.connectors ?? []).map(
      (connector: any) => {
        const sceneConnector = sceneStore.connectors[connector.id];
        return {
          ...CONNECTOR_DEFAULTS,
          ...connector,
          ...sceneConnector
        };
      }
    );
  };

  // 更新rectangles
  const updateRectangles = () => {
    if (!currentView.value) return;
    rectangles.value = (currentView.value.rectangles ?? []).map(
      (rectangle: any) => {
        return {
          ...RECTANGLE_DEFAULTS,
          ...rectangle
        };
      }
    );
  };

  // 更新textBoxes
  const updateTextBoxes = () => {
    if (!currentView.value) return;
    textBoxes.value = (currentView.value.textBoxes ?? []).map(
      (textBox: any) => {
        const sceneTextBox = sceneStore.textBoxes[textBox.id];
        return {
          ...TEXTBOX_DEFAULTS,
          ...textBox,
          ...sceneTextBox
        };
      }
    );
  };

  // 监听变化
  // Consolidate watchers using computed dependencies
  const currentViewId = computed(() => uiStateStore.view);
  const modelViews = computed(() => modelStore.views);
  const sceneConnectors = computed(() => sceneStore.connectors);
  const sceneTextBoxes = computed(() => sceneStore.textBoxes);
  const modelColors = computed(() => modelStore.colors);

  watch([currentViewId, modelViews], updateCurrentView, { immediate: true });
  watch(() => currentView.value?.items, updateItems, { immediate: true });
  watch(modelColors, updateColors, { immediate: true });
  watch(
    () => [currentView.value?.connectors, sceneConnectors.value],
    updateConnectors,
    { immediate: true }
  );
  watch(() => currentView.value?.rectangles, updateRectangles, {
    immediate: true
  });
  if (watchTextBoxes) watchTextBoxes();
  watchTextBoxes = watch(
    () => [currentView.value?.textBoxes, sceneTextBoxes.value],
    updateTextBoxes,
    { immediate: true }
  );

  // 辅助方法
  const getState = (): State => {
    // Accept Pinia store state shape directly
    return {
      model: (modelStore as any).$state ?? modelStore,
      scene: (sceneStore as any).$state ?? sceneStore
    };
  };

  const setState = (newState: State) => {
    modelStore.loadData(newState.model);
    sceneStore.updateConnectors(newState.scene.connectors);
    sceneStore.updateTextBoxes(newState.scene.textBoxes);
  };

  // CRUD 操作
  const createModelItem = (newModelItem: ModelItem) => {
    const newState = reducers.createModelItem(newModelItem, getState());
    setState(newState);
  };

  const updateModelItem = (id: string, updates: Partial<ModelItem>) => {
    const newState = reducers.updateModelItem(id, updates, getState());
    setState(newState);
  };

  const deleteModelItem = (id: string) => {
    const newState = reducers.deleteModelItem(id, getState());
    setState(newState);
  };

  const createViewItem = (newViewItem: ViewItem) => {
    const newState = reducers.view({
      action: 'CREATE_VIEWITEM',
      payload: newViewItem,
      ctx: { viewId: uiStateStore.view, state: getState() }
    });
    setState(newState);
  };

  const updateViewItem = (id: string, updates: Partial<ViewItem>) => {
    const newState = reducers.view({
      action: 'UPDATE_VIEWITEM',
      payload: { id, ...updates },
      ctx: { viewId: uiStateStore.view, state: getState() }
    });
    setState(newState);
  };

  const deleteViewItem = (id: string) => {
    const newState = reducers.view({
      action: 'DELETE_VIEWITEM',
      payload: id,
      ctx: { viewId: uiStateStore.view, state: getState() }
    });
    setState(newState);
  };

  const createConnector = (newConnector: Connector) => {
    const newState = reducers.view({
      action: 'CREATE_CONNECTOR',
      payload: newConnector,
      ctx: { viewId: uiStateStore.view, state: getState() }
    });
    setState(newState);
  };

  const updateConnector = (id: string, updates: Partial<Connector>) => {
    const newState = reducers.view({
      action: 'UPDATE_CONNECTOR',
      payload: { id, ...updates },
      ctx: { viewId: uiStateStore.view, state: getState() }
    });
    setState(newState);
  };

  const deleteConnector = (id: string) => {
    const newState = reducers.view({
      action: 'DELETE_CONNECTOR',
      payload: id,
      ctx: { viewId: uiStateStore.view, state: getState() }
    });
    setState(newState);
  };

  const createTextBox = (newTextBox: TextBox) => {
    const newState = reducers.view({
      action: 'CREATE_TEXTBOX',
      payload: newTextBox,
      ctx: { viewId: uiStateStore.view, state: getState() }
    });
    setState(newState);
  };

  const updateTextBox = (id: string, updates: Partial<TextBox>) => {
    const newState = reducers.view({
      action: 'UPDATE_TEXTBOX',
      payload: { id, ...updates },
      ctx: { viewId: uiStateStore.view, state: getState() }
    });
    setState(newState);
  };

  const deleteTextBox = (id: string) => {
    const newState = reducers.view({
      action: 'DELETE_TEXTBOX',
      payload: id,
      ctx: { viewId: uiStateStore.view, state: getState() }
    });
    setState(newState);
  };

  const createRectangle = (newRectangle: Rectangle) => {
    const newState = reducers.view({
      action: 'CREATE_RECTANGLE',
      payload: newRectangle,
      ctx: { viewId: uiStateStore.view, state: getState() }
    });
    setState(newState);
  };

  const updateRectangle = (id: string, updates: Partial<Rectangle>) => {
    const newState = reducers.view({
      action: 'UPDATE_RECTANGLE',
      payload: { id, ...updates },
      ctx: { viewId: uiStateStore.view, state: getState() }
    });
    setState(newState);
  };

  const deleteRectangle = (id: string) => {
    const newState = reducers.view({
      action: 'DELETE_RECTANGLE',
      payload: id,
      ctx: { viewId: uiStateStore.view, state: getState() }
    });
    setState(newState);
  };

  const updateLayerOrdering = (
    action: LayerOrderingAction,
    item: ItemReference
  ) => {
    const newState = reducers.view({
      action: 'CHANGE_LAYER_ORDER',
      payload: { action, item },
      ctx: { viewId: uiStateStore.view, state: getState() }
    });
    setState(newState);
  };

  return {
    currentView,
    items,
    colors,
    connectors,
    rectangles,
    textBoxes,
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
    updateLayerOrdering
  };
};
