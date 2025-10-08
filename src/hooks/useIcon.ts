import { ref, watch, h, type VNode, Ref } from 'vue';
import IsometricIcon from '@/components/SceneLayers/Nodes/Node/IconTypes/IsometricIcon.vue';
import NonIsometricIcon from '@/components/SceneLayers/Nodes/Node/IconTypes/NonIsometricIcon.vue';
import { DEFAULT_ICON } from '@/config';
import { useSceneStore } from 'src/stores/provider';
import { ViewItem } from 'src/types';

export const useIcon = (itemRef: Ref<ViewItem | null>) => {
  const hasLoaded = ref(false);
  const icon = ref(DEFAULT_ICON);
  const iconComponent = ref<VNode | null>(null);

  const sceneStore = useSceneStore();
  const icons = sceneStore.icons;

  const updateIcon = () => {
    const iconId = itemRef.value?.icon;
    if (iconId) {
      icon.value = sceneStore.getIcon(iconId) || DEFAULT_ICON;
      return;
    }
    icon.value = DEFAULT_ICON;
  };

  // 如果未显式设置 inherit，则当对象级值未定义时默认继承
  function shouldInherit(flag: boolean | undefined | null, value: unknown) {
    if (flag === undefined || flag === null) {
      return value === undefined;
    }
    return flag;
  }

  // 取第一个非 undefined 的值
  function firstDefined<T>(...vals: Array<T | undefined>): T | undefined {
    for (const v of vals) {
      if (v !== undefined) return v;
    }
    return undefined;
  }

  const updateIconComponent = () => {
    // 继承判断：未显式提供开关时，默认“无对象级值则继承”
    const inheritScale = shouldInherit(
      itemRef.value?.inheritIconScale,
      itemRef.value?.iconScale
    );
    const inheritBottom = shouldInherit(
      itemRef.value?.inheritIconBottom,
      itemRef.value?.iconBottom
    );

    // 缩放优先级：对象(非继承) > 图标默认 > 视图级(在组件内兜底) > 1
    let objectScale: number | undefined;
    if (!inheritScale) {
      objectScale = itemRef.value?.iconScale;
    }
    const finalScale = firstDefined(objectScale, icon.value?.iconScale);

    // bottom 优先级：对象(非继承) > 图标默认 > 视图级 > 0
    let objectBottom: number | undefined;
    if (!inheritBottom) {
      objectBottom = itemRef.value?.iconBottom;
    }
    const finalBottom = firstDefined(objectBottom, icon.value?.iconBottom);

    const props: Record<string, unknown> = {};
    if (finalScale !== undefined) props.iconScale = finalScale;
    if (finalBottom !== undefined) props.iconBottom = finalBottom;

    if (!icon.value.isIsometric) {
      hasLoaded.value = true;
      iconComponent.value = h(NonIsometricIcon, {
        icon: icon.value,
        ...props
      });
      return;
    }

    iconComponent.value = h(IsometricIcon, {
      url: icon.value.url,
      ...props,
      onImageLoaded: () => {
        hasLoaded.value = true;
      }
    });
  };

  const resetLoadState = () => {
    hasLoaded.value = false;
  };

  // 监听 itemRef.value.icon 变化更新图标
  watch(
    [
      () => itemRef.value?.icon,
      () => itemRef.value?.iconScale,
      () => itemRef.value?.iconBottom,
      () => itemRef.value?.inheritIconScale,
      () => itemRef.value?.inheritIconBottom,
      () => icon.value?.iconScale,
      () => icon.value?.iconBottom
    ],
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
