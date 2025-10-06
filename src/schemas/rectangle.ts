import { z } from 'zod';
import { id, coords } from './common';

export const rectangleSchema = z.object({
  id,
  from: coords,
  to: coords,
  color: z.string().optional(),
  style: z.record(z.string(), z.any()).optional()
});
