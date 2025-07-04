<template>
  <div class="controls-container" :style="containerStyles">
    <div v-if="header" class="header-section" :style="headerStyles">
      <slot name="header" />
      <div class="divider"></div>
    </div>
    <div class="content-section" :style="contentStyles">
      <div class="content-wrapper">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, type CSSProperties } from 'vue';

interface Props {
  header?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  header: false
});

const containerStyles = ref<CSSProperties>({});
const headerStyles = ref<CSSProperties>({});
const contentStyles = ref<CSSProperties>({});

const updateStyles = () => {
  containerStyles.value = {
    position: 'relative',
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: '16px'
  };

  headerStyles.value = {
    width: '100%',
    zIndex: '1',
    position: 'sticky',
    backgroundColor: 'white',
    top: '0'
  };

  contentStyles.value = {
    width: '100%',
    flexGrow: '1'
  };
};

// 初始化样式
watch(() => props.header, updateStyles, { immediate: true });
</script>

<style scoped>
.controls-container {
  /* 控制容器样式 */
}

.header-section {
  /* 头部区域样式 */
}

.content-section {
  /* 内容区域样式 */
}

.content-wrapper {
  width: 100%;
}

.divider {
  height: 1px;
  background-color: #e0e0e0;
  margin: 8px 0;
}
</style>
