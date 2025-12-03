<template></template>
<script setup lang="ts">
import {
  inject,
  onMounted,
  onBeforeUnmount,
  ref,
  shallowRef,
  watch,
  ShallowRef,
  useId
} from 'vue';
import type { Coords } from '@/types';
import { useIsoProjection } from '@/hooks/useIsoProjection';
import { getAnchorTile } from '@/utils';
import { UNPROJECTED_TILE_SIZE } from '@/config';
import { useSceneStore } from 'src/stores/provider';
import * as THREE from 'three';
import { Group, Mesh, MeshBasicMaterial, Shape } from 'three';
import { Line2DGeometry, clock } from 'three-line2d-geometry';
import * as d3Color from 'd3-color';

interface ConnectorWithPath {
  id: string;
  // 新增：与 key 平级的 class
  class?: string;
  // 新增：隐藏（为 true 时不显示该 connector）
  hidden?: boolean;
  anchors: Array<{
    id: string;
    ref: {
      tile?: { x: number; y: number };
      item?: string;
      anchor?: string;
    };
  }>;
  style?: 'SOLID' | 'DOTTED' | 'DASHED';
  color?: string;
  // 背景描边颜色（用于加粗白底的那条线）
  backgroundColor?: string;
  width?: number;
  description?: string;
  // 自定义虚线段长度（与 width 一样采用基于 UNPROJECTED_TILE_SIZE 的相对像素转换）
  dashLength?: number;
  // 自定义虚线段间隔（与 width 一样采用基于 UNPROJECTED_TILE_SIZE 的相对像素转换）
  dashGap?: number;
  // 新增：显示边框（背景线条）
  showBorder?: boolean;
  // 新增：显示流光
  showFlow?: boolean;
  // 新增：流光渐变颜色（头/尾）
  flowHeadColor?: string;
  flowTailColor?: string;
  // 新增：流光长度
  flowLength?: number;
  // 新增：是否显示指引箭头
  showDirectionArrow?: boolean;
  // 新增：是否直线（仅渲染层使用）
  isStraight?: boolean;
  // 新增：流光速度（周期秒）
  flowDuration?: number;
  // 新增：整体屏幕像素偏移
  offsetX?: number;
  offsetY?: number;
  path?: {
    tiles: Coords[];
    rectangle: {
      from: Coords;
      to: Coords;
    };
  };
}

interface Props {
  connector: ConnectorWithPath;
  isSelected?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false
});
let texture: THREE.CanvasTexture | null = null;
let alphaTexture: THREE.CanvasTexture | null = null;
let totalLength = 0;
let flowMaterial: MeshBasicMaterial | null = null;
let solidMaterial: MeshBasicMaterial | null = null;

// 响应式数据
const pathString = ref('');
const backgroundStroke = ref('white');
const backgroundStrokeWidth = ref(20);
const mainStroke = ref('#333');
const mainStrokeWidth = ref(15);
const showBorder = ref(false);
const showFlow = ref(false);
const showDirectionArrow = ref(true);
const flowHeadColor = ref<string>('');
const flowTailColor = ref<string>('');
const flowLength = ref<number>(100);
const flowDuration = ref<number>(2);
const isVisible = ref(false);

// 常量
const DRAW_OFFSET = {
  x: UNPROJECTED_TILE_SIZE / 2,
  y: UNPROJECTED_TILE_SIZE / 2
};

const sceneStore = useSceneStore();

const {
  group: threeGroup,
  registerLoop,
  unregisterLoop
} = inject('threeGroup') as {
  group: ShallowRef<Group | null>;
  registerLoop: (id: string, fn: () => void) => void;
  unregisterLoop: (id: string) => void;
};

// 更新等距投影
const { update } = useIsoProjection();

// Three.js 网格对象
const lineMesh = shallowRef<Mesh | null>(null);
const borderMesh = shallowRef<Mesh | null>(null);

lineMesh.value = new Mesh();
borderMesh.value = new Mesh();

const initConenector = () => {
  // 初始化时创建网格对象
  if (threeGroup.value) {
    // 主线条网格
    if (lineMesh.value) {
      lineMesh.value.rotation.x = Math.PI / 2;
      threeGroup.value.add(lineMesh.value);
    }

    // 边框网格
    if (borderMesh.value) {
      borderMesh.value.rotation.x = Math.PI / 2;
      threeGroup.value.add(borderMesh.value);
    }
  }
};

const cleanupConnector = () => {
  // 清理网格对象
  if (lineMesh.value) {
    lineMesh.value.geometry?.dispose();
    (lineMesh.value.material as MeshBasicMaterial)?.dispose();
    threeGroup.value?.remove(lineMesh.value);
    lineMesh.value = null;
  }
  if (borderMesh.value) {
    borderMesh.value.geometry?.dispose();
    (borderMesh.value.material as MeshBasicMaterial)?.dispose();
    threeGroup.value?.remove(borderMesh.value);
    borderMesh.value = null;
  }
  // 清理贴图
  if (texture) {
    texture.dispose();
    texture = null;
  }
  if (alphaTexture) {
    alphaTexture.dispose();
    alphaTexture = null;
  }
  // 清理材质
  if (flowMaterial) {
    flowMaterial.dispose();
    flowMaterial = null;
  }
  if (solidMaterial) {
    solidMaterial.dispose();
    solidMaterial = null;
  }
};

const id = useId();
onMounted(() => {
  initConenector();
  registerLoop(id, () => {
    if (texture) {
      const delta = clock.getElapsedTime();

      texture.offset.x = delta / flowDuration.value;
      texture.needsUpdate = true;
    }
  });
});

onBeforeUnmount(() => {
  unregisterLoop(id);
  cleanupConnector();
});

// 创建虚线的 alpha 贴图（不随动画移动）
const createAlphaTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 16;

  const context = canvas.getContext('2d');
  if (context) {
    // 判断是否需要绘制虚线，根据 props.connector.style
    const connectorStyle = props.connector.style;
    const useDashedBg =
      connectorStyle === 'DASHED' || connectorStyle === 'DOTTED';

    if (!useDashedBg) {
      // 实线：全白（完全不透明）
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      // 虚线：先填充黑色（完全透明），再绘制白色虚线段
      context.fillStyle = 'black';
      context.fillRect(0, 0, canvas.width, canvas.height);

      // 将 dashLength 和 dashGap 从相对像素转换为世界像素，再映射到画布像素
      const dashLengthPx = props.connector.dashLength
        ? (UNPROJECTED_TILE_SIZE / 100) * props.connector.dashLength
        : 0;
      const dashGapPx = props.connector.dashGap
        ? (UNPROJECTED_TILE_SIZE / 100) * props.connector.dashGap
        : 0;

      const dashCanvasLen =
        dashLengthPx > 0 ? (dashLengthPx / totalLength) * canvas.width : 0;
      const dashCanvasGap =
        dashGapPx > 0 ? (dashGapPx / totalLength) * canvas.width : 0;

      // 若为点样式（DOTTED），绘制点（用 1px 宽度）
      const isDot = connectorStyle === 'DOTTED';
      let x = 0;
      context.fillStyle = 'white';
      // 为保证可见性，若 gap 计算为 0，则回退为实色填充
      if (
        (isDot && dashCanvasGap <= 0) ||
        (!isDot && dashCanvasLen <= 0 && dashCanvasGap <= 0)
      ) {
        context.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        while (x < canvas.width) {
          if (isDot) {
            // 在点样式中，以 gap 作为点间隔，绘制 1px 宽的点
            const gap = Math.max(1, Math.round(dashCanvasGap));
            context.fillRect(x, 0, 1, canvas.height);
            x += gap;
          } else {
            const len = Math.max(1, Math.round(dashCanvasLen));
            const gap = Math.max(0, Math.round(dashCanvasGap));
            context.fillRect(x, 0, len, canvas.height);
            x += len + gap;
          }
        }
      }
    }
  }

  if (alphaTexture) alphaTexture.dispose();

  alphaTexture = new THREE.CanvasTexture(canvas);
  alphaTexture.wrapS = THREE.RepeatWrapping;
  alphaTexture.wrapT = THREE.ClampToEdgeWrapping;
  alphaTexture.minFilter = THREE.NearestFilter;
  alphaTexture.repeat.set(1, 1);
  alphaTexture.rotation = Math.PI;

  return alphaTexture;
};

// 创建流光动画贴图（随动画移动）
const createFlowTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 16;

  const context = canvas.getContext('2d');
  if (context) {
    // 背景色使用 backgroundStroke
    const bgColor = sceneStore.getColor(mainStroke.value);
    context.fillStyle = bgColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制流光渐变
    const length = ((flowLength.value || 100) / totalLength) * 256;
    const gradient = context.createLinearGradient(0, 0, length, 0);
    const startColor = d3Color.color(sceneStore.getColor(flowHeadColor.value))!;
    const endColor = d3Color.color(sceneStore.getColor(flowTailColor.value))!;
    endColor.opacity = 0;
    gradient.addColorStop(0, startColor.formatRgb());
    gradient.addColorStop(1, endColor.formatRgb());

    context.fillStyle = gradient;
    context.fillRect(0, 0, length, canvas.height);
  }

  if (texture) texture.dispose();

  texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.NearestFilter;
  texture.repeat.set(1, 1);
  texture.rotation = Math.PI;
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
};

const buildLine2DGeometry = (tiles: Coords[]) => {
  if (!lineMesh.value || !borderMesh.value) return;

  const connector = props.connector;
  const connectorWidth = connector.width || 20;
  const connectorWidthPx = (UNPROJECTED_TILE_SIZE / 100) * connectorWidth;

  const curves: any[] = [];
  const points: THREE.Vector2[] = [];
  const cacheLengths: number[] = [];
  totalLength = 0;

  tiles.forEach((tile, index) => {
    const x = tile.x * UNPROJECTED_TILE_SIZE + DRAW_OFFSET.x;
    const y = tile.y * UNPROJECTED_TILE_SIZE + DRAW_OFFSET.y;
    const point = new THREE.Vector2(x, y);
    points.push(point);

    if (index > 0) {
      const prevPoint = points[index - 1];
      const curve = {
        v1: prevPoint,
        v2: point,
        getLength: () => prevPoint.distanceTo(point)
      };
      curves.push(curve);
      totalLength += curve.getLength();
      cacheLengths.push(totalLength);
    }
  });

  const shape = new Shape(points);

  // 创建主线条几何体
  const mainGeometry = new Line2DGeometry(shape, {
    width: connectorWidthPx / 2,
    uvSpread: false
  });

  // 创建虚线 alpha 贴图
  const alphaMap = createAlphaTexture();

  // 清理旧材质
  if (flowMaterial) {
    flowMaterial.dispose();
    flowMaterial = null;
  }
  if (solidMaterial) {
    solidMaterial.dispose();
    solidMaterial = null;
  }

  // 提前创建流光材质
  const flowMap = createFlowTexture();
  flowMaterial = new MeshBasicMaterial({
    side: THREE.DoubleSide,
    map: flowMap,
    alphaMap: alphaMap,
    transparent: true,
    opacity: 1
  });

  // 提前创建纯色材质
  const lineColor = sceneStore.getColor(mainStroke.value);
  solidMaterial = new MeshBasicMaterial({
    side: THREE.DoubleSide,
    color: new THREE.Color(lineColor),
    alphaMap: alphaMap,
    transparent: true,
    opacity: 1
  });

  // 根据 showFlow 选择材质
  const mainMaterial = showFlow.value ? flowMaterial : solidMaterial;

  // 更新主线条网格
  if (lineMesh.value.geometry) {
    lineMesh.value.geometry.dispose();
  }
  if (
    lineMesh.value.material &&
    lineMesh.value.material !== flowMaterial &&
    lineMesh.value.material !== solidMaterial
  ) {
    (lineMesh.value.material as MeshBasicMaterial).dispose();
  }
  lineMesh.value.geometry = mainGeometry;
  lineMesh.value.material = mainMaterial;
  lineMesh.value.visible = true;

  const pathFrom = props.connector.path!.rectangle.from;

  const offsetX = pathFrom.x * UNPROJECTED_TILE_SIZE + DRAW_OFFSET.x;
  const offsetY = pathFrom.y * UNPROJECTED_TILE_SIZE + DRAW_OFFSET.y;

  const customOffsetX = props.connector.offsetX || 0;
  const customOffsetY = props.connector.offsetY || 0;

  const x = 0.707 * customOffsetX;
  const y = customOffsetY / 0.817;

  lineMesh.value.position.set(-offsetX - x + y, 0, -offsetY + x + y);
};

// 更新连接器数据
const updateConnector = () => {
  const connector = props.connector;

  // 若显式隐藏，则不显示
  if (connector?.hidden) {
    isVisible.value = false;
    return;
  }

  if (!connector?.path) {
    isVisible.value = false;
    return;
  }

  // 更新样式
  const connectorWidth = connector.width || 20;
  const connectorWidthPx = (UNPROJECTED_TILE_SIZE / 100) * connectorWidth;

  backgroundStrokeWidth.value = connectorWidthPx * 1.4;
  mainStrokeWidth.value = connectorWidthPx;
  mainStroke.value = props.connector.color || '#333';
  // 背景描边颜色（可配置）
  backgroundStroke.value = props.connector.backgroundColor || 'white';

  // 控制项派生（替代 computed）
  showBorder.value = connector.showBorder !== false;
  showFlow.value = connector.showFlow !== false;
  showDirectionArrow.value = connector.showDirectionArrow !== false;
  flowHeadColor.value = connector.flowHeadColor || mainStroke.value;
  flowTailColor.value = connector.flowTailColor || mainStroke.value;
  flowLength.value =
    typeof connector.flowLength === 'number' ? connector.flowLength : 100;
  flowDuration.value =
    typeof connector.flowDuration === 'number' ? connector.flowDuration : 2;

  const connectorPath = connector.path;
  update({
    from: connectorPath.rectangle.from,
    to: connectorPath.rectangle.to
  });

  // 预备当前视图用于锚点解析
  const currentView = sceneStore.getCurrentView();

  // 倒序循环去除重复的相邻坐标点
  let cleanedTiles = [...(connectorPath.tiles || [])];
  for (let i = cleanedTiles.length - 1; i > 0; i--) {
    const current = cleanedTiles[i];
    const previous = cleanedTiles[i - 1];
    if (current.x === previous.x && current.y === previous.y) {
      cleanedTiles.splice(i, 1);
    }
  }

  if (cleanedTiles.length < 2) {
    isVisible.value = false;
    // 隐藏网格
    if (lineMesh.value) lineMesh.value.visible = false;
    if (borderMesh.value) borderMesh.value.visible = false;
    return;
  }

  // 生成渲染用 tiles：
  // - 普通模式：使用 path.tiles（由 getConnectorPath 计算）
  // - 直线模式：忽略中间拐点，仅用首尾锚点映射为局部 tile 坐标
  let tilesForRender: Coords[] = cleanedTiles;
  if (
    connector.isStraight &&
    connector.anchors &&
    connector.anchors.length > 1 &&
    currentView
  ) {
    const origin = connectorPath.rectangle.from;
    const firstAnchor = connector.anchors[0];
    const lastAnchor = connector.anchors[connector.anchors.length - 1];
    const firstPos = getAnchorTile(firstAnchor, currentView);
    const lastPos = getAnchorTile(lastAnchor, currentView);

    // 将全局 tile 转换为以 rectangle.from 为原点的局部 tile 坐标
    const toLocalTile = (pos: Coords): Coords => ({
      x: origin.x - pos.x,
      y: origin.y - pos.y
    });

    tilesForRender = [toLocalTile(firstPos), toLocalTile(lastPos)];
  }

  // 更新路径字符串（保留用于锚点等其他功能）
  if (tilesForRender && tilesForRender.length > 0) {
    pathString.value = tilesForRender.reduce(
      (acc: string, tile: Coords, index: number) => {
        const point = `${tile.x * UNPROJECTED_TILE_SIZE + DRAW_OFFSET.x},${
          tile.y * UNPROJECTED_TILE_SIZE + DRAW_OFFSET.y
        }`;
        return index === 0 ? point : `${acc} ${point}`;
      },
      ''
    );
    isVisible.value = true;

    // 构建 Three.js 路径几何体
    buildLine2DGeometry(tilesForRender);
  } else {
    isVisible.value = false;
    // 隐藏网格
    if (lineMesh.value) lineMesh.value.visible = false;
    if (borderMesh.value) borderMesh.value.visible = false;
  }
};

// 切换材质的函数
const switchMaterial = () => {
  if (!lineMesh.value || !flowMaterial || !solidMaterial) return;

  const newMaterial = showFlow.value ? flowMaterial : solidMaterial;
  lineMesh.value.material = newMaterial;
};

// 监听器
watch([() => props.connector, () => props.isSelected], updateConnector, {
  immediate: true
});

// 监听 showFlow 变化，快速切换材质
watch(showFlow, switchMaterial);
</script>

<style scoped>
.connector-container {
  /* 连接器容器样式 */
  pointer-events: none;
}

.polyline-hover {
  pointer-events: all !important;
}
</style>
