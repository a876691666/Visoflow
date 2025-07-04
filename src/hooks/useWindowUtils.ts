import { onMounted } from 'vue'
import { useDiagramUtils } from 'src/hooks/useDiagramUtils'

export const useWindowUtils = () => {
  const { fitToView, getUnprojectedBounds } = useDiagramUtils()

  onMounted(() => {
    // @ts-ignore - 添加全局方法到window对象
    window.Isoflow = {
      getUnprojectedBounds,
      fitToView
    }
  })
}