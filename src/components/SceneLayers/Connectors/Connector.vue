<template>
  <div v-if="isVisible" class="connector-container" :style="containerStyles">
    <Svg :viewbox-size="viewboxSize" :style="svgStyles">
      <!-- 背景线条 -->
      <polyline
        v-if="pathString"
        :points="pathString"
        :stroke="backgroundStroke"
        :stroke-width="backgroundStrokeWidth"
        stroke-linecap="round"
        stroke-linejoin="round"
        :stroke-opacity="0.7"
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
import { useColor } from '@/hooks/useColor';
import { useIsoProjection } from '@/hooks/useIsoProjection';
import { getConnectorDirectionIcon, getAnchorTile } from '@/utils';
import { UNPROJECTED_TILE_SIZE } from '@/config';
import Circle from '@/components/Circle/Circle.vue';
import Svg from '@/components/Svg/Svg.vue';
import { useScene } from '@/hooks/useScene';

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
  width?: number;
  description?: string;
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
const containerStyles = ref<CSSProperties>({});
const svgStyles = ref<CSSProperties>({});
const pathString = ref('');
const viewboxSize = ref({ width: 100, height: 100 });
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

// 获取颜色
const color = useColor(props.connector.color);
// 获取当前视图（用于解析锚点的实际 tile）
const { currentView } = useScene();

// 更新连接器数据
const updateConnector = () => {
  const connector = props.connector;
  if (!connector?.path) return;

  const connectorPath = connector.path;

  // 更新等距投影
  const { css, pxSize } = useIsoProjection({
    from: connectorPath.rectangle.from,
    to: connectorPath.rectangle.to
  });

  containerStyles.value = css.value || {};
  viewboxSize.value = pxSize.value || { width: 100, height: 100 };

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
  mainStroke.value = color.value?.value || '#333';

  // 更新虚线样式
  switch (connector.style) {
    case 'DASHED':
      dashArray.value = `${connectorWidthPx * 2}, ${connectorWidthPx * 2}`;
      break;
    case 'DOTTED':
      dashArray.value = `0, ${connectorWidthPx * 1.8}`;
      break;
    case 'SOLID':
    default:
      dashArray.value = 'none';
  }

  // 更新锚点位置（如果选中）
  if (props.isSelected && connector.anchors) {
    // 参照 React 版本：根据 anchor 引用解析到全局 tile，再转换为局部像素坐标
    if (connector.path?.rectangle && currentView.value) {
      const origin = connector.path.rectangle.from;
      anchorPositions.value = connector.anchors.map((anchor) => {
        const position = getAnchorTile(anchor as any, currentView.value);

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
watch(
  [() => props.connector, () => props.isSelected, () => color.value],
  updateConnector,
  { immediate: true, deep: true }
);
</script>

<style scoped>
.connector-container {
  /* 连接器容器样式 */
  pointer-events: none;
}
</style>
