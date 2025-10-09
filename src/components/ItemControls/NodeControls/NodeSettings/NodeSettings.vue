<template>
  <div class="node-settings">
    <Section title="配置复制/粘贴">
      <ConfigClipboard
        storageKey="visoflow.node.config"
        :get-config="getConfig"
        :apply-config="applyConfig"
      />
    </Section>

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

    <Section title="Icon scale (object)">
      <div class="slider-container">
        <input
          type="range"
          class="slider"
          min="0.1"
          max="5"
          step="0.1"
          :value="nodeData.iconScale ?? 1"
          @input="handleIconScaleChange"
        />
        <div class="slider-marks" :style="marksStyles">
          <span class="mark">{{ (nodeData.iconScale ?? 1).toFixed(2) }}x</span>
        </div>
      </div>
    </Section>

    <Section title="Icon bottom offset (px)">
      <div class="slider-container">
        <input
          type="range"
          class="slider"
          min="-200"
          max="200"
          step="1"
          :value="(nodeData as any).iconBottom ?? 0"
          @input="handleIconBottomChange"
        />
        <div class="slider-marks" :style="marksStyles">
          <span class="mark">{{ (nodeData as any).iconBottom ?? 0 }}px</span>
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
import type { ViewItem } from '@/types';
import MarkdownEditor from '@/components/MarkdownEditor/MarkdownEditor.vue';
import DeleteButton from '../../components/DeleteButton.vue';
import Section from '../../components/Section.vue';
import ConfigClipboard from '../../components/ConfigClipboard.vue';

export type NodeUpdates = {
  model: Partial<ViewItem>;
  view: Partial<ViewItem>;
};

interface Props {
  node: ViewItem;
  onModelItemUpdated: (updates: Partial<ViewItem>) => void;
  onViewItemUpdated: (updates: Partial<ViewItem>) => void;
  onDeleted: () => void;
}

const props = defineProps<Props>();

const modelItemData = ref<ViewItem>({
  id: '',
  tile: { x: 0, y: 0 },
  name: '',
  description: ''
});

const nodeData = ref<ViewItem>({
  id: '',
  labelHeight: 120
} as any);

// 简化复制/粘贴：支持 name/description（模型），labelHeight/iconScale/iconBottom（视图）
const getConfig = () => ({
  name: modelItemData.value.name,
  description: modelItemData.value.description,
  labelHeight: nodeData.value.labelHeight,
  iconScale: (nodeData.value as any).iconScale ?? 1,
  iconBottom: (nodeData.value as any).iconBottom ?? 0
});

const applyConfig = (cfg: any) => {
  if (!cfg || typeof cfg !== 'object') return;
  if ('name' in cfg) props.onModelItemUpdated({ name: cfg.name });
  if ('description' in cfg)
    props.onModelItemUpdated({ description: cfg.description });
  const viewUpdates: any = {};
  if ('labelHeight' in cfg) viewUpdates.labelHeight = cfg.labelHeight;
  if ('iconScale' in cfg) viewUpdates.iconScale = cfg.iconScale;
  if ('iconBottom' in cfg) viewUpdates.iconBottom = cfg.iconBottom;
  if (Object.keys(viewUpdates).length) props.onViewItemUpdated(viewUpdates);
};

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

const clampIconScale = (n: number) => Math.min(5, Math.max(0.1, n));
const handleIconScaleChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const val = parseFloat(target.value);
  const next = clampIconScale(val);
  nodeData.value.iconScale = next as any;
  props.onViewItemUpdated({ iconScale: next } as any);
};

const clampIconBottom = (n: number) =>
  Math.round(Math.min(200, Math.max(-200, n)));
const handleIconBottomChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const val = parseFloat(target.value);
  const next = clampIconBottom(val);
  (nodeData.value as any).iconBottom = next as any;
  props.onViewItemUpdated({ iconBottom: next } as any);
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
  display: block;
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
  display: block;
}
.mark {
  display: inline-block;
}
.delete-section {
  display: block;
}
</style>
