import { App } from 'vue'
import { createPinia } from 'pinia'
import Isoflow from './Isoflow.vue'
import { useModelStore } from './stores/modelStore'
import { useUiStateStore } from './stores/uiStateStore'
import { useSceneStore } from './stores/sceneStore'

// 导出主组件
export { default as Isoflow } from './Isoflow.vue'

// 导出stores
export { useModelStore, useUiStateStore, useSceneStore }

// 导出类型
export * from './types'

// 导出工具函数
export * from './standaloneExports'

// 创建useIsoflow composable
export const useIsoflow = () => {
  const uiStateStore = useUiStateStore()
  const modelStore = useModelStore()

  return {
    Model: modelStore,
    uiState: uiStateStore,
    rendererEl: uiStateStore.rendererEl
  }
}

// Vue插件安装函数
export const install = (app: App) => {
  const pinia = createPinia()
  app.use(pinia)
  app.component('Isoflow', Isoflow)
}

// 默认导出支持Vue.use()
export default {
  install
}