<template>
  <div ref="toolMenuRef" class="tool-menu">
    <div class="tool-menu-content">
      <IconButton
        v-for="tool in tools"
        :key="tool.id"
        :name="tool.name"
        :is-active="tool.isActive"
        :data-tool-id="tool.id"
        @click="handleToolClick(tool)"
      >
        <template #icon>
          <div class="tool-icon">{{ tool.icon }}</div>
        </template>
      </IconButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import IconButton from '../IconButton/IconButton.vue';
import { useGSAPAnimations } from 'src/hooks/useGSAPAnimations';
import { useIsoflowUiStateStore } from 'src/context/isoflowContext';
import { useScene } from 'src/hooks/useScene';
import { TEXTBOX_DEFAULTS } from 'src/config';
import { generateId } from 'src/utils';

interface Tool {
  id: string;
  name: string;
  icon: string;
  isActive: boolean;
}

const uiStateStore = useIsoflowUiStateStore<any>();

const rawTools = ref<Omit<Tool, 'isActive'>[]>([
  { id: 'cursor', name: 'Cursor', icon: '↖' },
  { id: 'pan', name: 'Pan', icon: '✋' },
  { id: 'icon', name: 'Add Icon', icon: '📦' },
  { id: 'connector', name: 'Connector', icon: '🔗' },
  { id: 'rectangle', name: 'Rectangle', icon: '▭' },
  { id: 'textbox', name: 'Text Box', icon: 'T' }
]);

const tools = computed<Tool[]>(() => {
  const mode = uiStateStore.mode?.type ?? 'CURSOR';
  return rawTools.value.map((t) => ({
    ...t,
    isActive:
      (t.id === 'cursor' && (mode === 'CURSOR' || mode === 'DRAG_ITEMS')) ||
      (t.id === 'pan' && mode === 'PAN') ||
      (t.id === 'icon' && mode === 'PLACE_ICON') ||
      (t.id === 'connector' && mode === 'CONNECTOR') ||
      (t.id === 'rectangle' &&
        (mode === 'RECTANGLE.DRAW' || mode === 'RECTANGLE.TRANSFORM')) ||
      (t.id === 'textbox' && mode === 'TEXTBOX')
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
});

const { createTextBox } = useScene();

const createTextBoxProxy = () => {
  const textBoxId = generateId();
  const mouseTile = uiStateStore.mouse?.position?.tile;

  createTextBox({
    ...TEXTBOX_DEFAULTS,
    id: textBoxId,
    tile: mouseTile
  } as any);

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
      uiStateStore.setMode({ type: 'PLACE_ICON', showCursor: true, id: null });
      uiStateStore.setItemControls({ type: 'ADD_ITEM' });
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
}

.tool-menu-content {
  display: flex;
  flex-direction: row;
}

.tool-icon {
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
