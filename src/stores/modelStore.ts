import { defineStore } from 'pinia'
import { Model } from 'src/types'
import { INITIAL_DATA } from 'src/config'

export const useModelStore = defineStore('model', {
  state: (): Model => ({
    ...INITIAL_DATA,
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