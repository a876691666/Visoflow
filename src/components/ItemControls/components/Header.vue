<template>
  <Section :styles="sectionStyles">
    <div class="grid-container">
      <div class="grid-item">
        <div class="title-container" :style="titleContainerStyles">
          <span class="title-text" :style="titleTextStyles">{{ title }}</span>
        </div>
      </div>
    </div>
  </Section>
</template>

<script setup lang="ts">
import { ref, watch, type CSSProperties } from 'vue';
import Section from './Section.vue';

interface Props {
  title: string;
}

const props = defineProps<Props>();

const sectionStyles = ref<CSSProperties>({});
const titleContainerStyles = ref<CSSProperties>({});
const titleTextStyles = ref<CSSProperties>({});

const updateStyles = () => {
  sectionStyles.value = {
    paddingTop: '24px',
    paddingBottom: '24px'
  };

  titleContainerStyles.value = {
    display: 'flex',
    alignItems: 'center',
    height: '100%'
  };

  titleTextStyles.value = {
    fontSize: '0.875rem',
    color: '#666',
    fontWeight: '400'
  };
};

// 初始化样式
watch(() => props.title, updateStyles, { immediate: true });
</script>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  width: 100%;
}

.grid-item {
  min-width: 0;
}

.title-container {
  /* 标题容器样式 */
}

.title-text {
  /* 标题文本样式 */
}
</style>
