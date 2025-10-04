<template>
  <button class="expand-button" :style="buttonStyles" @click="handleClick">
    <svg
      v-if="isExpanded"
      class="expand-icon"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z" />
    </svg>
    <svg v-else class="expand-icon" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { ref, watch, type CSSProperties } from 'vue';

interface Props {
  isExpanded: boolean;
  styles?: CSSProperties;
}

const props = withDefaults(defineProps<Props>(), {
  styles: () => ({})
});

const emit = defineEmits<{
  click: [];
}>();

const buttonStyles = ref<CSSProperties>({});

const updateStyles = () => {
  buttonStyles.value = {
    paddingLeft: '4px',
    paddingRight: '4px',
    paddingTop: '0',
    paddingBottom: '0',
    height: 'auto',
    minWidth: '0',
    fontSize: '0.7em',
    bottom: '5px',
    right: '5px',
    color: 'white',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px',
    ...props.styles
  };
};

const handleClick = () => {
  emit('click');
};

// 监听styles变化
watch(() => props.styles, updateStyles, { immediate: true, deep: true });
</script>

<style scoped>
.expand-button {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.expand-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.expand-icon {
  width: 16px;
  height: 16px;
  color: #000;
}
</style>
