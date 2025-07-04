<template>
  <button class="delete-button" :style="buttonStyles" @click="handleClick">
    <svg class="delete-icon" :style="iconStyles" viewBox="0 0 24 24">
      <path
        d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"
      />
    </svg>
    Delete
  </button>
</template>

<script setup lang="ts">
import { ref, type CSSProperties } from 'vue';

interface Props {
  onClick: () => void;
}

const props = defineProps<Props>();

const buttonStyles = ref<CSSProperties>({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 16px',
  fontSize: '0.875rem',
  border: '1px solid #d32f2f',
  backgroundColor: 'transparent',
  color: '#d32f2f',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out'
});

const iconStyles = ref<CSSProperties>({
  width: '16px',
  height: '16px',
  fill: '#d32f2f'
});

const handleClick = () => {
  props.onClick();
};
</script>

<style scoped>
.delete-button:hover {
  background-color: rgba(211, 47, 47, 0.04);
}

.delete-button:active {
  background-color: rgba(211, 47, 47, 0.12);
}

.delete-icon {
  /* 删除图标样式 */
}
</style>
