<template>
  <div class="connector-container" :style="containerStyles">
    <Svg :viewbox-size="viewboxSize" :style="svgStyles">
      <!-- 背景线条 -->
      <polyline
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
        :points="pathString"
        :stroke="mainStroke"
        :stroke-width="mainStrokeWidth"
        stroke-linecap="round"
        stroke-linejoin="round"
        :stroke-dasharray="dashArray"
        fill="none"
      />

      <!-- 锚点 -->
      <g v-for="anchor in anchorPositions" :key="anchor.id">
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
import { ref, watch, type CSSProperties } from 'vue';
import { useSceneStore } from '@/stores/sceneStore';
import { useConnector } from 'src/hooks/useConnector';
import { useColor } from 'src/hooks/useColor';
import { useIsoProjection } from 'src/hooks/useIsoProjection';
import Circle from '@/components/Circle/Circle.vue';
import Svg from '@/components/Svg/Svg.vue';

interface Props {
  connector: any;
  isSelected?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false
});

const sceneStore = useSceneStore();

const containerStyles = ref<CSSProperties>({});
const svgStyles = ref<CSSProperties>({});
const pathString = ref('');
const viewboxSize = ref({ width: 100, height: 100 });
const backgroundStroke = ref('white');
const backgroundStrokeWidth = ref(20);
const mainStroke = ref('#333');
const mainStrokeWidth = ref(15);
const dashArray = ref('none');
const anchorPositions = ref<any[]>([]);
const directionIcon = ref<any>(null);

const UNPROJECTED_TILE_SIZE = 100;
const drawOffset = {
  x: UNPROJECTED_TILE_SIZE / 2,
  y: UNPROJECTED_TILE_SIZE / 2
};

const updateConnector = () => {
  if (!props.connector) return;

  // 使用composables获取数据
  const { connector: connectorData } = useConnector(props.connector.id);
  const { color } = useColor(props.connector.color);

  if (!connectorData.value) return;

  // 更新投影
  const { css, pxSize } = useIsoProjection({
    ...connectorData.value.path?.rectangle
  });

  containerStyles.value = css.value || {};
  viewboxSize.value = pxSize.value || { width: 100, height: 100 };

  // 更新路径字符串
  if (connectorData.value.path?.tiles) {
    pathString.value = connectorData.value.path.tiles.reduce(
      (acc: string, tile: any) => {
        return `${acc} ${tile.x * UNPROJECTED_TILE_SIZE + drawOffset.x},${
          tile.y * UNPROJECTED_TILE_SIZE + drawOffset.y
        }`;
      },
      ''
    );
  }

  // 更新样式
  const connectorWidthPx =
    (UNPROJECTED_TILE_SIZE / 100) * (connectorData.value.width || 20);

  backgroundStrokeWidth.value = connectorWidthPx * 1.4;
  mainStrokeWidth.value = connectorWidthPx;
  mainStroke.value = color.value?.value || '#333';

  // 更新虚线样式
  switch (connectorData.value.style) {
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
  if (props.isSelected && connectorData.value.anchors) {
    anchorPositions.value = connectorData.value.anchors.map((anchor: any) => ({
      id: anchor.id,
      x: anchor.x * UNPROJECTED_TILE_SIZE + drawOffset.x,
      y: anchor.y * UNPROJECTED_TILE_SIZE + drawOffset.y
    }));
  } else {
    anchorPositions.value = [];
  }

  // SVG变换样式
  svgStyles.value = {
    transform: 'scale(-1, 1)'
  };
};

// 监听connector和选中状态变化
watch([() => props.connector, () => props.isSelected], updateConnector, {
  immediate: true,
  deep: true
});
</script>

<style scoped>
.connector-container {
  /* 连接器容器样式 */
}
</style>
