<template>
  <div v-if="isVisible" class="connector-label" :style="labelContainerStyles">
    <Label :max-width="150" :label-height="0" :styles="labelStyles">
      <span class="label-text" :style="textStyles">
        {{ connector.description }}
      </span>
    </Label>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, type CSSProperties } from 'vue';
import { getTilePosition, connectorPathTileToGlobal } from '@/utils';
import { PROJECTED_TILE_SIZE } from '@/config';
import Label from '@/components/Label/Label.vue';

interface ConnectorWithPath {
  id: string;
  description?: string;
  path?: {
    tiles: Array<{ x: number; y: number }>;
    rectangle: {
      from: { x: number; y: number };
      to: { x: number; y: number };
    };
  };
}

interface Props {
  connector: ConnectorWithPath;
}

const props = defineProps<Props>();

const labelContainerStyles = ref<CSSProperties>({});
const labelStyles = ref<CSSProperties>({});
const textStyles = ref<CSSProperties>({});

// 检查是否可见
const isVisible = computed(() => {
  return !!(
    props.connector?.description &&
    props.connector.description.trim() !== '' &&
    props.connector.path?.tiles &&
    props.connector.path.tiles.length > 0
  );
});

// 更新标签位置
const updateLabelPosition = () => {
  if (!props.connector?.path?.tiles || !props.connector.path.rectangle) return;

  try {
    // 计算标签位置（路径中间点）
    const tiles = props.connector.path.tiles;
    const tileIndex = Math.floor(tiles.length / 2);
    const tile = tiles[tileIndex];

    if (!tile) return;

    // 转换为全局坐标
    const globalTile = connectorPathTileToGlobal(
      tile,
      props.connector.path.rectangle.from
    );

    // 计算屏幕位置
    const labelPosition = getTilePosition({
      tile: globalTile,
      origin: 'CENTER'
    });

    // 更新容器样式
    labelContainerStyles.value = {
      position: 'absolute',
      pointerEvents: 'none',
      maxWidth: `${PROJECTED_TILE_SIZE.width}px`,
      left: `${labelPosition.x}px`,
      top: `${labelPosition.y}px`,
      transform: 'translate(-50%, -50%)', // 居中对齐
      zIndex: '10'
    };

    // 更新标签样式
    labelStyles.value = {
      padding: '6px 8px',
      borderRadius: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(0, 0, 0, 0.1)'
    };

    // 更新文本样式
    textStyles.value = {
      color: '#666',
      fontSize: '0.875rem',
      fontWeight: '500',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    };
  } catch (error) {
    console.warn(
      `Failed to calculate label position for connector ${props.connector.id}:`,
      error
    );
  }
};

// 监听连接器变化
watch(() => props.connector, updateLabelPosition, {
  immediate: true,
  deep: true
});
</script>

<style scoped>
.connector-label {
  /* 连接器标签基础样式 */
  font-family: inherit;
}

.label-text {
  /* 标签文本样式 */
  display: block;
  max-width: 140px;
}
</style>
