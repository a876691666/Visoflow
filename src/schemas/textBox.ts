import { z } from 'zod';
import { ProjectionOrientationEnum } from 'src/types/common';
import { id, coords, constrainedStrings } from './common';

export const textBoxSchema = z.object({
  id,
  tile: coords,
  content: constrainedStrings.name,
  key: constrainedStrings.key.optional(),
  fontSize: z.number().optional(),
  textStyle: z.record(z.any()).optional(),
  containerStyle: z.record(z.any()).optional(),
  contentStyle: z.record(z.any()).optional(),
  orientation: z
    .union([
      z.literal(ProjectionOrientationEnum.X),
      z.literal(ProjectionOrientationEnum.Y),
      z.literal(ProjectionOrientationEnum.DX),
      z.literal(ProjectionOrientationEnum.DY)
    ])
    .optional()
});
