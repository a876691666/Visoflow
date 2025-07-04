import { App } from 'vue'
import Isoflow from './Isoflow.vue'
import { useModelStore } from './stores/modelStore'
import { useSceneStore } from './stores/sceneStore'
import { useUiStateStore } from './stores/uiStateStore'

// 导出主要组件
export { default as Isoflow } from './Isoflow.vue'

// 导出 stores
export {
  useModelStore,
  useSceneStore,
  useUiStateStore
}

// 导出类型
export * from './types'
export * from './standaloneExports'

// Vue 插件安装函数
export function install(app: App) {
  app.component('Isoflow', Isoflow)
}

// 默认导出
export default {
  install,
  Isoflow
}

// 在非模块环境中的全局安装
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
} 