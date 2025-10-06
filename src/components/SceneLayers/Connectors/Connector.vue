<template>
  <div v-if="isVisible" class="connector-container" :style="css">
    <Svg :viewbox-size="pxSize" :style="svgStyles">
      <!-- 背景线条 -->
      <polyline
        v-if="pathString"
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

      <!-- 锚点 (仅在选中时显示) -->
      <g
        v-if="props.isSelected"
        v-for="anchor in anchorPositions"
        :key="anchor.id"
      >
        <Circle :tile="anchor" :radius="18" fill="white" :fill-opacity="0.7" />
        <Circle
          :tile="anchor"
          :radius="12"
          stroke="black"
          fill="white"
          :stroke-width="6"
        />
      </g>

      <!-- 方向指示器 -->
      <g
        v-if="directionIcon"
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
import { ref, computed, watch, type CSSProperties } from 'vue';
import type { Coords } from '@/types';
import { useIsoProjection } from '@/hooks/useIsoProjection';
import { getConnectorDirectionIcon, getAnchorTile } from '@/utils';
import { UNPROJECTED_TILE_SIZE } from '@/config';
import Circle from '@/components/Circle/Circle.vue';
import Svg from '@/components/Svg/Svg.vue';
import { useSceneStore } from 'src/stores/provider';

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

// 常量
const DRAW_OFFSET = {
  x: UNPROJECTED_TILE_SIZE / 2,
  y: UNPROJECTED_TILE_SIZE / 2
};

// 计算属性
const isVisible = computed(() => {
  return !!(
    props.connector &&
    props.connector.path &&
    props.connector.path.tiles?.length > 0
  );
});

const sceneStore = useSceneStore();
// 更新等距投影
const { css, pxSize, update } = useIsoProjection();
// 更新连接器数据
const updateConnector = () => {
  const connector = props.connector;
  if (!connector?.path) return;

  const connectorPath = connector.path;
  update({
    from: connectorPath.rectangle.from,
    to: connectorPath.rectangle.to
  });

  // 更新路径字符串
  if (connectorPath.tiles && connectorPath.tiles.length > 0) {
    pathString.value = connectorPath.tiles.reduce(
      (acc: string, tile: Coords, index: number) => {
        const point = `${tile.x * UNPROJECTED_TILE_SIZE + DRAW_OFFSET.x},${
          tile.y * UNPROJECTED_TILE_SIZE + DRAW_OFFSET.y
        }`;
        return index === 0 ? point : `${acc} ${point}`;
      },
      ''
    );
  }

  // 更新样式
  const connectorWidth = connector.width || 20;
  const connectorWidthPx = (UNPROJECTED_TILE_SIZE / 100) * connectorWidth;

  backgroundStrokeWidth.value = connectorWidthPx * 1.4;
  mainStrokeWidth.value = connectorWidthPx;
  mainStroke.value = props.connector.color || '#333';
  // 背景描边颜色（可配置）
  backgroundStroke.value = props.connector.backgroundColor || 'white';

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

  const currentView = sceneStore.getCurrentView();
  // 更新锚点位置（如果选中）
  if (props.isSelected && connector.anchors) {
    // 参照 React 版本：根据 anchor 引用解析到全局 tile，再转换为局部像素坐标
    if (connector.path?.rectangle && currentView) {
      const origin = connector.path.rectangle.from;
      anchorPositions.value = connector.anchors.map((anchor) => {
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

  // 更新方向指示器
  if (connectorPath.tiles && connectorPath.tiles.length > 1) {
    const directionData = getConnectorDirectionIcon(connectorPath.tiles);

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
</style>
