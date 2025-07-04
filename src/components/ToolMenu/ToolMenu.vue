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
import { ref, onMounted } from 'vue';
import IconButton from '../IconButton/IconButton.vue';
import { useGSAPAnimations } from 'src/hooks/useGSAPAnimations';

interface Tool {
  id: string;
  name: string;
  icon: string;
  isActive: boolean;
}

const tools = ref<Tool[]>([
  { id: 'cursor', name: 'Cursor', icon: '↖', isActive: true },
  { id: 'pan', name: 'Pan', icon: '✋', isActive: false },
  { id: 'icon', name: 'Add Icon', icon: '📦', isActive: false },
  { id: 'connector', name: 'Connector', icon: '🔗', isActive: false },
  { id: 'rectangle', name: 'Rectangle', icon: '▭', isActive: false },
  { id: 'textbox', name: 'Text Box', icon: 'T', isActive: false }
]);

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

const handleToolClick = (tool: Tool) => {
  // Reset all tools
  tools.value.forEach((t) => (t.isActive = false));
  // Activate clicked tool
  tool.isActive = true;

  // Add pulse animation to clicked tool
  const clickedButton = document.querySelector(
    `[data-tool-id="${tool.id}"]`
  ) as HTMLElement;
  if (clickedButton) {
    pulse(clickedButton);
  }

  console.log('Tool selected:', tool.name);
  // Tool selection logic will be implemented here
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
  flex-direction: column;
}

.tool-icon {
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
