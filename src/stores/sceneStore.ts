import { defineStore } from 'pinia';
import type { Scene } from 'src/types';

export const useSceneStore = defineStore('scene', {
  state: (): Scene => ({
    connectors: {},
    textBoxes: {}
  }),

  actions: {
    updateConnectors(connectors: Scene['connectors']) {
      this.connectors = connectors;
    },

    updateTextBoxes(textBoxes: Scene['textBoxes']) {
      this.textBoxes = textBoxes;
    },

    addConnector(id: string, connector: Scene['connectors'][string]) {
      this.connectors[id] = connector;
    },

    removeConnector(id: string) {
      delete this.connectors[id];
    },

    addTextBox(id: string, textBox: Scene['textBoxes'][string]) {
      this.textBoxes[id] = textBox;
    },

    removeTextBox(id: string) {
      delete this.textBoxes[id];
    }
  }
});
