import { z } from 'zod';
import { id, coords, constrainedStrings } from './common';

export const rectangleSchema = z.object({
  id,
  from: coords,
  to: coords,
  key: constrainedStrings.key.optional(),
  color: z.string().optional(),
  style: z.record(z.string(), z.any()).optional()
});
