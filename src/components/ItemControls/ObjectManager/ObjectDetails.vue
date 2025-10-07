<template>
  <div class="om-form-wrap">
    <h4 class="om-form-title">{{ isEditing ? '编辑对象' : '新增对象' }}</h4>
    <form class="om-form" @submit.prevent="onSave">
      <label class="om-label">
        <span class="om-label-text">名称（可选）</span>
        <input
          class="om-input"
          v-model="local.name"
          placeholder="例如：Server-01"
        />
      </label>

      <label class="om-label">
        <span class="om-label-text">描述（可选，支持 Markdown）</span>
        <MarkdownEditor
          :value="local.description"
          @change="(t) => (local.description = t)"
        />
      </label>

      <IconPicker v-model="local.icon" />

      <div class="om-grid2">
        <label class="om-label">
          <span class="om-label-text">位置 X</span>
          <input
            class="om-input"
            type="number"
            step="1"
            v-model.number="local.tile.x"
          />
        </label>
        <label class="om-label">
          <span class="om-label-text">位置 Y</span>
          <input
            class="om-input"
            type="number"
            step="1"
            v-model.number="local.tile.y"
          />
        </label>
      </div>

      <label class="om-label">
        <span class="om-label-text">标签高度（可选）</span>
        <input
          class="om-input"
          type="number"
          step="1"
          min="0"
          v-model.number="local.labelHeight"
        />
      </label>

      <div class="om-form-actions">
        <button type="submit" class="btn btn-primary" :disabled="!canSubmit">
          {{ isEditing ? '保存修改' : '创建对象' }}
        </button>
        <button type="button" class="btn" @click="$emit('cancel')">取消</button>
        <button
          v-if="isEditing"
          type="button"
          class="btn btn-danger"
          @click="$emit('delete')"
        >
          删除
        </button>
      </div>

      <div v-if="isEditing" class="om-hint">ID：{{ local.id }}</div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import type { ViewItem } from '@/types';
import MarkdownEditor from '@/components/MarkdownEditor/MarkdownEditor.vue';
import { VIEW_ITEM_DEFAULTS } from 'src/config';
import IconPicker from './IconPicker.vue';

const emit = defineEmits<{
  (e: 'save', value: ViewItem): void;
  (e: 'cancel'): void;
  (e: 'delete'): void;
}>();

interface Props {
  value: ViewItem;
  isEditing?: boolean;
}

const props = withDefaults(defineProps<Props>(), { isEditing: false });

const local = reactive<ViewItem>({
  id: props.value.id,
  name: props.value.name,
  description: props.value.description,
  icon: props.value.icon,
  tile: { x: props.value.tile.x, y: props.value.tile.y },
  labelHeight: props.value.labelHeight ?? VIEW_ITEM_DEFAULTS.labelHeight
});

watch(
  () => props.value,
  (v) => {
    local.id = v.id;
    local.name = v.name;
    local.description = v.description;
    local.icon = v.icon;
    local.tile = { x: v.tile.x, y: v.tile.y } as any;
    local.labelHeight = v.labelHeight ?? VIEW_ITEM_DEFAULTS.labelHeight;
  },
  { deep: true }
);

const canSubmit = computed(() => !!local.id);
const onSave = () => emit('save', { ...local });
</script>

<style scoped>
.om-form-wrap {
  padding: 16px;
}
.om-form-title {
  margin: 0 0 8px;
  font-size: 14px;
  color: #0f172a;
}
.om-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.om-label {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.om-label-text {
  font-size: 12px;
  color: #475569;
}
.om-input {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 13px;
}
.om-grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.om-form-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}
.om-hint {
  font-size: 12px;
  color: #64748b;
}
.btn {
  border: 1px solid #d0d7de;
  background: #fff;
  color: #24292f;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
}
.btn-primary {
  background: #1976d2;
  color: #fff;
  border: 1px solid #1976d2;
}
.btn-danger {
  background: #d32f2f;
  color: #fff;
  border: 1px solid #d32f2f;
}
</style>
