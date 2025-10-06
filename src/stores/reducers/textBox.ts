import { getItemByIdOrThrow, getTextBoxDimensions } from 'src/utils';
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
