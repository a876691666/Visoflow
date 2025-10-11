import { ref, watch } from 'vue';
import { useIsoflowUiStateStore } from 'src/context/isoflowContext';
import type { Size, Coords } from '@/types';
import { CoordsUtils, getFitToViewParams } from '@/utils';
import { useResizeObserver } from 'src/hooks/useResizeObserver';
import { useSceneStore } from 'src/stores/provider';

export const useDiagramUtils = () => {
  const uiStateStore = useIsoflowUiStateStore<any>();
  const rendererEl = ref<HTMLElement | null>(null);
  const sceneStore = useSceneStore();
  const { size: rendererSize } = useResizeObserver(rendererEl);

  // 更新渲染器元素引用
  watch(
    () => uiStateStore.rendererEl,
    (newEl) => {
      rendererEl.value = newEl;
    },
    { immediate: true }
  );

  const getUnprojectedBounds = (): Size & Coords => {
    // 这里需要当前视图数据，暂时返回默认值
    return { x: 0, y: 0, width: 0, height: 0 };
  };

  const fitToView = async () => {
    const view = sceneStore.getCurrentView();
    if (!view || !rendererSize.value.width || !rendererSize.value.height) {
      return;
    }
    const { zoom, scroll } = getFitToViewParams(view, rendererSize.value);

    uiStateStore.setScroll({
      position: scroll,
      offset: CoordsUtils.zero()
    });
    uiStateStore.setZoom(zoom);
  };

  return {
    getUnprojectedBounds,
    fitToView,
    getFitToViewParams
  };
};
