<template>
  <div class="manage-list" :style="manageListStyles">
    <div class="list-header" :style="listHeaderStyles">
      视图列表（{{ allViews.length }}）
    </div>
    <div class="list" :style="listStyles">
      <div
        v-for="v in allViews"
        :key="v.id"
        class="list-item"
        :style="[
          listItemStyles,
          v.id === currentViewId ? selectedItemStyles : {}
        ]"
      >
        <div class="list-item-info" :style="listItemInfoStyles">
          <div :style="listItemTextStyles">
            <div :style="listItemTitleStyles">{{ v.name }}</div>
            <div :style="listItemDescStyles">{{ v.description || '—' }}</div>
          </div>
        </div>
        <div class="list-item-actions" :style="listItemActionsStyles">
          <button
            class="btn"
            :style="btnSmallStyles"
            @click="$emit('select', v.id)"
          >
            切换
          </button>
          <button class="btn" :style="btnSmallStyles" @click="$emit('edit', v)">
            编辑
          </button>
          <button
            class="btn"
            :style="btnSmallStyles"
            @click="$emit('duplicate', v.id)"
          >
            复制
          </button>
          <button
            class="btn btn-danger"
            :style="btnSmallDangerStyles"
            @click="$emit('delete', v.id)"
          >
            删除
          </button>
        </div>
      </div>
    </div>

    <div class="divider" style="margin: 8px 0"></div>
    <div class="list-header" :style="listHeaderStyles">
      当前视图要素对象分类统计
    </div>
    <div class="stats" :style="statsListStyles">
      <div v-if="categoryStats.length === 0" :style="emptyStyles">暂无要素</div>
      <div v-for="s in categoryStats" :key="s.key" :style="statItemStyles">
        <span :style="statKeyStyles">{{ s.label }}</span>
        <span :style="statValStyles">{{ s.count }}</span>
      </div>
    </div>

    <div class="divider" style="margin: 8px 0"></div>
    <div class="list-header" :style="listHeaderStyles">
      当前视图要素类型统计
    </div>
    <div class="stats" :style="statsListStyles">
      <div v-for="s in elementTypeStats" :key="s.key" :style="statItemStyles">
        <span :style="statKeyStyles">{{ s.label }}</span>
        <span :style="statValStyles">{{ s.count }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type CSSProperties } from 'vue';
import type { View } from '@/types';
import { useSceneStore } from 'src/stores/provider';

const emit = defineEmits<{
  (e: 'select', id: string): void;
  (e: 'edit', v: View): void;
  (e: 'delete', id: string): void;
  (e: 'duplicate', id: string): void;
}>();

const store = useSceneStore();
const currentViewId = computed(() => store.view.value);
const allViews = computed<View[]>(() => store.views.value);

// 统计
const categoryStats = computed(() => {
  const cur = store.getCurrentView();
  if (!cur) return [] as { key: string; label: string; count: number }[];
  const iconsIndex = new Map(store.icons.value.map((i) => [i.id, i]));
  const map = new Map<string, number>();
  for (const it of cur.items) {
    const icon = it.icon ? iconsIndex.get(it.icon) : undefined;
    const collection = icon?.collection || '未分组';
    map.set(collection, (map.get(collection) || 0) + 1);
  }
  return Array.from(map.entries()).map(([key, count]) => ({
    key,
    label: key,
    count
  }));
});

const elementTypeStats = computed(() => {
  const cur = store.getCurrentView();
  const items = cur?.items?.length || 0;
  const connectors = cur?.connectors?.length || 0;
  const rectangles = cur?.rectangles?.length || 0;
  const textBoxes = cur?.textBoxes?.length || 0;
  return [
    { key: 'items', label: '对象', count: items },
    { key: 'connectors', label: '连线', count: connectors },
    { key: 'rectangles', label: '区块', count: rectangles },
    { key: 'textBoxes', label: '文本', count: textBoxes }
  ];
});

// 样式（沿用原有样式）
const btnStyles = ref<CSSProperties>({
  border: '1px solid #d0d7de',
  background: '#fff',
  color: '#24292f',
  borderRadius: '6px',
  padding: '6px 10px',
  fontSize: '12px',
  cursor: 'pointer'
});
const btnSmallStyles = ref<CSSProperties>({
  ...btnStyles.value,
  padding: '4px 8px',
  fontSize: '12px'
});
const btnSmallDangerStyles = ref<CSSProperties>({
  ...btnStyles.value,
  background: '#d32f2f',
  color: '#fff',
  border: '1px solid #d32f2f',
  padding: '4px 8px',
  fontSize: '12px'
});

const manageListStyles = ref<CSSProperties>({
  border: '1px solid #eee',
  borderRadius: '8px',
  padding: '8px',
  background: '#fff',
  maxHeight: '420px',
  overflow: 'auto'
});
const listHeaderStyles = ref<CSSProperties>({
  fontSize: '12px',
  color: '#475569',
  padding: '4px 6px'
});
const listStyles = ref<CSSProperties>({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
});
const listItemStyles = ref<CSSProperties>({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
  border: '1px solid #f1f5f9',
  borderRadius: '8px',
  padding: '6px 8px'
});
const selectedItemStyles = ref<CSSProperties>({
  borderColor: '#1976d2',
  boxShadow: '0 0 0 2px rgba(25,118,210,0.08)'
});
const listItemInfoStyles = ref<CSSProperties>({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  minWidth: 0
});
const listItemTextStyles = ref<CSSProperties>({ minWidth: 0 });
const listItemTitleStyles = ref<CSSProperties>({
  fontSize: '13px',
  color: '#0f172a',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  maxWidth: '240px'
});
const listItemDescStyles = ref<CSSProperties>({
  fontSize: '12px',
  color: '#64748b'
});
const listItemActionsStyles = ref<CSSProperties>({
  display: 'flex',
  gap: '6px'
});

const statsListStyles = ref<CSSProperties>({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  padding: '4px 6px'
});
const emptyStyles = ref<CSSProperties>({ fontSize: '12px', color: '#94a3b8' });
const statItemStyles = ref<CSSProperties>({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  border: '1px dashed #e2e8f0',
  borderRadius: '8px',
  padding: '6px 8px'
});
const statKeyStyles = ref<CSSProperties>({
  fontSize: '12px',
  color: '#334155'
});
const statValStyles = ref<CSSProperties>({
  fontSize: '12px',
  color: '#0f172a',
  fontWeight: 600
});
</script>

<style scoped>
.manage-list {
  box-sizing: border-box;
}
</style>
