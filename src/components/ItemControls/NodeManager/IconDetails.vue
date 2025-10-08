<template>
  <div class="form-card">
    <div class="form-header">
      <h4>{{ isEditing ? '编辑图标' : '新增图标' }}</h4>
    </div>
    <form class="icon-form" @submit.prevent="onSubmit">
      <label class="label">
        <span class="label-text">名称</span>
        <input
          class="input"
          v-model="local.name"
          placeholder="例如：Server"
          required
        />
      </label>
      <label class="label">
        <span class="label-text">图片 URL</span>
        <input
          class="input"
          v-model="local.url"
          placeholder="https://...png"
          required
        />
      </label>
      <label class="label">
        <span class="label-text">或上传图片（自动转为 base64）</span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
          @change="onFileSelected"
        />
        <div v-if="uploadError" class="error">{{ uploadError }}</div>
      </label>
      <div v-if="local.url" class="preview-wrap">
        <span class="label-text">预览</span>
        <div class="preview-box">
          <img :src="local.url" alt="preview" class="preview-img" />
        </div>
      </div>
      <label class="label">
        <span class="label-text">分组（可选）</span>
        <input
          class="input"
          v-model="local.collection"
          placeholder="例如：network"
        />
      </label>
      <label class="checkbox">
        <input type="checkbox" v-model="local.isIsometric" />
        <span class="checkbox-text">Isometric</span>
      </label>
      <label class="label">
        <span class="label-text">图标默认缩放（0.1 - 5）</span>
        <div class="range-row">
          <input
            class="range"
            type="range"
            step="0.1"
            min="0.1"
            max="5"
            v-model.number="(local as any).iconScale"
          />
          <span class="hint"
            >{{ ((local as any).iconScale ?? 1).toFixed(2) }}x</span
          >
        </div>
      </label>

      <label class="label">
        <span class="label-text">图标默认底部偏移（px）</span>
        <div class="range-row">
          <input
            class="range"
            type="range"
            step="1"
            min="-200"
            max="200"
            v-model.number="(local as any).iconBottom"
          />
          <span class="hint">{{ (local as any).iconBottom ?? 0 }}px</span>
        </div>
      </label>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary">
          {{ isEditing ? '保存修改' : '创建图标' }}
        </button>
        <button type="button" class="btn" @click="$emit('cancel')">取消</button>
        <button
          v-if="isEditing"
          type="button"
          class="btn btn-danger"
          @click="$emit('delete', local)"
        >
          删除
        </button>
      </div>

      <div v-if="isEditing" class="hint">ID：{{ local.id }}</div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, ref } from 'vue';
import type { Icon } from '@/types';

const props = defineProps<{
  value: Icon;
  isEditing?: boolean;
}>();

const emit = defineEmits<{
  (e: 'save', value: Icon): void;
  (e: 'cancel'): void;
  (e: 'delete', value: Icon): void;
}>();

const local = reactive<Icon>({ ...(props.value as Icon) });
// 默认缩放为 1
if ((local as any).iconScale === undefined) (local as any).iconScale = 1 as any;
if ((local as any).iconBottom === undefined)
  (local as any).iconBottom = 0 as any;
const isEditing = ref(!!props.isEditing);

watch(
  () => props.value,
  (v) => {
    Object.assign(local, v || {});
    // 保持默认值为 1
    if ((local as any).iconScale === undefined)
      (local as any).iconScale = 1 as any;
  },
  { deep: true }
);

const onSubmit = () => {
  const payload: Icon = {
    ...(local as any),
    id: local.id,
    name: (local.name || '').trim(),
    url: (local.url || '').trim(),
    collection: local.collection?.trim() || undefined,
    isIsometric: !!local.isIsometric,
    iconScale:
      (local as any).iconScale !== undefined
        ? Number((local as any).iconScale)
        : undefined
  } as Icon;
  // 简单范围约束
  if ((payload as any).iconScale !== undefined) {
    (payload as any).iconScale = Math.min(
      5,
      Math.max(0.1, (payload as any).iconScale)
    );
  }
  if ((payload as any).iconBottom !== undefined) {
    (payload as any).iconBottom = Math.round(
      Math.min(200, Math.max(-200, (payload as any).iconBottom))
    );
  }
  emit('save', payload);
};

// 上传
const ACCEPTED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/svg+xml',
  'image/webp',
  'image/gif'
];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const uploadError = ref<string | null>(null);

const readFileAsDataURL = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const onFileSelected = async (e: Event) => {
  uploadError.value = null;
  const input = e.target as HTMLInputElement;
  const file = input.files && input.files[0];
  if (!file) return;
  if (!ACCEPTED_TYPES.includes(file.type)) {
    uploadError.value = '不支持的图片类型，请选择 PNG/JPEG/SVG/WebP/GIF。';
    input.value = '';
    return;
  }
  if (file.size > MAX_FILE_SIZE) {
    uploadError.value = '图片过大，请选择不超过 2MB 的文件。';
    input.value = '';
    return;
  }
  try {
    const dataUrl = await readFileAsDataURL(file);
    local.url = dataUrl;
    if (!local.name) {
      const base = file.name.replace(/\.[^/.]+$/, '');
      local.name = base;
    }
  } catch (err) {
    console.error(err);
    uploadError.value = '读取文件失败，请重试。';
  } finally {
    input.value = '';
  }
};
</script>

<style scoped>
.form-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 12px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}
.icon-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.label {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.label-text {
  font-size: 12px;
  color: #475569;
}
.input {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 13px;
}
.checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
}
.checkbox-text {
  font-size: 13px;
  color: #334155;
}
.form-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
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
.hint {
  font-size: 12px;
  color: #64748b;
}
.range-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.range {
  flex: 1;
}
.error {
  font-size: 12px;
  color: #d32f2f;
}
.preview-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.preview-box {
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  padding: 8px;
  background: #f8fafc;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  overflow: hidden;
}
.preview-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
