import { defineStore } from 'pinia'
import { Scene } from 'src/types'

export const useSceneStore = defineStore('scene', {
  state: (): Scene => ({
    connectors: {},
    textBoxes: {},
  }),

  actions: {
    // 提供通用的get和set方法，兼容原有API
    get() {
      return this.$state
    },
    set(updater: any) {
      if (typeof updater === 'function') {
        Object.assign(this, updater(this.$state))
      } else {
        Object.assign(this, updater)
      }
    }
  }
})