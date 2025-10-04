import { updateState } from './reactivity';
import { Model } from 'src/types';
import { validateModel } from 'src/schemas/validation';
import { getItemByIdOrThrow } from './common';

export const fixModel = (model: Model): Model => {
  const issues = validateModel(model);

  return issues.reduce((acc, issue) => {
    if (issue.type === 'INVALID_MODEL_TO_ICON_REF') {
      return updateState(acc, (draft) => {
        const { index: itemIndex } = getItemByIdOrThrow(
          draft.items,
          issue.params.modelItem
        );

        draft.items[itemIndex].icon = undefined;
      });
    }

    if (issue.type === 'CONNECTOR_TOO_FEW_ANCHORS') {
      return updateState(acc, (draft) => {
        const view = getItemByIdOrThrow(draft.views, issue.params.view);

        const connector = getItemByIdOrThrow(
          view.value.connectors ?? [],
          issue.params.connector
        );

        draft.views[view.index].connectors?.splice(connector.index, 1);
      });
    }

    if (issue.type === 'INVALID_ANCHOR_TO_ANCHOR_REF') {
      return updateState(acc, (draft) => {
        const view = getItemByIdOrThrow(draft.views, issue.params.view);

        const connector = getItemByIdOrThrow(
          view.value.connectors ?? [],
          issue.params.connector
        );

        const anchor = getItemByIdOrThrow(
          connector.value.anchors,
          issue.params.srcAnchor
        );

        connector.value.anchors.splice(anchor.index, 1);
      });
    }

    return acc;
  }, model);
};

// Accept any object with model-like fields (e.g., a Pinia store instance)
export const modelFromModelStore = (modelStore: any): Model => {
  return {
    version: modelStore.version,
    title: modelStore.title,
    description: modelStore.description,
    colors: modelStore.colors,
    icons: modelStore.icons,
    items: modelStore.items,
    views: modelStore.views
  };
};
