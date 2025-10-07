import { updateState } from 'src/utils/reactivity';
import { ModeActions } from 'src/types';
import { generateId, getItemAtTile } from 'src/utils';
import { VIEW_ITEM_DEFAULTS } from 'src/config';

export const PlaceIcon: ModeActions = {
  mousemove: () => {},
  mousedown: ({ uiState, scene, isRendererInteraction }) => {
    if (uiState.mode.type !== 'PLACE_ICON' || !isRendererInteraction) return;

    if (!uiState.mode.id) {
      const itemAtTile = getItemAtTile({
        tile: uiState.mouse.position.tile,
        scene
      });

      uiState.setMode({
        type: 'CURSOR',
        mousedownItem: itemAtTile,
        showCursor: true
      });

      uiState.setItemControls(null);
    }
  },
  mouseup: ({ uiState, scene }) => {
    if (uiState.mode.type !== 'PLACE_ICON') return;

    if (uiState.mode.id !== null) {
      const modelItemId = generateId();

      scene.addItem({
        ...VIEW_ITEM_DEFAULTS,
        name: 'Untitled',
        id: modelItemId,
        tile: uiState.mouse.position.tile,
        icon: uiState.mode.id
      });
    }

    uiState.setMode(
      updateState(uiState.mode, (draft) => {
        draft.id = null;
      })
    );
  }
};
