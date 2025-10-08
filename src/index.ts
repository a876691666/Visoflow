import { App } from 'vue';
import Visoflow from './Visoflow.vue';
import { useUiStateStore } from './stores/uiStateStore';

// 导出主要组件
export { default as Visoflow } from './Visoflow.vue';

// 导出 stores
export { useUiStateStore };

// 导出类型
export * from './types';
export * from './standaloneExports';

// Vue 插件安装函数
export function install(app: App) {
  app.component('Visoflow', Visoflow);
}

// 默认导出
export default {
  install
};
