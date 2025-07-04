<template>
  <div class="connector-label" :style="labelContainerStyles">
    <Label :max-width="150" :label-height="0" :styles="labelStyles">
      <span class="label-text" :style="textStyles">
        {{ connector.description }}
      </span>
    </Label>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, type CSSProperties } from 'vue';
import Label from '@/components/Label/Label.vue';

interface Props {
  connector: any;
}

const props = defineProps<Props>();

const labelContainerStyles = ref<CSSProperties>({});
const labelStyles = ref<CSSProperties>({});
const textStyles = ref<CSSProperties>({});

const PROJECTED_TILE_SIZE = {
  width: 100,
  height: 100
};

const updateLabelPosition = () => {
  if (!props.connector?.path?.tiles) return;

  // 计算标签位置（路径中间点）
  const tileIndex = Math.floor(props.connector.path.tiles.length / 2);
  const tile = props.connector.path.tiles[tileIndex];

  // 简化的位置计算
  const labelPosition = getTilePosition({
    tile: connectorPathTileToGlobal(tile, props.connector.path.rectangle.from)
  });

  labelContainerStyles.value = {
    position: 'absolute',
    pointerEvents: 'none',
    maxWidth: `${PROJECTED_TILE_SIZE.width}px`,
    left: `${labelPosition.x}px`,
    top: `${labelPosition.y}px`
  };

  labelStyles.value = {
    padding: '6px 8px',
    borderRadius: '8px'
  };

  textStyles.value = {
    color: '#666',
    fontSize: '0.875rem'
  };
};

// 简化的工具函数
const connectorPathTileToGlobal = (tile: any, from: any) => {
  return {
    x: tile.x + from.x,
    y: tile.y + from.y
  };
};

const getTilePosition = ({ tile }: { tile: any }) => {
  return {
    x: tile.x * PROJECTED_TILE_SIZE.width,
    y: tile.y * PROJECTED_TILE_SIZE.height
  };
};

// 监听connector变化
watch(() => props.connector, updateLabelPosition, {
  immediate: true,
  deep: true
});
</script>

<style scoped>
.connector-label {
  /* 连接器标签样式 */
}

.label-text {
  /* 标签文本样式 */
}
</style>
