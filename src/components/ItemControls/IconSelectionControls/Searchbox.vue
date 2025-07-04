<template>
  <div class="searchbox-container" :style="containerStyles">
    <div class="input-wrapper" :style="wrapperStyles">
      <svg class="search-icon" :style="iconStyles" viewBox="0 0 24 24">
        <path
          d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
        />
      </svg>
      <input
        class="search-input"
        :style="inputStyles"
        placeholder="Search icons"
        :value="value"
        @input="handleInput"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type CSSProperties } from 'vue';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const props = defineProps<Props>();

const containerStyles = ref<CSSProperties>({
  width: '100%'
});

const wrapperStyles = ref<CSSProperties>({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  border: '1px solid #ddd',
  borderRadius: '4px',
  padding: '8px 12px',
  backgroundColor: 'white'
});

const iconStyles = ref<CSSProperties>({
  width: '20px',
  height: '20px',
  marginRight: '8px',
  fill: '#666',
  flexShrink: '0'
});

const inputStyles = ref<CSSProperties>({
  border: 'none',
  outline: 'none',
  fontSize: '14px',
  width: '100%',
  backgroundColor: 'transparent'
});

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  props.onChange(target.value);
};
</script>

<style scoped>
.searchbox-container {
  /* 搜索框容器样式 */
}

.input-wrapper {
  /* 输入包装器样式 */
}

.input-wrapper:focus-within {
  border-color: #1976d2;
}

.search-icon {
  /* 搜索图标样式 */
}

.search-input {
  /* 搜索输入样式 */
}

.search-input::placeholder {
  color: #999;
}
</style>
