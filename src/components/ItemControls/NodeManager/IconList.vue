<template>
  <div class="icon-list-wrap">
    <div class="list-toolbar">
      <input
        class="input"
        v-model="keyword"
        placeholder="搜索图标名称/ID/分组"
      />
      <button class="btn btn-primary" @click="$emit('add')">新增图标</button>
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

const props = defineProps<{
  icons: Icon[];
}>();

defineEmits<{
  (e: 'add'): void;
  (e: 'edit', icon: Icon): void;
  (e: 'delete', icon: Icon): void;
}>();

const keyword = ref('');
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
