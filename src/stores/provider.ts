import { INITIAL_DATA, RECTANGLE_DEFAULTS, DEFAULT_COLOR } from 'src/config';
import {
  Connector,
  Model,
  Rectangle,
  Scene,
  TextBox,
  View,
  ViewItem,
  GroundConfig
} from 'src/types';
import { inject, InjectionKey, provide } from 'vue';
import { shallowRef, triggerRef } from 'vue';
import { syncConnector } from './reducers/connector';
import { syncTextBox } from './reducers/textBox';
import mitt from 'mitt';

export type Connectors = (Connector & Scene['connectors'][string])[];
export type TextBoxs = (TextBox & Scene['textBoxes'][string])[];
export type Icons = Model['icons'];
export type Colors = Model['colors'];
export type Items = ViewItem[];
export type Views = View[];
export type Rectangles = Rectangle[];

// 通用顺序工具：置顶/置底（可复用）
const moveToTop = <T extends { id: string }>(arr: T[], id: string) => {
  const from = arr.findIndex((i) => i.id === id);
  if (from <= 0) return { list: arr, from, to: from };
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.unshift(item);
  return { list: copy, from, to: 0 } as const;
};
const moveToBottom = <T extends { id: string }>(arr: T[], id: string) => {
  const from = arr.findIndex((i) => i.id === id);
  if (from === -1 || from === arr.length - 1)
    return { list: arr, from, to: from };
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.push(item);
  return { list: copy, from, to: copy.length - 1 } as const;
};

// 通用移动：上/下/置顶/置底
const moveInArray = <T extends { id: string }>(
  arr: T[],
  id: string,
  action: 'up' | 'down' | 'top' | 'bottom'
) => {
  const idx = arr.findIndex((i) => i.id === id);
  if (idx === -1) return { list: arr, from: -1, to: -1 } as const;
  if (action === 'top') return moveToTop(arr, id) as any;
  if (action === 'bottom') return moveToBottom(arr, id) as any;

  const temp = [...arr];
  const [item] = temp.splice(idx, 1);
  let to = idx;
  switch (action) {
    case 'up':
      to = Math.max(0, idx - 1);
      break;
    case 'down':
      to = Math.min(temp.length, idx + 1);
      break;
  }
  temp.splice(to, 0, item);
  return { list: temp, from: idx, to } as const;
};

export const useProvider = () => {
  const connectors = shallowRef<Connectors>([]);
  const textBoxs = shallowRef<TextBoxs>([]);
  const colors = shallowRef<Model['colors']>([]);
  const icons = shallowRef<Model['icons']>([]);
  const items = shallowRef<Items>([]);
  const rectangles = shallowRef<Rectangle[]>([]);
  const view = shallowRef<string>('');
  const views = shallowRef<View[]>([]);
  const model = shallowRef<Model>(INITIAL_DATA);
  const groundConfig = shallowRef<GroundConfig>({
    fill: 'none',
    stroke: '#000000',
    strokeOpacity: 0.15,
    strokeWidth: 5
  });
  // 额外线条模式（独立于 uiStateStore），为 true 时仅线条交互，其它元素不可选且半透明
  const lineMode = shallowRef<boolean>(false);

  const eventBus = mitt();

  const triggerMaps = {
    connectors,
    textBoxs,
    colors,
    icons,

    model,
    items,
    views,
    rectangles,
    groundConfig,
    lineMode
  } as const;

  // 通用触发更新函数
  const triggerUpdate = (refName: keyof typeof triggerMaps) => {
    triggerRef(triggerMaps[refName]);
  };

  // // 更新connectors
  // const updateConnectors = () => {
  //   connectors.value = (currentView.value.connectors ?? []).map(
  //     (connector: any) => {
  //       const sceneConnector = sceneStore.getConnector(connector.id);
  //       return {
  //         ...CONNECTOR_DEFAULTS,
  //         ...connector,
  //         ...sceneConnector
  //       };
  //     }
  //   );
  // };

  // // 更新textBoxs
  // const updateTextBoxs = () => {
  //   textBoxs.value = (currentView.value.textBoxs ?? []).map((textBox: any) => {
  //     const sceneTextBox = sceneStore.getTextBox(textBox.id);
  //     return {
  //       ...TEXTBOX_DEFAULTS,
  //       ...textBox,
  //       ...sceneTextBox
  //     };
  //   });
  // };

  // ===== 提取的独立函数定义 START =====
  // connectors
  const getConnectors = () => connectors.value;
  const getConnector = (id: string) =>
    connectors.value.find((c) => c.id === id);
  const updateConnectors = (newConnectors: Connectors) => {
    connectors.value = newConnectors;
  };
  const addConnector = (connector: Connectors[number]) => {
    connectors.value = [...connectors.value, connector];

    const view = getCurrentView();
    if (view) {
      if (!view.connectors) view.connectors = [];
      if (!view.connectors.find((c) => c.id === connector.id)) {
        view.connectors.push(connector);
      }
    }

    return connector;
  };
  const removeConnector = (id: string) => {
    connectors.value = connectors.value.filter((c) => c.id !== id);

    const view = getCurrentView();
    if (view && view.connectors) {
      view.connectors = view.connectors.filter((c) => c.id !== id);
    }
  };
  const updateConnector = (
    id: string,
    connector: Partial<Connectors[number]>
  ) => {
    const index = connectors.value.findIndex((c) => c.id === id);
    if (index !== -1) {
      connectors.value[index] = {
        ...connectors.value[index],
        ...connector
      };
      triggerUpdate('connectors');

      const view = getCurrentView();
      if (view && view.connectors) {
        const vIndex = view.connectors.findIndex((c) => c.id === id);
        if (vIndex !== -1) {
          view.connectors[vIndex] = {
            ...view.connectors[vIndex],
            ...connector
          };
        }
      }

      return connectors.value[index];
    } else {
      return addConnector({ ...connector, id } as Connectors[number]);
    }
  };

  // textBoxs
  const getTextBoxs = () => textBoxs.value;
  const getTextBox = (id: string) => textBoxs.value.find((t) => t.id === id);
  const updateTextBoxs = (newTextBoxs: TextBoxs) => {
    textBoxs.value = newTextBoxs;
  };
  const updateTextBox = (
    id: string,
    textBox: Partial<TextBoxs[number]>,
    noSync = false
  ) => {
    const index = textBoxs.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      textBoxs.value[index] = { ...textBoxs.value[index], ...textBox };
      triggerUpdate('textBoxs');

      // 同步更新当前视图中的 textBoxes
      const view = getCurrentView();
      if (view && view.textBoxes) {
        const vIndex = view.textBoxes.findIndex((t) => t.id === id);
        if (vIndex !== -1) {
          view.textBoxes[vIndex] = {
            ...view.textBoxes[vIndex],
            ...textBox
          } as any;
        }
      }

      if (!noSync) {
        syncTextBox(id, { getCurrentView, updateTextBox } as any);
      }
      return textBoxs.value[index];
    } else {
      return addTextBox({ ...textBox, id } as TextBoxs[number]);
    }
  };
  const addTextBox = (textBox: TextBoxs[number]) => {
    textBoxs.value = [...textBoxs.value, textBox];

    // 同步添加到当前视图的 textBoxes
    const view = getCurrentView();
    if (view) {
      if (!view.textBoxes) view.textBoxes = [];
      if (!view.textBoxes.find((t) => t.id === textBox.id)) {
        view.textBoxes.push(textBox as any);
      }
    }

    syncTextBox(textBox.id, { getCurrentView, updateTextBox } as any);
    return textBox;
  };
  const removeTextBox = (id: string) => {
    textBoxs.value = textBoxs.value.filter((t) => t.id !== id);

    // 同步从当前视图移除
    const view = getCurrentView();
    if (view && view.textBoxes) {
      view.textBoxes = view.textBoxes.filter((t) => t.id !== id);
    }
  };

  // 同步当前视图某数组顺序（textBoxes/rectangles）
  const syncViewOrder = (
    kind: 'textBoxes' | 'rectangles',
    id: string,
    to: number
  ) => {
    const v = getCurrentView();
    if (!v || !(v as any)[kind]) return;
    const vArr = [...(v as any)[kind]];
    const vIdx = vArr.findIndex((it: any) => it.id === id);
    if (vIdx === -1) return;
    const [vItem] = vArr.splice(vIdx, 1);
    vArr.splice(to, 0, vItem as any);
    (v as any)[kind] = vArr as any;
  };

  // 新增：调整 TextBox 在列表中的顺序
  const moveTextBox = (
    id: string,
    action: 'up' | 'down' | 'top' | 'bottom'
  ) => {
    const res = moveInArray(textBoxs.value, id, action);
    textBoxs.value = res.list as any;
    triggerUpdate('textBoxs');
    if (res.to >= 0) syncViewOrder('textBoxes', id, res.to);
  };

  // icons
  const getIcons = () => icons.value;
  const getIcon = (id: string) => icons.value.find((icon) => icon.id === id);
  const updateIcons = (newIcons: Model['icons']) => {
    icons.value = newIcons;
  };
  const updateIcon = (id: string, icon: Model['icons'][number]) => {
    const index = icons.value.findIndex((i) => i.id === id);
    if (index !== -1) {
      icons.value[index] = { ...icons.value[index], ...icon };
      triggerUpdate('icons');
    }
  };
  const addIcon = (icon: Model['icons'][number]) => {
    icons.value = [...icons.value, icon];
  };
  const removeIcon = (id: string) => {
    icons.value = icons.value.filter((icon) => icon.id !== id);
  };

  // colors
  const getColors = () => colors.value;
  const updateColors = (newColors: Model['colors']) => {
    colors.value = newColors;
    triggerUpdate('colors');
  };
  const addColor = (color: Model['colors'][number]) => {
    // 防重复添加同 id
    if (!colors.value.find((c) => c.id === color.id)) {
      colors.value = [...colors.value, color];
      triggerUpdate('colors');
    }
    return color;
  };
  const updateColor = (
    id: string,
    updates: Partial<Model['colors'][number]>
  ) => {
    const index = colors.value.findIndex((c) => c.id === id);
    if (index !== -1) {
      colors.value[index] = { ...colors.value[index], ...updates } as any;
      triggerUpdate('colors');
      return colors.value[index];
    }
    // 如果不存在则按新增处理
    return addColor({
      id,
      value: (updates as any)?.value ?? DEFAULT_COLOR.value
    });
  };
  const removeColor = (id: string) => {
    const next = colors.value.filter((c) => c.id !== id);
    colors.value = next.length > 0 ? next : [DEFAULT_COLOR];
    triggerUpdate('colors');
  };

  // 顶层 model.items 已移除，全部通过当前视图 items 管理

  // items
  const getItems = () => items.value;
  const getItem = (id: string) => items.value.find((item) => item.id === id);
  const updateItems = (newItems: Items) => {
    items.value = newItems;
  };
  const updateItem = (id: string, item: Partial<Items[number]>) => {
    const index = items.value.findIndex((i) => i.id === id);
    if (index !== -1) {
      items.value[index] = { ...items.value[index], ...item };
      triggerUpdate('items');
      // 同步到当前视图
      const _view = getCurrentView();
      if (_view) {
        const vIndex = _view.items.findIndex((i) => i.id === id);
        if (vIndex !== -1) {
          _view.items[vIndex] = { ..._view.items[vIndex], ...item } as any;
        }
      }
    }
  };
  const addItem = (item: Items[number]) => {
    items.value = [...items.value, item];
    const _view = getCurrentView();
    if (_view) {
      if (!_view.items.find((i) => i.id === item.id)) {
        _view.items.push(item);
      }
    }
  };
  const removeItem = (id: string) => {
    items.value = items.value.filter((item) => item.id !== id);
    const _view = getCurrentView();
    if (_view) {
      _view.items = _view.items.filter((i) => i.id !== id);
    }
  };

  // rectangles
  const getRectangles = () => rectangles.value;
  const getRectangle = (id: string) =>
    rectangles.value.find((rect) => rect.id === id);
  const updateRectangles = (newRectangles: Rectangle[]) => {
    rectangles.value = newRectangles;
  };
  const updateRectangle = (id: string, rectangle: Partial<Rectangle>) => {
    const index = rectangles.value.findIndex((r) => r.id === id);
    if (index !== -1) {
      rectangles.value[index] = { ...rectangles.value[index], ...rectangle };
      triggerUpdate('rectangles');

      // 同步到当前视图
      const _view = getCurrentView();
      if (_view) {
        if (!_view.rectangles) _view.rectangles = [];
        const vIndex = _view.rectangles.findIndex((r) => r.id === id);
        if (vIndex !== -1) {
          _view.rectangles[vIndex] = {
            ..._view.rectangles[vIndex],
            ...rectangle
          };
        }
      }
    }
  };
  const addRectangle = (rectangle: Rectangle) => {
    rectangles.value = [...rectangles.value, rectangle];

    // 同步到当前视图
    const _view = getCurrentView();
    if (_view) {
      if (!_view.rectangles) _view.rectangles = [];
      if (!_view.rectangles.find((r) => r.id === rectangle.id)) {
        _view.rectangles.push(rectangle);
      }
    }
  };
  const removeRectangle = (id: string) => {
    rectangles.value = rectangles.value.filter((rect) => rect.id !== id);

    // 同步从当前视图移除
    const _view = getCurrentView();
    if (_view && _view.rectangles) {
      _view.rectangles = _view.rectangles.filter((r) => r.id !== id);
    }
  };

  // 新增：调整 Rectangle 在列表中的顺序
  const moveRectangle = (
    id: string,
    action: 'up' | 'down' | 'top' | 'bottom'
  ) => {
    const res = moveInArray(rectangles.value, id, action);
    rectangles.value = res.list as any;
    triggerUpdate('rectangles');
    if (res.to >= 0) syncViewOrder('rectangles', id, res.to);
  };

  // groundConfig
  const getGroundConfig = () => groundConfig.value;
  const updateGroundConfig = (config: Partial<GroundConfig>) => {
    groundConfig.value = { ...groundConfig.value, ...config };
    triggerUpdate('groundConfig');

    // 同步到当前视图的 scene.groundConfig
    const currentView = getCurrentView();
    if (currentView) {
      if (!(currentView as any).scene) {
        (currentView as any).scene = {};
      }
      (currentView as any).scene.groundConfig = groundConfig.value;
    }
  };
  const setGroundConfig = (config: GroundConfig) => {
    groundConfig.value = config;
    triggerUpdate('groundConfig');

    // 同步到当前视图的 scene.groundConfig
    const currentView = getCurrentView();
    if (currentView) {
      if (!(currentView as any).scene) {
        (currentView as any).scene = {};
      }
      (currentView as any).scene.groundConfig = config;
    }
  };

  // 全局 groundConfig 配置
  const getGlobalGroundConfig = () => model.value?.global?.scene || {};
  const updateGlobalGroundConfig = (config: Partial<GroundConfig>) => {
    if (!model.value.global) {
      model.value.global = { scene: {} };
    }
    if (!model.value.global.scene) {
      model.value.global.scene = {};
    }
    model.value.global.scene = { ...model.value.global.scene, ...config };
    triggerUpdate('model');
  };
  const setGlobalGroundConfig = (config: GroundConfig) => {
    if (!model.value.global) {
      model.value.global = { scene: {} };
    }
    model.value.global.scene = config;
    triggerUpdate('model');
  };

  // 线条模式开关
  const getLineMode = () => lineMode.value;
  const setLineMode = (val: boolean) => {
    lineMode.value = !!val;
    triggerUpdate('lineMode');
  };

  // views
  const getViews = () => views.value;
  const getView = (id: string) => views.value.find((v) => v.id === id);
  const getCurrentView = () => getView(view.value);
  const updateViews = (newViews: View[]) => {
    views.value = newViews;
  };
  const setCurrentView = (id: string) => {
    view.value = id;

    const _view = getView(id);
    if (_view) {
      // 使用视图内 items 作为源数据
      updateItems(_view.items || []);
      updateRectangles(
        (_view.rectangles || []).map((rectangle) => ({
          ...RECTANGLE_DEFAULTS,
          ...rectangle
        }))
      );
      // 简单同步文本与连线（无需默认值合并也可工作）
      updateTextBoxs((_view.textBoxes as any) || []);
      updateConnectors((_view.connectors as any) || []);

      // 同步 groundConfig
      if (_view.scene?.groundConfig) {
        groundConfig.value = _view.scene.groundConfig;
      } else {
        // 使用默认值
        groundConfig.value = {
          fill: 'none',
          stroke: '#000000',
          strokeOpacity: 0.15,
          strokeWidth: 5
        };
      }

      _view?.connectors?.forEach((connector) => {
        syncConnector(connector.id, {
          getCurrentView,
          removeConnector,
          model,
          updateConnector
        } as any);
      });

      _view?.textBoxes?.forEach((textBox) => {
        syncTextBox(textBox.id, { getCurrentView, updateTextBox } as any);
      });
    } else {
      // 清空当前工作集
      updateItems([]);
      updateRectangles([]);
      updateTextBoxs([]);
      updateConnectors([]);
      // 重置 groundConfig
      groundConfig.value = {
        fill: 'none',
        stroke: '#000000',
        strokeOpacity: 0.15,
        strokeWidth: 5
      };
    }
    triggerUpdate('views');
  };
  const updateView = (id: string, viewData: View) => {
    const index = views.value.findIndex((v) => v.id === id);
    if (index !== -1) {
      views.value[index] = { ...views.value[index], ...viewData };
      triggerUpdate('views');
      // 如果更新的是当前视图，保持工作集同步
      if (view.value === id) {
        setCurrentView(id);
      }
    }
  };
  const addView = (viewData: View) => {
    views.value = [...views.value, viewData];
    // 如尚未选择视图，则选中新建视图
    if (!view.value) {
      setCurrentView(viewData.id);
    }
  };
  const removeView = (id: string) => {
    const wasCurrent = view.value === id;
    views.value = views.value.filter((v) => v.id !== id);
    if (wasCurrent) {
      const next = views.value[0];
      setCurrentView(next ? next.id : '');
    }
  };

  // model
  const getModel = () => model.value;
  const updateModel = (newModel: Model) => {
    model.value = newModel;

    updateViews(newModel.views);
    updateColors(newModel.colors);
    updateIcons(newModel.icons);

    // 如果有当前视图，加载其 groundConfig
    const currentView = getCurrentView();
    if (currentView?.scene?.groundConfig) {
      groundConfig.value = currentView.scene.groundConfig;
    } else {
      // 使用默认值
      groundConfig.value = {
        fill: 'none',
        stroke: '#000000',
        strokeOpacity: 0.15,
        strokeWidth: 5
      };
    }
    triggerUpdate('groundConfig');
  };

  // 将当前状态整理为可导出的 Model（确保所有数据已同步）
  const getExportModel = (): Model => {
    // 基于当前 model 创建一个浅拷贝
    const exportModel: Model = JSON.parse(JSON.stringify(model.value));

    // 同步当前的 views 状态到导出模型
    exportModel.views = JSON.parse(JSON.stringify(views.value));

    // 同步 icons 状态
    icons.value.forEach((icon) => {
      const ei = exportModel.icons.findIndex((ic) => ic.id === icon.id);
      if (ei !== -1) {
        exportModel.icons[ei] = {
          ...exportModel.icons[ei],
          ...icon
        };
      } else {
        // 如果不存在则补齐（通常不会发生，但以防万一）
        exportModel.icons.push(icon);
      }
    });

    // 同步 colors 状态
    exportModel.colors = JSON.parse(JSON.stringify(colors.value));

    return exportModel;
  };

  // 返回 JSON 字符串（不触发下载，供外部自行处理）
  const exportModelAsJSON = (): string => {
    return JSON.stringify(getExportModel());
  };

  // ===== 提取的独立函数定义 END =====

  return {
    triggerUpdate,

    // connectors
    connectors,
    getConnectors,
    getConnector,
    updateConnectors,
    updateConnector,
    addConnector,
    removeConnector,

    // textBoxs
    textBoxs,
    getTextBoxs,
    getTextBox,
    updateTextBoxs,
    updateTextBox,
    addTextBox,
    removeTextBox,
    moveTextBox,

    // icons
    icons,
    getIcons,
    getIcon,
    updateIcons,
    updateIcon,
    addIcon,
    removeIcon,

    // colors
    colors,
    getColors,
    updateColors,
    addColor,
    updateColor,
    removeColor,

    // items
    items,
    getItems,
    getItem,
    updateItems,
    updateItem,
    addItem,
    removeItem,

    // rectangles
    rectangles,
    getRectangles,
    getRectangle,
    updateRectangles,
    updateRectangle,
    addRectangle,
    removeRectangle,
    moveRectangle,

    // view(s)
    view,
    views,
    getViews,
    getView,
    getCurrentView,
    updateViews,
    updateView,
    setCurrentView,
    addView,
    removeView,

    // model
    model,
    getModel,
    updateModel,

    // export helpers
    getExportModel,
    exportModelAsJSON,

    // groundConfig
    groundConfig,
    getGroundConfig,
    updateGroundConfig,
    setGroundConfig,
    getGlobalGroundConfig,
    updateGlobalGroundConfig,
    setGlobalGroundConfig,

    // line mode
    lineMode,
    getLineMode,
    setLineMode,

    eventBus
  };
};

export type SceneStore = ReturnType<typeof useProvider>;
export const SceneStoreKey: InjectionKey<SceneStore> = Symbol('SceneStore');

export const provideSceneStore = (actions: SceneStore) => {
  provide(SceneStoreKey, actions);
};
export const useSceneStore = () => {
  const actions = inject(SceneStoreKey);
  if (!actions) {
    throw new Error('Scene store is not provided');
  }
  return actions;
};
