import { z } from 'zod';

export const ratingSchema = z.object({
  name: z.string().min(1, 'Your name is required').min(2, 'Name must be at least 2 characters'),
  wilaya: z.string().min(1, 'Select your wilaya'),
  rating: z.number().min(1, 'Please pick a star rating').max(5),
  comment: z
    .string()
    .min(1, 'A short comment is required')
    .min(10, 'Comment must be at least 10 characters'),
});

export type RatingForm = z.infer<typeof ratingSchema>;
