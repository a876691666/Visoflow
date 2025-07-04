<template>
  <Section :styles="sectionStyles">
    <button class="expand-button" :style="buttonStyles" @click="toggleExpanded">
      <div class="button-content" :style="contentStyles">
        <span class="category-title" :style="titleStyles">{{ id }}</span>
        <svg class="chevron-icon" :style="iconStyles" viewBox="0 0 24 24">
          <path
            v-if="isExpanded"
            d="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z"
          />
          <path
            v-else
            d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"
          />
        </svg>
      </div>
    </button>

    <div class="divider" :style="dividerStyles"></div>

    <IconGrid
      v-if="isExpanded"
      :icons="icons"
      @click="handleIconClick"
      @mouse-down="handleIconMouseDown"
    />
  </Section>
</template>

<script setup lang="ts">
import { ref, watch, type CSSProperties } from 'vue';
import type { Icon as IconI } from '@/types';
import Section from '@/components/ItemControls/components/Section.vue';
import IconGrid from './IconGrid.vue';

interface Props {
  id?: string;
  icons: IconI[];
  onClick?: (icon: IconI) => void;
  onMouseDown?: (icon: IconI) => void;
  isExpanded: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  id: 'Uncategorised',
  onClick: undefined,
  onMouseDown: undefined
});

const emit = defineEmits<{
  click: [icon: IconI];
  'mouse-down': [icon: IconI];
}>();

const isExpanded = ref(props.isExpanded);

const sectionStyles = ref<CSSProperties>({});
const buttonStyles = ref<CSSProperties>({});
const contentStyles = ref<CSSProperties>({});
const titleStyles = ref<CSSProperties>({});
const iconStyles = ref<CSSProperties>({});
const dividerStyles = ref<CSSProperties>({});

const updateStyles = () => {
  sectionStyles.value = {
    paddingTop: '0',
    paddingBottom: '0'
  };

  buttonStyles.value = {
    width: '100%',
    padding: '8px 0',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '14px'
  };

  contentStyles.value = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    gap: '16px'
  };

  titleStyles.value = {
    fontSize: '0.875rem',
    color: '#666',
    textTransform: 'uppercase',
    fontWeight: '600'
  };

  iconStyles.value = {
    width: '20px',
    height: '20px',
    fill: '#999',
    flexShrink: '0'
  };

  dividerStyles.value = {
    height: '1px',
    backgroundColor: '#e0e0e0',
    margin: '8px 0'
  };
};

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};

const handleIconClick = (icon: IconI) => {
  if (props.onClick) {
    props.onClick(icon);
  }
  emit('click', icon);
};

const handleIconMouseDown = (icon: IconI) => {
  if (props.onMouseDown) {
    props.onMouseDown(icon);
  }
  emit('mouse-down', icon);
};

// 监听props.isExpanded变化
watch(
  () => props.isExpanded,
  (newValue) => {
    isExpanded.value = newValue;
  },
  { immediate: true }
);

// 初始化样式
updateStyles();
</script>

<style scoped>
.expand-button {
  /* 展开按钮样式 */
}

.expand-button:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.button-content {
  /* 按钮内容样式 */
}

.category-title {
  /* 分类标题样式 */
}

.chevron-icon {
  /* 箭头图标样式 */
}

.divider {
  /* 分割线样式 */
}
</style>
