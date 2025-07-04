import { computed, Ref } from 'vue'
import { Coords, Size, ProjectionOrientationEnum } from 'src/types'
import {
  getBoundingBox,
  getIsoProjectionCss,
  getTilePosition
} from 'src/utils'
import { UNPROJECTED_TILE_SIZE } from 'src/config'

interface Props {
  from: Coords | Ref<Coords>
  to: Coords | Ref<Coords>
  originOverride?: Coords | Ref<Coords>
  orientation?: keyof typeof ProjectionOrientationEnum
}

export const useIsoProjection = ({
  from,
  to,
  originOverride,
  orientation
}: Props) => {
  const gridSize = computed(() => {
    const fromValue = typeof from === 'object' && 'value' in from ? from.value : from
    const toValue = typeof to === 'object' && 'value' in to ? to.value : to
    
    return {
      width: Math.abs(fromValue.x - toValue.x) + 1,
      height: Math.abs(fromValue.y - toValue.y) + 1
    }
  })

  const origin = computed(() => {
    const fromValue = typeof from === 'object' && 'value' in from ? from.value : from
    const toValue = typeof to === 'object' && 'value' in to ? to.value : to
    const originOverrideValue = originOverride 
      ? (typeof originOverride === 'object' && 'value' in originOverride ? originOverride.value : originOverride)
      : null

    if (originOverrideValue) return originOverrideValue

    const boundingBox = getBoundingBox([fromValue, toValue])
    return boundingBox[3]
  })

  const position = computed(() => {
    const pos = getTilePosition({
      tile: origin.value,
      origin: orientation === 'Y' ? 'TOP' : 'LEFT'
    })

    return pos
  })

  const pxSize = computed(() => {
    return {
      width: gridSize.value.width * UNPROJECTED_TILE_SIZE,
      height: gridSize.value.height * UNPROJECTED_TILE_SIZE
    }
  })

  const css = computed(() => ({
    position: 'absolute' as const,
    left: `${position.value.x}px`,
    top: `${position.value.y}px`,
    width: `${pxSize.value.width}px`,
    height: `${pxSize.value.height}px`,
    transform: getIsoProjectionCss(orientation),
    transformOrigin: 'top left'
  }))

  return {
    css,
    position,
    gridSize,
    pxSize
  }
}