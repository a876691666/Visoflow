import { updateState } from 'src/utils/reactivity';
import { TextBox } from 'src/types';
import { getItemByIdOrThrow, getTextBoxDimensions } from 'src/utils';
import { State, ViewReducerContext } from './types';
import { useSceneStore } from '../provider';

export const syncTextBox = (
  id: string,
  sceneStore: ReturnType<typeof useSceneStore>
) => {
  const view = sceneStore.getCurrentView();
  if (!view) return;
  const textBox = getItemByIdOrThrow(view.textBoxes ?? [], id);

  const textBoxSize = getTextBoxDimensions(textBox.value);

  sceneStore.updateTextBox(id, { ...textBox.value, size: textBoxSize });
};

export const updateTextBox = (
  { id, ...updates }: { id: string } & Partial<TextBox>,
  { viewId, state }: ViewReducerContext
): State => {
  const view = getItemByIdOrThrow(state.model.views, viewId);

  const newState = updateState(state, (draft) => {
    const { textBoxes } = draft.model.views[view.index];

    if (!textBoxes) return;

    const textBox = getItemByIdOrThrow(textBoxes, id);
    const newTextBox = { ...textBox.value, ...updates };
    textBoxes[textBox.index] = newTextBox;

    if (updates.content !== undefined || updates.fontSize !== undefined) {
      const stateAfterSync = syncTextBox(newTextBox.id, {
        viewId,
        state: draft
      });

      draft.model = stateAfterSync.model;
      draft.scene = stateAfterSync.scene;
    }
  });

  return newState;
};

export const createTextBox = (
  newTextBox: TextBox,
  { viewId, state }: ViewReducerContext
): State => {
  const view = getItemByIdOrThrow(state.model.views, viewId);

  const newState = updateState(state, (draft) => {
    const { textBoxes } = draft.model.views[view.index];

    if (!textBoxes) {
      draft.model.views[view.index].textBoxes = [newTextBox];
    } else {
      draft.model.views[view.index].textBoxes?.unshift(newTextBox);
    }
  });

  return updateTextBox(newTextBox, { viewId, state: newState });
};

export const deleteTextBox = (
  id: string,
  { viewId, state }: ViewReducerContext
): State => {
  const view = getItemByIdOrThrow(state.model.views, viewId);
  const textBox = getItemByIdOrThrow(view.value.textBoxes ?? [], id);

  const newState = updateState(state, (draft) => {
    draft.model.views[view.index].textBoxes?.splice(textBox.index, 1);
  });

  return newState;
};
