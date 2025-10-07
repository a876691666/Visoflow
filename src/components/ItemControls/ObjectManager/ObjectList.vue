<template>
  <div class="om-list-wrap">
    <div class="om-list-toolbar">
      <input
        class="om-input"
        v-model="keyword"
        placeholder="搜索名称/ID/图标ID"
      />
      <div class="om-count">共 {{ filtered.length }} 项</div>
    </div>
    <div class="om-list">
      <div
        v-for="it in filtered"
        :key="it.id"
        class="om-list-item"
        :draggable="true"
        @dragstart="onDragStart(it)"
        @dragend="onDragEnd(it)"
      >
        <div class="om-item-info" @click="emit('edit', it)">
          <div class="om-avatar">
            <img v-if="getIconUrl(it.icon)" :src="getIconUrl(it.icon)" alt="" />
            <div v-else class="om-avatar-fallback">
              {{ it.name?.[0] || 'I' }}
            </div>
          </div>
          <div class="om-item-text">
            <div class="om-item-title">{{ it.name || '未命名对象' }}</div>
            <div class="om-item-desc">
              ({{ it.id }}) · x: {{ it.tile.x }}, y: {{ it.tile.y }}
            </div>
          </div>
        </div>
        <div class="om-item-actions">
          <button class="btn" @click="emit('edit', it)">编辑</button>
          <button class="btn btn-danger" @click="emit('delete', it)">
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue';
import type { ViewItem } from '@/types';
import { useSceneStore } from 'src/stores/provider';
import { useIsoflowUiStateStore } from 'src/context/isoflowContext';

const emit = defineEmits<{
  (e: 'edit', item: ViewItem): void;
  (e: 'delete', item: ViewItem): void;
}>();

interface Props {
  items: ViewItem[];
}

defineProps<Props>();

const scene = useSceneStore();
const ui = useIsoflowUiStateStore<any>();

const keyword = ref('');

const getIconUrl = (iconId?: string) => {
  if (!iconId) return '';
  const ic = scene.getIcon(iconId);
  return ic?.url || '';
};

const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase();
  const src = scene.items.value as ViewItem[];
  if (!k) return src;
  return src.filter((it) => {
    const name = (it.name || '').toLowerCase();
    const id = it.id.toLowerCase();
    const icon = (it.icon || '').toLowerCase();
    return name.includes(k) || id.includes(k) || icon.includes(k);
  });
});

let draggingId: string | null = null;
const mouseUpHandler = () => {
  if (!draggingId) return;
  // 将对象移动到当前鼠标所在 tile
  const tile = ui.mouse.position.tile;
  scene.updateItem(draggingId, { tile });
  draggingId = null;
  window.removeEventListener('mouseup', mouseUpHandler);
};

const onDragStart = (it: ViewItem) => {
  draggingId = it.id;
  window.addEventListener('mouseup', mouseUpHandler);
};
const onDragEnd = (_it: ViewItem) => {
  // 兜底清理
  if (draggingId) {
    window.removeEventListener('mouseup', mouseUpHandler);
    draggingId = null;
  }
};

onBeforeUnmount(() => {
  if (draggingId) window.removeEventListener('mouseup', mouseUpHandler);
});
</script>

<style scoped>
.om-list-wrap {
  padding: 16px;
}
.om-list-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.om-input {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 13px;
  flex: 1;
}
.om-count {
  font-size: 12px;
  color: #64748b;
}
.btn {
  border: 1px solid #d0d7de;
  background: #fff;
  color: #24292f;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
}
.btn-danger {
  background: #d32f2f;
  color: #fff;
  border: 1px solid #d32f2f;
}
.om-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.om-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  padding: 8px 10px;
  background: #fff;
}
.om-item-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  cursor: pointer;
}
.om-item-text {
  min-width: 0;
}
.om-item-title {
  font-size: 13px;
  color: #0f172a;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 240px;
}
.om-item-desc {
  font-size: 12px;
  color: #64748b;
}
.om-item-actions {
  display: flex;
  gap: 6px;
}
.om-avatar {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  overflow: hidden;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #eef2f7;
}
.om-avatar img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.om-avatar-fallback {
  font-size: 12px;
  color: #94a3b8;
}
</style>
