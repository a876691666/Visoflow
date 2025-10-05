import { ModeActions } from 'src/types';
import { updateState } from 'src/utils/reactivity';
import { generateId, hasMovedTile, setWindowCursor } from 'src/utils';

export const DrawRectangle: ModeActions = {
  entry: () => {
    setWindowCursor('crosshair');
  },
  exit: () => {
    setWindowCursor('default');
  },
  mousemove: ({ uiState, scene }) => {
    if (
      uiState.mode.type !== 'RECTANGLE.DRAW' ||
      !hasMovedTile(uiState.mouse) ||
      !uiState.mode.id ||
      !uiState.mouse.mousedown
    )
      return;

    scene.updateRectangle(uiState.mode.id, {
      to: uiState.mouse.position.tile
    });
  },
  mousedown: ({ uiState, scene, isRendererInteraction }) => {
    if (uiState.mode.type !== 'RECTANGLE.DRAW' || !isRendererInteraction)
      return;

    const newRectangleId = generateId();

    scene.createRectangle({
      id: newRectangleId,
      from: uiState.mouse.position.tile,
      to: uiState.mouse.position.tile
    });

    const newMode = updateState(uiState.mode, (draft) => {
      draft.id = newRectangleId;
    });

    uiState.setMode(newMode);
  },
  mouseup: ({ uiState }) => {
    if (uiState.mode.type !== 'RECTANGLE.DRAW' || !uiState.mode.id) return;

    uiState.setMode({
      type: 'CURSOR',
      showCursor: true,
      mousedownItem: null
    });
  }
};
