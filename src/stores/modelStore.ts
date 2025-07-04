import { defineStore } from 'pinia';
import { INITIAL_DATA } from 'src/config';
import type { Model } from 'src/types';

export const useModelStore = defineStore('model', {
  state: (): Model => ({
    ...INITIAL_DATA
  }),

  actions: {
    updateModel(model: Partial<Model>) {
      Object.assign(this, model);
    },

    resetModel() {
      Object.assign(this, INITIAL_DATA);
    },

    loadData(data: Partial<Model>) {
      Object.assign(this, { ...INITIAL_DATA, ...data });
    }
  }
});
