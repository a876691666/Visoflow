<template>
  <div v-if="isVisible" class="connector-container" :style="css">
    <Svg :viewbox-size="pxSize" :style="svgStyles">
      <!-- 背景线条 -->
      <polyline
        v-if="pathString && showBorder"
        :points="pathString"
        :stroke="backgroundStroke"
        :stroke-width="backgroundStrokeWidth"
        stroke-linecap="round"
        stroke-linejoin="round"
        :stroke-opacity="1"
        :stroke-dasharray="dashArray"
        fill="none"
      />

      <!-- 主线条 -->
      <polyline
        v-if="pathString"
        :points="pathString"
        :stroke="mainStroke"
        :stroke-width="mainStrokeWidth"
        stroke-linecap="round"
        stroke-linejoin="round"
        :stroke-dasharray="dashArray"
        fill="none"
      />

      <!-- 主线条 -->
      <polyline
        v-if="pathString"
        :points="pathString"
        stroke="transparent"
        class="polyline-hover"
        :stroke-width="30"
        stroke-linecap="round"
        stroke-linejoin="round"
        :data-item-id="connector.id"
        data-item-type="CONNECTOR"
        :stroke-dasharray="dashArray"
        fill="none"
      />

      <FlowTrail
        v-if="pathString && showFlow"
        :d="`M ${pathString}`"
        :ball-radius="flowLength"
        :base-stroke="mainStrokeWidth"
        :base-color="mainStroke"
        :head-color="flowHeadColor"
        :tail-color="flowTailColor"
        :duration="`${flowDuration}s`"
        use-ball-gradient
      />

      <template v-if="props.isSelected">
        <!-- 锚点 (仅在选中时显示) -->
        <g v-for="anchor in anchorPositions" :key="anchor.id">
          <Circle
            :tile="anchor"
            :radius="18"
            fill="white"
            :fill-opacity="0.7"
          />
          <Circle
            :tile="anchor"
            :radius="12"
            stroke="black"
            fill="white"
            :stroke-width="6"
          />
        </g>
      </template>

      <!-- 方向指示器 -->
      <g
        v-if="directionIcon && showDirectionArrow"
        :transform="`translate(${directionIcon.x}, ${directionIcon.y})`"
      >
        <g :transform="`rotate(${directionIcon.rotation})`">
          <polygon
            fill="black"
            stroke="white"
            :stroke-width="4"
            points="17.58,17.01 0,-17.01 -17.58,17.01"
          />
        </g>
      </g>
    </Svg>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, type CSSProperties } from 'vue';
import type { Coords } from '@/types';
import { useIsoProjection } from '@/hooks/useIsoProjection';
import { getConnectorDirectionIcon, getAnchorTile } from '@/utils';
import { UNPROJECTED_TILE_SIZE } from '@/config';
import Circle from '@/components/Circle/Circle.vue';
import Svg from '@/components/Svg/Svg.vue';
import { useSceneStore } from 'src/stores/provider';
import FlowTrail from './FlowTrail.vue';

interface ConnectorWithPath {
  id: string;
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

// 响应式数据
const svgStyles = ref<CSSProperties>({});
const pathString = ref('');
const backgroundStroke = ref('white');
const backgroundStrokeWidth = ref(20);
const mainStroke = ref('#333');
const mainStrokeWidth = ref(15);
const dashArray = ref('none');
const anchorPositions = ref<Array<{ id: string; x: number; y: number }>>([]);
const directionIcon = ref<{ x: number; y: number; rotation: number } | null>(
  null
);

// 原 computed 改为 ref，并在 updateConnector 中赋值
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
// 更新等距投影
const { css, pxSize, update } = useIsoProjection();
// 更新连接器数据
const updateConnector = () => {
  const connector = props.connector;
  if (!connector?.path) {
    isVisible.value = false;
    return;
  }

  const connectorPath = connector.path;
  update({
    from: connectorPath.rectangle.from,
    to: connectorPath.rectangle.to
  });

  // 预备当前视图用于锚点解析
  const currentView = sceneStore.getCurrentView();

  // 生成渲染用 tiles：
  // - 普通模式：使用 path.tiles（由 getConnectorPath 计算）
  // - 直线模式：忽略中间拐点，仅用首尾锚点映射为局部 tile 坐标
  let tilesForRender: Coords[] = connectorPath.tiles || [];
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

  // 更新路径字符串
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
  } else {
    isVisible.value = false;
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

  // 更新虚线样式
  // 自定义虚线：分为段长与间隔
  // - DASHED:  使用 "len, gap"
  // - DOTTED:  使用 "0, gap"（当 len=0 时呈现为点；若用户设置了 len>0，也按照 "len, gap" 渲染）
  // 若未提供 dashLength/dashGap，则保持原有基于 width 的比例
  const defaultDashForStyle = (style?: 'SOLID' | 'DOTTED' | 'DASHED') => {
    switch (style) {
      case 'DASHED':
        return connectorWidthPx * 2;
      case 'DOTTED':
        return connectorWidthPx * 1.8;
      default:
        return 0;
    }
  };

  const dashLenPx =
    typeof connector.dashLength === 'number' && connector.dashLength > 0
      ? (UNPROJECTED_TILE_SIZE / 100) * connector.dashLength
      : defaultDashForStyle(connector.style);
  const dashGapPx =
    typeof connector.dashGap === 'number' && connector.dashGap > 0
      ? (UNPROJECTED_TILE_SIZE / 100) * connector.dashGap
      : defaultDashForStyle(connector.style);

  switch (connector.style) {
    case 'DASHED':
      dashArray.value =
        dashLenPx > 0 && dashGapPx > 0 ? `${dashLenPx}, ${dashGapPx}` : 'none';
      break;
    case 'DOTTED':
      // 点样式：若段长未设或为0，则使用 0,gap；否则允许用户指定 len,gap
      if (!connector.dashLength || connector.dashLength <= 0) {
        dashArray.value = dashGapPx > 0 ? `0, ${dashGapPx}` : 'none';
      } else {
        dashArray.value =
          dashLenPx > 0 && dashGapPx > 0
            ? `${dashLenPx}, ${dashGapPx}`
            : 'none';
      }
      break;
    case 'SOLID':
    default:
      dashArray.value = 'none';
  }

  // 更新锚点位置（如果选中）
  if (props.isSelected && connector.anchors) {
    if (connector.path?.rectangle && currentView) {
      const origin = connector.path.rectangle.from;
      const anchorsToShow =
        connector.isStraight && connector.anchors.length > 1
          ? [
              connector.anchors[0],
              connector.anchors[connector.anchors.length - 1]
            ]
          : connector.anchors;

      anchorPositions.value = anchorsToShow.map((anchor) => {
        const position = getAnchorTile(anchor as any, currentView);

        return {
          id: anchor.id,
          x: (origin.x - position.x) * UNPROJECTED_TILE_SIZE + DRAW_OFFSET.x,
          y: (origin.y - position.y) * UNPROJECTED_TILE_SIZE + DRAW_OFFSET.y
        };
      });
    } else {
      anchorPositions.value = [];
    }
  } else {
    anchorPositions.value = [];
  }

  // 更新方向指示器（直线模式下基于直线 tiles 计算）
  if (tilesForRender && tilesForRender.length > 1) {
    const directionData = getConnectorDirectionIcon(tilesForRender);

    if (directionData) {
      directionIcon.value = {
        x: directionData.x,
        y: directionData.y,
        rotation: directionData.rotation || 0
      };
    }
  } else {
    directionIcon.value = null;
  }

  // SVG变换样式
  svgStyles.value = {
    transform: 'scale(-1, 1)'
  };
};

// 监听器
watch([() => props.connector, () => props.isSelected], updateConnector, {
  immediate: true
});
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
