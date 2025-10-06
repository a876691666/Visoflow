<template>
  <div class="main-menu" ref="menuRootRef">
    <IconButton name="Main Menu" @click="toggleMenu">
      <template #icon>
        <div class="menu-icon">☰</div>
      </template>
    </IconButton>

    <div v-if="isMenuOpen" class="menu-dropdown">
      <!-- Hidden file input for ACTION.OPEN -->
      <input
        v-if="hasOption('ACTION.OPEN')"
        ref="fileInputRef"
        type="file"
        accept="application/json,.json"
        class="hidden-file-input"
        @change="onFileSelected"
      />

      <div
        v-for="(entry, idx) in renderedMenu"
        :key="`menu-${idx}-${entry.type}`"
      >
        <div v-if="entry.type === 'separator'" class="menu-separator"></div>

        <div
          v-else-if="entry.type === 'item'"
          class="menu-item"
          :class="{ 'menu-item--disabled': entry.disabled }"
          @click="!entry.disabled && entry.onClick && entry.onClick()"
        >
          <span>{{ entry.label }}</span>
          <span v-if="entry.secondary" class="menu-secondary">{{
            entry.secondary
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue';
import IconButton from '../IconButton/IconButton.vue';
import { useIsoflowUiStateStore } from 'src/context/isoflowContext';
import { useSceneStore } from 'src/stores/provider';
import { exportAsJSON } from 'src/utils/exportOptions';
import { useInitialDataManager } from 'src/hooks/useInitialDataManager';
import type { MainMenuOptions } from 'src/types';
import packageJson from '../../../package.json';

const uiStateStore = useIsoflowUiStateStore<any>();
const sceneStore = useSceneStore();
const initialDataManager = useInitialDataManager(sceneStore);

const menuRootRef = ref<HTMLElement | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

const isMenuOpen = computed({
  get: () => uiStateStore.isMainMenuOpen,
  set: (val: boolean) => uiStateStore.setIsMainMenuOpen(val)
});

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

// Options helpers
const options = computed<MainMenuOptions>(
  () => uiStateStore.mainMenuOptions || []
);
const hasOption = (opt: MainMenuOptions[number]) => options.value.includes(opt);

// Actions
const onFileSelected = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files && input.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    const json = JSON.parse(text);
    initialDataManager.clear();
    initialDataManager.load(json);
  } catch (err) {
    console.error('Failed to load JSON:', err);
    window.alert('无法加载所选的 JSON 文件。');
  } finally {
    input.value = '';
    isMenuOpen.value = false;
  }
};

const doOpen = () => {
  fileInputRef.value?.click();
};

const doExportJSON = () => {
  try {
    // 使用 provider 的聚合导出，确保 items 已同步回 model.items
    exportAsJSON(sceneStore.getExportModel());
  } catch (e) {
    console.error('Export JSON failed', e);
  } finally {
    isMenuOpen.value = false;
  }
};

const doExportPNG = () => {
  uiStateStore.setDialog('EXPORT_IMAGE');
  isMenuOpen.value = false;
};

const doClearCanvas = () => {
  initialDataManager.clear();
  isMenuOpen.value = false;
};

const openLink = (url: string) => {
  window.open(url, '_blank');
  isMenuOpen.value = false;
};

const versionText = computed(() =>
  packageJson?.version ? `v${packageJson.version}` : ''
);

// Build menu entries from options
type MenuEntry =
  | {
      type: 'item';
      label: string;
      onClick?: () => void;
      disabled?: boolean;
      secondary?: string;
    }
  | { type: 'separator' };

const renderedMenu = computed<MenuEntry[]>(() => {
  const entries: MenuEntry[] = [];

  if (hasOption('ACTION.OPEN')) {
    entries.push({ type: 'item', label: '打开…', onClick: doOpen });
  }

  if (hasOption('EXPORT.JSON')) {
    entries.push({ type: 'item', label: '导出为 JSON', onClick: doExportJSON });
  }

  if (hasOption('EXPORT.PNG')) {
    entries.push({ type: 'item', label: '导出为 PNG…', onClick: doExportPNG });
  }

  // Insert separator if previous entries exist and we have clear action or links/version coming
  const willHaveMore =
    hasOption('ACTION.CLEAR_CANVAS') ||
    hasOption('LINK.DISCORD') ||
    hasOption('LINK.GITHUB') ||
    hasOption('VERSION');
  if (entries.length > 0 && willHaveMore) entries.push({ type: 'separator' });

  if (hasOption('ACTION.CLEAR_CANVAS')) {
    entries.push({ type: 'item', label: '清空画布', onClick: doClearCanvas });
  }

  if (hasOption('LINK.DISCORD')) {
    entries.push({
      type: 'item',
      label: 'Discord',
      onClick: () => openLink('https://discord.gg/QYPkvZth7D')
    });
  }

  if (hasOption('LINK.GITHUB')) {
    entries.push({
      type: 'item',
      label: 'GitHub',
      onClick: () => openLink('https://github.com/a876691666/Visoflow')
    });
  }

  if (hasOption('VERSION')) {
    // Non-clickable version row
    entries.push({
      type: 'item',
      label: '版本',
      disabled: true,
      secondary: versionText.value
    });
  }

  return entries;
});

// Click outside to close
const onGlobalPointerDown = (e: MouseEvent | PointerEvent) => {
  if (!isMenuOpen.value) return;
  const root = menuRootRef.value;
  const target = e.target as Node | null;
  if (root && target && !root.contains(target)) {
    isMenuOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener('pointerdown', onGlobalPointerDown, {
    capture: true
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('pointerdown', onGlobalPointerDown, {
    capture: true
  } as any);
});
</script>

<style scoped>
.main-menu {
  position: relative;
}

.menu-icon {
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  z-index: 1000;
  margin-top: 4px;
}

.menu-item {
  padding: 12px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.menu-item:hover {
  background-color: #f5f5f5;
}

.menu-item--disabled {
  cursor: default;
  color: #999;
}

.menu-item:first-child {
  border-radius: 8px 8px 0 0;
}

.menu-item:last-child {
  border-radius: 0 0 8px 8px;
}

.menu-separator {
  height: 1px;
  background-color: #e0e0e0;
  margin: 4px 0;
}

.menu-secondary {
  margin-left: 12px;
  font-size: 12px;
  color: #777;
}

.hidden-file-input {
  display: none;
}
</style>
