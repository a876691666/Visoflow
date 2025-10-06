import { getItemByIdOrThrow, getConnectorPath, getAllAnchors } from 'src/utils';
import { validateConnector } from 'src/schemas/validation';
import { useSceneStore } from '../provider';

export const deleteConnector = (
  id: string,
  sceneStore: ReturnType<typeof useSceneStore>
) => {
  const view = sceneStore.getCurrentView();
  if (!view) return;
  const connector = getItemByIdOrThrow(view.connectors ?? [], id);

  if (connector) sceneStore.removeConnector(id);
  view.connectors = view.connectors?.filter((c) => c.id !== id);
};

export const syncConnector = (
  id: string,
  sceneStore: ReturnType<typeof useSceneStore>
) => {
  const view = sceneStore.getCurrentView();
  if (!view) return;

  const connector = getItemByIdOrThrow(view.connectors ?? [], id);
  const allAnchors = getAllAnchors(view.connectors ?? []);

  const issues = validateConnector(connector.value, {
    view: view,
    model: sceneStore.model.value,
    allAnchors
  });

  if (issues.length > 0) {
    deleteConnector(id, sceneStore);
  } else {
    const path = getConnectorPath({
      anchors: connector.value.anchors,
      view: view
    });

    return sceneStore.updateConnector(id, { ...connector.value, path });
  }
};
