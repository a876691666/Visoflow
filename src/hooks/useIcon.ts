import { ref, watch, h, type VNode } from 'vue';
import IsometricIcon from '@/components/SceneLayers/Nodes/Node/IconTypes/IsometricIcon.vue';
import NonIsometricIcon from '@/components/SceneLayers/Nodes/Node/IconTypes/NonIsometricIcon.vue';
import { DEFAULT_ICON } from '@/config';
import { useSceneStore } from 'src/stores/provider';

export const useIcon = (id: string | undefined) => {
  const hasLoaded = ref(false);
  const icon = ref<any>(DEFAULT_ICON);
  const iconComponent = ref<VNode | null>(null);

  const sceneStore = useSceneStore();
  const icons = sceneStore.icons;

  const updateIcon = () => {
    if (!id) {
      icon.value = DEFAULT_ICON;
    } else {
      const foundIcon = sceneStore.getIcon(id);
      icon.value = foundIcon || DEFAULT_ICON;
    }
  };

  const updateIconComponent = () => {
    if (!icon.value.isIsometric) {
      hasLoaded.value = true;
      iconComponent.value = h(NonIsometricIcon, { icon: icon.value });
    } else {
      iconComponent.value = h(IsometricIcon, {
        url: icon.value.url,
        onImageLoaded: () => {
          hasLoaded.value = true;
        }
      });
    }
  };

  const resetLoadState = () => {
    hasLoaded.value = false;
  };

  // 监听ID变化更新图标
  watch(
    () => id,
    () => {
      updateIcon();
      updateIconComponent();
    },
    { immediate: true }
  );

  // 监听图标URL变化重置加载状态
  watch(() => icon.value?.url, resetLoadState);

  // 监听icons store变化
  watch(icons, updateIcon);

  return {
    icon,
    iconComponent,
    hasLoaded
  };
};
