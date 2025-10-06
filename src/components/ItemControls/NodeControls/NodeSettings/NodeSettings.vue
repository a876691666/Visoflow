<template>
  <div class="node-settings">
    <Section title="Name">
      <input
        type="text"
        class="text-input"
        :value="modelItemData.name"
        @input="handleNameChange"
      />
    </Section>

    <Section title="Description">
      <MarkdownEditor
        :value="modelItemData.description"
        @change="handleDescriptionChange"
      />
    </Section>

    <Section v-if="modelItemData.name" title="Label height">
      <div class="slider-container">
        <input
          type="range"
          class="slider"
          min="60"
          max="280"
          step="20"
          :value="nodeData.labelHeight"
          @input="handleLabelHeightChange"
        />
        <div class="slider-marks" :style="marksStyles">
          <span v-for="mark in marks" :key="mark" class="mark">{{ mark }}</span>
        </div>
      </div>
    </Section>

    <Section>
      <div class="delete-section" :style="deleteSectionStyles">
        <DeleteButton @click="handleDelete" />
      </div>
    </Section>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, type CSSProperties } from 'vue';
import { useModelItem } from 'src/hooks/useModelItem';
import type { ModelItem, ViewItem } from '@/types';
import MarkdownEditor from '@/components/MarkdownEditor/MarkdownEditor.vue';
import DeleteButton from '../../components/DeleteButton.vue';
import Section from '../../components/Section.vue';

export type NodeUpdates = {
  model: Partial<ModelItem>;
  view: Partial<ViewItem>;
};

interface Props {
  node: ViewItem;
  onModelItemUpdated: (updates: Partial<ModelItem>) => void;
  onViewItemUpdated: (updates: Partial<ViewItem>) => void;
  onDeleted: () => void;
}

const props = defineProps<Props>();

const modelItemData = ref<ModelItem>({
  id: '',
  name: '',
  description: ''
});

const nodeData = ref<ViewItem>({
  id: '',
  labelHeight: 120
} as any);

const marks = ref([60, 100, 140, 180, 220, 260, 280]);

// 样式
const marksStyles = ref<CSSProperties>({
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '12px',
  color: '#999',
  marginTop: '8px'
});

const deleteSectionStyles = ref<CSSProperties>({
  display: 'flex',
  justifyContent: 'center',
  padding: '16px 0'
});

// 使用composable获取模型数据
const modelItem = useModelItem(props.node.id);

const updateModelItemData = () => {
  if (modelItem.value) {
    modelItemData.value = { ...modelItem.value };
  }
};

const updateNodeData = () => {
  nodeData.value = { ...props.node };
};

const handleNameChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const text = target.value;
  if (modelItemData.value.name !== text) {
    modelItemData.value.name = text;
    props.onModelItemUpdated({ name: text });
  }
};

const handleDescriptionChange = (text: string) => {
  if (modelItemData.value.description !== text) {
    modelItemData.value.description = text;
    props.onModelItemUpdated({ description: text });
  }
};

const handleLabelHeightChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const labelHeight = parseInt(target.value);
  nodeData.value.labelHeight = labelHeight;
  props.onViewItemUpdated({ labelHeight });
};

const handleDelete = () => {
  props.onDeleted();
};

// 监听变化
watch(() => modelItem.value, updateModelItemData, {
  immediate: true,
  deep: true
});
watch(() => props.node, updateNodeData, { immediate: true, deep: true });
</script>

<style scoped>
.node-settings {
  /* 节点设置样式 */
}

.text-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.text-input:focus {
  border-color: #1976d2;
  outline: none;
}

.slider-container {
  width: 100%;
}

.slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #ddd;
  outline: none;
  cursor: pointer;
}

.slider-marks {
  /* 滑块标记样式 */
}

.mark {
  /* 标记样式 */
}

.delete-section {
  /* 删除区域样式 */
}
</style>
