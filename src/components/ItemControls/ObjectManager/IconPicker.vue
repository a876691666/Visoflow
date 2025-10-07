<template>
  <div class="icon-picker" ref="rootEl">
    <label class="om-label">
      <span class="om-label-text">图标（可选）</span>
      <div class="picker-input" @click="togglePanel">
        <div class="picker-preview">
          <template v-if="selectedIcon">
            <img :src="selectedIcon.url" alt="icon" />
          </template>
          <div v-else class="picker-empty">未选择</div>
        </div>
        <div class="picker-meta">
          <div class="picker-title">
            {{ selectedIcon?.name || '选择图标' }}
          </div>
          <div v-if="modelValue" class="picker-sub">ID: {{ modelValue }}</div>
        </div>
        <svg class="picker-caret" viewBox="0 0 24 24">
          <path
            d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"
          />
        </svg>
      </div>
    </label>

    <div v-if="open" class="picker-panel">
      <div class="panel-toolbar">
        <input
          class="om-input"
          v-model="keyword"
          placeholder="搜索名称/ID/分组"
        />
        <button class="btn" @click.stop="clearSelection">清除</button>
      </div>
      <div class="panel-grid">
        <IconGrid :icons="filteredIcons" @click="onPick" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue';
import type { Icon } from '@/types';
import { useSceneStore } from 'src/stores/provider';
import IconGrid from '@/components/ItemControls/IconSelectionControls/IconGrid.vue';

interface Props {
  modelValue?: string;
}
const props = withDefaults(defineProps<Props>(), {});
const emit = defineEmits<{ 'update:modelValue': [val?: string] }>();

const scene = useSceneStore();
const icons = computed<Icon[]>(() => scene.icons.value || []);

const open = ref(false);
const keyword = ref('');
const rootEl = ref<HTMLElement | null>(null);

const selectedIcon = computed<Icon | undefined>(() => {
  if (!props.modelValue) return undefined;
  return icons.value.find((i) => i.id === props.modelValue);
});

const filteredIcons = computed<Icon[]>(() => {
  const k = keyword.value.trim().toLowerCase();
  const src = icons.value;
  if (!k) return src;
  return src.filter((i) => {
    const name = (i.name || '').toLowerCase();
    const id = (i.id || '').toLowerCase();
    const col = (i.collection || '').toLowerCase();
    return name.includes(k) || id.includes(k) || col.includes(k);
  });
});

const togglePanel = () => {
  open.value = !open.value;
};

const closePanel = () => {
  open.value = false;
};

const onPick = (icon: Icon) => {
  emit('update:modelValue', icon.id);
  closePanel();
};

const clearSelection = () => {
  emit('update:modelValue', undefined);
};

const handleOutside = (e: MouseEvent) => {
  const target = e.target as Node | null;
  if (open.value && rootEl.value && target && !rootEl.value.contains(target)) {
    closePanel();
  }
};

onMounted(() => {
  window.addEventListener('mousedown', handleOutside);
});
onBeforeUnmount(() => {
  window.removeEventListener('mousedown', handleOutside);
});
</script>

<style scoped>
.icon-picker {
  position: relative;
}

.picker-input {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  background: #fff;
}

.picker-preview {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #f8fafc;
  border: 1px solid #eef2f7;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.picker-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.picker-empty {
  font-size: 12px;
  color: #94a3b8;
}

.picker-meta {
  flex: 1;
  min-width: 0;
}
.picker-title {
  font-size: 13px;
  color: #0f172a;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.picker-sub {
  font-size: 12px;
  color: #64748b;
}
.picker-caret {
  width: 18px;
  height: 18px;
  fill: #94a3b8;
}

.picker-panel {
  position: absolute;
  z-index: 10;
  left: 0;
  right: 0;
  margin-top: 6px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 10px;
}

.panel-toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
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

.panel-grid {
  max-height: 260px;
  overflow: auto;
}
</style>
