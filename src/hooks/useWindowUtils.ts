import { onMounted } from 'vue';
import { useDiagramUtils } from 'src/hooks/useDiagramUtils';

export const useWindowUtils = () => {
  const { fitToView, getUnprojectedBounds } = useDiagramUtils();

  onMounted(() => {
    // 将工具函数暴露到全局window对象
    (window as any).Isoflow = {
      getUnprojectedBounds,
      fitToView
    };
  });
};
