<template>
  <div class="section" :style="sectionStyles">
    <div class="stack">
      <h3 v-if="title" class="section-title" :style="titleStyles">
        {{ title }}
      </h3>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, type CSSProperties } from 'vue';

interface Props {
  title?: string;
  styles?: CSSProperties;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  styles: () => ({})
});

const sectionStyles = ref<CSSProperties>({});
const titleStyles = ref<CSSProperties>({});

const updateStyles = () => {
  sectionStyles.value = {
    paddingTop: '24px',
    paddingLeft: '24px',
    paddingRight: '24px',
    ...props.styles
  };

  titleStyles.value = {
    fontSize: '0.875rem',
    color: '#666',
    textTransform: 'uppercase',
    paddingBottom: '8px',
    margin: '0',
    fontWeight: '500'
  };
};

// 监听styles变化
watch([() => props.styles, () => props.title], updateStyles, {
  immediate: true,
  deep: true
});
</script>

<style scoped>
.section {
  /* Section区域样式 */
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  /* 标题样式 */
}
</style>
