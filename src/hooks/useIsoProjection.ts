import { ref, type CSSProperties, type Ref } from 'vue';
import type { Coords, Size, ProjectionOrientationEnum } from '@/types';
import {
  getBoundingBox,
  getIsoProjectionCss,
  getIsoProjectionOrigin,
  getTilePosition
} from '@/utils';
import { UNPROJECTED_TILE_SIZE } from '@/config';

interface Props {
  from: Coords;
  to: Coords;
  originOverride?: Coords;
  orientation?: keyof typeof ProjectionOrientationEnum;
}

interface UseIsoProjectionReturn {
  css: Ref<CSSProperties>;
  update: (props: Props) => void;
  position: Ref<Coords>;
  gridSize: Ref<Size>;
  pxSize: Ref<Size>;
}

export const useIsoProjection = (): UseIsoProjectionReturn => {
  const css = ref<CSSProperties>({});
  const position = ref<Coords>({ x: 0, y: 0 });
  const gridSize = ref<Size>({ width: 0, height: 0 });
  const pxSize = ref<Size>({ width: 0, height: 0 });

  const update = ({ from, to, originOverride, orientation }: Props) => {
    // 计算网格尺寸
    const newGridSize = {
      width: Math.abs(from.x - to.x) + 1,
      height: Math.abs(from.y - to.y) + 1
    };
    gridSize.value = newGridSize;

    // 计算原点
    const origin = originOverride || getBoundingBox([from, to])[3];

    // 计算位置
    const pos = getTilePosition({
      tile: origin,
      origin: orientation === 'Y' ? 'TOP' : 'LEFT'
    });
    position.value = pos;

    // 计算像素尺寸
    const newPxSize = {
      width: newGridSize.width * UNPROJECTED_TILE_SIZE,
      height: newGridSize.height * UNPROJECTED_TILE_SIZE
    };
    pxSize.value = newPxSize;

    // 计算CSS样式
    css.value = {
      position: 'absolute',
      left: `${pos.x}px`,
      top: `${pos.y}px`,
      width: `${newPxSize.width}px`,
      height: `${newPxSize.height}px`,
      transform: getIsoProjectionCss(orientation),
      transformOrigin: getIsoProjectionOrigin(orientation)
    };
  };

  return {
    css,
    update,
    position,
    gridSize,
    pxSize
  };
};
