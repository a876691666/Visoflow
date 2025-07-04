import { App } from 'vue'
import { createPinia } from 'pinia'
import Isoflow from './Isoflow.vue'
import { useIsoflow } from './composables/useIsoflow'

// Install function for Vue.use()
const install = (app: App) => {
  app.use(createPinia())
  app.component('Isoflow', Isoflow)
}

// Export component and plugin
export { Isoflow, useIsoflow, install }
export * from './standaloneExports'

// Default export for Vue.use()
export default {
  install
}