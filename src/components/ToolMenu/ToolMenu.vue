<template>
  <div ref="toolMenuRef" class="tool-menu">
    <div class="tool-menu-content">
      <IconButton
        v-for="(tool, idx) in tools"
        :key="tool.id"
        :name="tool.name"
        :is-active="tool.isActive"
        :data-tool-id="tool.id"
        @click="handleToolClick(tool)"
      >
        <template #icon>
          <div class="tool-text">
            <span class="tool-label">{{ tool.label }}</span>
            <span v-if="idx < 9" class="shortcut-badge">{{ idx + 1 }}</span>
          </div>
        </template>
      </IconButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import IconButton from '../IconButton/IconButton.vue';
import { useGSAPAnimations } from 'src/hooks/useGSAPAnimations';
import { useIsoflowUiStateStore } from 'src/context/isoflowContext';
import { TEXTBOX_DEFAULTS } from 'src/config';
import { generateId } from 'src/utils';
import { useSceneStore } from 'src/stores/provider';
import { syncTextBox } from 'src/stores/reducers/textBox';

interface Tool {
  id: string; // 内部 id，用于切换逻辑
  name: string; // tooltip 名称
  label: string; // 展示在按钮上的中文文字
  isActive: boolean;
}

const uiStateStore = useIsoflowUiStateStore<any>();

// 1-9 顺序：拖拽、移动、连线、区域、文字、图标管理、对象管理、视图管理、地面配置
const rawTools = ref<Omit<Tool, 'isActive'>[]>([
  { id: 'cursor', name: '拖拽', label: '拖拽' },
  { id: 'pan', name: '移动', label: '移动' },
  { id: 'connector', name: '连线', label: '连线' },
  { id: 'rectangle', name: '区域', label: '区域' },
  { id: 'textbox', name: '文字', label: '文字' },
  { id: 'icon', name: '图标管理', label: '图标管理' },
  { id: 'objectManager', name: '对象管理', label: '对象管理' },
  { id: 'viewManager', name: '视图管理', label: '视图管理' },
  { id: 'groundConfig', name: '地面配置', label: '地面配置' }
]);

const tools = computed<Tool[]>(() => {
  const mode = uiStateStore.mode?.type ?? 'CURSOR';
  return rawTools.value.map((t) => ({
    ...t,
    isActive:
      (t.id === 'cursor' && (mode === 'CURSOR' || mode === 'DRAG_ITEMS')) ||
      (t.id === 'pan' && mode === 'PAN') ||
      (t.id === 'connector' && mode === 'CONNECTOR') ||
      (t.id === 'rectangle' &&
        (mode === 'RECTANGLE.DRAW' || mode === 'RECTANGLE.TRANSFORM')) ||
      (t.id === 'textbox' && mode === 'TEXTBOX') ||
      // 管理类面板以 itemControls 判断激活态
      (t.id === 'icon' && uiStateStore.itemControls?.type === 'NODE_MANAGER') ||
      (t.id === 'objectManager' &&
        uiStateStore.itemControls?.type === 'OBJECT_MANAGER') ||
      (t.id === 'viewManager' &&
        uiStateStore.itemControls?.type === 'VIEW_MANAGER') ||
      (t.id === 'groundConfig' &&
        uiStateStore.itemControls?.type === 'GROUND_CONFIG')
  }));
});

const { staggerIn, pulse } = useGSAPAnimations();
const toolMenuRef = ref<HTMLElement>();

onMounted(() => {
  // Animate tool menu entrance
  if (toolMenuRef.value) {
    const toolButtons = toolMenuRef.value.querySelectorAll(
      '.icon-button'
    ) as NodeListOf<HTMLElement>;
    staggerIn(Array.from(toolButtons), 0.3, 0.1);
  }

  const onKeydown = (e: KeyboardEvent) => {
    // 忽略在输入框/文本域/可编辑元素中输入
    const target = e.target as HTMLElement | null;
    const tag = (target?.tagName || '').toLowerCase();
    const isEditable =
      tag === 'input' ||
      tag === 'textarea' ||
      (target?.isContentEditable ?? false) ||
      (target as HTMLInputElement)?.type === 'text';
    if (isEditable) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    // 1-9 映射到工具顺序
    const key = e.key;
    if (/^[1-9]$/.test(key)) {
      const idx = parseInt(key, 10) - 1;
      const tool = rawTools.value[idx];
      if (tool) {
        handleToolClick({ ...tool, isActive: false });
        e.preventDefault();
      }
    }
  };

  window.addEventListener('keydown', onKeydown);

  // 清理监听
  onUnmounted(() => {
    window.removeEventListener('keydown', onKeydown);
  });
});

const sceneStore = useSceneStore();

const createTextBoxProxy = () => {
  const textBoxId = generateId();
  const mouseTile = uiStateStore.mouse?.position?.tile;

  sceneStore.addTextBox({
    ...TEXTBOX_DEFAULTS,
    id: textBoxId,
    tile: mouseTile
  } as any);
  syncTextBox(textBoxId, sceneStore);

  uiStateStore.setMode({
    type: 'TEXTBOX',
    showCursor: false,
    id: textBoxId
  } as any);
};

const handleToolClick = (tool: Tool) => {
  // Add pulse animation to clicked tool
  const clickedButton = document.querySelector(
    `[data-tool-id="${tool.id}"]`
  ) as HTMLElement;
  if (clickedButton) {
    pulse(clickedButton);
  }

  // Update global mode
  switch (tool.id) {
    case 'cursor':
      uiStateStore.setMode({
        type: 'CURSOR',
        showCursor: true,
        mousedownItem: null
      });
      uiStateStore.setItemControls(null);
      break;
    case 'pan':
      uiStateStore.setMode({ type: 'PAN', showCursor: false });
      uiStateStore.setItemControls(null);
      break;
    case 'icon':
      // 进入图标管理：保持交互为指针或禁用交互，这里维持 CURSOR 以便仍可观察画布
      if (uiStateStore.mode?.type !== 'CURSOR') {
        uiStateStore.setMode({
          type: 'CURSOR',
          showCursor: true,
          mousedownItem: null
        });
      }
      uiStateStore.setItemControls({ type: 'NODE_MANAGER' } as any);
      break;
    case 'connector':
      uiStateStore.setMode({ type: 'CONNECTOR', showCursor: true, id: null });
      uiStateStore.setItemControls(null);
      break;
    case 'rectangle':
      uiStateStore.setMode({
        type: 'RECTANGLE.DRAW',
        showCursor: true,
        id: null
      });
      uiStateStore.setItemControls(null);
      break;
    case 'textbox':
      // Create a new TextBox at current mouse tile and switch to edit mode
      createTextBoxProxy();
      break;
    case 'objectManager':
      if (uiStateStore.mode?.type !== 'CURSOR') {
        uiStateStore.setMode({
          type: 'CURSOR',
          showCursor: true,
          mousedownItem: null
        });
      }
      uiStateStore.setItemControls({ type: 'OBJECT_MANAGER' } as any);
      break;
    case 'viewManager':
      if (uiStateStore.mode?.type !== 'CURSOR') {
        uiStateStore.setMode({
          type: 'CURSOR',
          showCursor: true,
          mousedownItem: null
        });
      }
      uiStateStore.setItemControls({ type: 'VIEW_MANAGER' } as any);
      break;
    case 'groundConfig':
      if (uiStateStore.mode?.type !== 'CURSOR') {
        uiStateStore.setMode({
          type: 'CURSOR',
          showCursor: true,
          mousedownItem: null
        });
      }
      uiStateStore.setItemControls({ type: 'GROUND_CONFIG' } as any);
      break;
  }
};
</script>

<style scoped>
.tool-menu {
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 6px;
}

.tool-menu-content {
  display: flex;
  flex-direction: row;
  gap: 8px;
}

.tool-text {
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.tool-label {
  font-weight: 500;
  white-space: nowrap;
  color: #000;
}

.shortcut-badge {
  font-size: 12px;
  line-height: 1;
  padding: 3px 6px;
  border-radius: 6px;
  background: #eef5ff;
  color: #1e5bd6;
  border: 1px solid #d6e4ff;
}

/* 覆盖子组件按钮默认 40x40 的样式，改为胶囊状文字按钮 */
:deep(.icon-button) {
  width: auto !important;
  min-width: unset !important;
  height: 32px !important;
  padding: 0 10px !important;
  border-radius: 999px !important;
  border: 1px solid #e6e6e6 !important;
  background-color: #ffffff !important;
}

:deep(.icon-button:hover):not(:disabled) {
  background-color: #f7f9fc !important;
}

:deep(.icon-button--active) {
  background-color: #e9f2ff !important;
  border-color: #8bb7ff !important;
}
</style>
