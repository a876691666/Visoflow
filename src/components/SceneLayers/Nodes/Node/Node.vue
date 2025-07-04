<template>
  <div
    class="node"
    :style="{
      position: 'absolute',
      zIndex: order
    }"
  >
    <div
      class="node-content"
      :style="{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`
      }"
    >
      <!-- Label and description -->
      <div
        v-if="hasLabel"
        class="node-label"
        :style="{
          position: 'absolute',
          bottom: `${PROJECTED_TILE_SIZE.height / 2}px`
        }"
      >
        <ExpandableLabel
          :max-width="250"
          expand-direction="BOTTOM"
          :label-height="node.labelHeight || DEFAULT_LABEL_HEIGHT"
        >
          <div class="label-content">
            <div v-if="modelItem.name" class="node-name">
              {{ modelItem.name }}
            </div>
            <div v-if="description" class="node-description">
              <MarkdownEditor :value="description" :read-only="true" />
            </div>
          </div>
        </ExpandableLabel>
      </div>

      <!-- Icon -->
      <div
        v-if="iconComponent"
        class="node-icon"
        :style="{
          position: 'absolute',
          pointerEvents: 'none'
        }"
      >
        <component :is="iconComponent" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import {
  PROJECTED_TILE_SIZE,
  DEFAULT_LABEL_HEIGHT,
  MARKDOWN_EMPTY_VALUE
} from '@/config';
import { getTilePosition } from '@/utils';
import { useIcon } from '@/hooks/useIcon';
import type { ViewItem } from '@/types';
import { useModelItem } from '@/hooks/useModelItem';
import ExpandableLabel from '@/components/Label/ExpandableLabel.vue';
import MarkdownEditor from '@/components/MarkdownEditor/MarkdownEditor.vue';

interface Props {
  node: ViewItem;
  order: number;
}

const props = defineProps<Props>();

const position = ref({ x: 0, y: 0 });
const description = ref<string | null>(null);
const modelItem = ref<any>(null);
const iconComponent = ref<any>(null);
const hasLabel = ref(false);

// 更新位置
const updatePosition = () => {
  position.value = getTilePosition({
    tile: props.node.tile,
    origin: 'BOTTOM'
  });
};

// 更新模型项
const updateModelItem = () => {
  const item = useModelItem(props.node.id);
  modelItem.value = item;

  // 更新描述
  if (
    item.description === undefined ||
    item.description === MARKDOWN_EMPTY_VALUE
  ) {
    description.value = null;
  } else {
    description.value = item.description;
  }

  // 更新是否有标签
  hasLabel.value = !!(item.name || description.value);
};

// 更新图标
const updateIcon = () => {
  if (modelItem.value?.icon) {
    const { iconComponent: comp } = useIcon(modelItem.value.icon);
    iconComponent.value = comp;
  } else {
    iconComponent.value = null;
  }
};

// 监听node变化
watch(
  () => props.node,
  () => {
    updatePosition();
    updateModelItem();
    updateIcon();
  },
  { immediate: true, deep: true }
);

// 监听order变化（虽然通常不会变，但为了完整性）
watch(
  () => props.order,
  () => {
    // order变化时不需要特别处理，模板会自动更新
  },
  { immediate: true }
);
</script>

<style scoped>
.node {
  /* Node base styles */
}

.node-content {
  /* Node content container */
}

.node-label {
  /* Label container */
}

.label-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.node-name {
  font-weight: 600;
  color: #333;
}

.node-description {
  /* Description styles */
}

.node-icon {
  /* Icon container */
}
</style>
