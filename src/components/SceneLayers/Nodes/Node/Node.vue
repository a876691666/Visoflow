<template>
  <div
    class="node"
    :style="{
      position: 'absolute',
      zIndex: order
    }"
    :data-item-id="node.id"
    data-item-type="ITEM"
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
            <div
              v-if="modelItem?.name && modelItem?.showName !== false"
              class="node-name"
            >
              {{ modelItem.name }}
            </div>
            <div v-if="description" class="node-description">
              <MarkdownView :value="description" :read-only="true" />
            </div>
          </div>
        </ExpandableLabel>
      </div>

      <!-- Icon -->
      <div
        v-if="iconComponent"
        class="node-icon"
        :style="{
          position: 'absolute'
        }"
      >
        <component :is="iconComponent" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
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
import MarkdownView from '@/components/MarkdownEditor/MarkdownView.vue';

interface Props {
  node: ViewItem;
  order: number;
}

const props = defineProps<Props>();

// Computed properties
const position = computed(() =>
  getTilePosition({
    tile: props.node.tile,
    origin: 'BOTTOM'
  })
);

const modelItem = useModelItem(props.node.id);
const { iconComponent } = useIcon(modelItem);

// Computed description
const description = computed(() => {
  if (
    modelItem.value?.description === undefined ||
    modelItem.value?.description === MARKDOWN_EMPTY_VALUE
  ) {
    return null;
  }
  return modelItem.value.description;
});

// 名称是否可见（未设置时默认可见）
const isNameVisible = computed(() => modelItem.value?.showName !== false);

// Computed has label
const hasLabel = computed(
  () =>
    !!(
      ((modelItem.value?.name && isNameVisible.value) as any) ||
      description.value
    )
);
</script>

<style scoped>
.node-content {
  transform-origin: center bottom;
}

.node-label {
  white-space: nowrap;
}

.label-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 250px;
}

.node-name {
  font-weight: 600;
  color: #333;
}

.node-description {
  font-size: 0.875rem;
  color: #666;
}

.node-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
