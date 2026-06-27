import { z } from 'zod';

// Messages are translation keys, resolved via `t()` at the display site.
export const ratingSchema = z.object({
  name: z.string().min(1, 'val.nameRequired').min(2, 'val.nameMin'),
  wilaya: z.string().min(1, 'val.wilayaSelect'),
  rating: z.number().min(1, 'val.ratingPick').max(5),
  comment: z
    .string()
    .min(1, 'val.commentRequired')
    .min(10, 'val.commentMin'),
});

export type RatingForm = z.infer<typeof ratingSchema>;
