<template>
  <div class="icon-list-wrap">
    <div class="list-toolbar">
      <input
        class="input"
        v-model="keyword"
        placeholder="搜索图标名称/ID/分组"
      />
      <div class="toolbar-actions">
        <input
          ref="fileInput"
          type="file"
          multiple
          accept="image/*,.svg"
          style="display: none"
          @change="handleFileImport"
        />
        <button class="btn" @click="triggerFileImport">批量导入</button>
        <button
          class="btn btn-danger"
          @click="handleClearAll"
          :disabled="!icons.length"
        >
          清空图标
        </button>
        <button class="btn btn-primary" @click="$emit('add')">新增图标</button>
      </div>
    </div>

    <div class="list-header">图标列表（{{ filteredIcons.length }}）</div>
    <div class="list">
      <div v-for="icon in filteredIcons" :key="icon.id" class="list-item">
        <div class="list-item-info">
          <img :src="icon.url" alt="" class="thumb" />
          <div class="list-item-text">
            <div class="list-item-title">
              {{ icon.name }}
              <span v-if="icon.iconScale" class="muted"
                >· {{ icon.iconScale.toFixed(2) }}x</span
              >
            </div>
            <div class="list-item-desc">
              {{ icon.collection || '未分组' }}
              <span class="muted">
                · {{ icon.isIsometric ? 'Isometric' : 'Non-isometric' }}
              </span>
            </div>
          </div>
        </div>
        <div class="list-item-actions">
          <button class="btn" @click="$emit('edit', icon)">编辑</button>
          <button class="btn btn-danger" @click="$emit('delete', icon)">
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Icon } from '@/types';
import { useSceneStore } from '@/stores/provider';

const props = defineProps<{
  icons: Icon[];
}>();

const keyword = ref('');
const fileInput = ref<HTMLInputElement>();
const sceneStore = useSceneStore();

defineEmits<{
  (e: 'add'): void;
  (e: 'edit', icon: Icon): void;
  (e: 'delete', icon: Icon): void;
}>();

const filteredIcons = computed(() => {
  const k = keyword.value.trim().toLowerCase();
  const src = props.icons ?? [];
  if (!k) return src;
  return src.filter((i) => {
    const name = i.name.toLowerCase();
    const id = i.id.toLowerCase();
    const col = (i.collection || '').toLowerCase();
    return name.includes(k) || id.includes(k) || col.includes(k);
  });
});

const triggerFileImport = () => {
  fileInput.value?.click();
};

const handleFileImport = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (!files || files.length === 0) return;

  // 处理每个文件
  for (const file of Array.from(files)) {
    if (!file.type.startsWith('image/')) continue;

    try {
      // 将文件转换为 base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // 生成唯一 ID
      const id = `icon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 从文件名提取图标名称（去掉扩展名）
      const name = file.name.replace(/\.[^/.]+$/, '');

      // 创建图标对象
      const icon: Icon = {
        id,
        name,
        url: base64,
        collection: '批量导入',
        isIsometric: false
      };

      // 添加到 sceneStore
      sceneStore.addIcon(icon);
    } catch (error) {
      console.error(`处理文件 ${file.name} 时出错:`, error);
    }
  }

  // 清空文件输入框，允许重复选择相同文件
  target.value = '';
};

const handleClearAll = () => {
  if (props.icons.length === 0) return;

  if (
    confirm(`确定要清空所有 ${props.icons.length} 个图标吗？此操作不可撤销。`)
  ) {
    sceneStore.updateIcons([]);
  }
};
</script>

<style scoped>
.icon-list-wrap {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 8px;
  background: #fff;
}
.list-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}
.toolbar-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}
.input {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 13px;
  flex: 1;
}
.btn {
  border: 1px solid #d0d7de;
  background: #fff;
  color: #24292f;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn:hover:not(:disabled) {
  background: #f6f8fa;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f6f8fa;
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
.list-header {
  font-size: 12px;
  color: #475569;
  padding: 4px 6px;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 420px;
  overflow: auto;
}
.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  padding: 6px 8px;
}
.list-item-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.thumb {
  width: 28px;
  height: 28px;
  object-fit: contain;
  border-radius: 4px;
  background: #f8fafc;
}
.list-item-text {
  min-width: 0;
}
.list-item-title {
  font-size: 13px;
  color: #0f172a;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 240px;
}
.list-item-desc {
  font-size: 12px;
  color: #64748b;
}
.muted {
  color: #94a3b8;
  font-weight: normal;
  margin-left: 6px;
}
.list-item-actions {
  display: flex;
  gap: 6px;
}
</style>
