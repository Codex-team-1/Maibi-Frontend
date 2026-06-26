import { z } from 'zod';
import { WILAYAS } from '@/data/products';

/* ── Step 1: Shipping ─────────────────────────────────────────────────────── */
export const shippingSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z
    .string()
    .min(1, 'Phone is required')
    .regex(/[0-9]/, 'Enter a valid phone number'),
  address: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  wilaya: z
    .string()
    .min(1, 'Select a wilaya')
    .refine((v) => WILAYAS.includes(v), 'Select a valid wilaya'),
  shippingType: z.enum(['home', 'desk'], {
    required_error: 'Select a delivery type',
  }),
  notes: z.string().optional(),
});

export type ShippingForm = z.infer<typeof shippingSchema>;

/* ── Step 2: Card payment (only validated for card methods) ───────────────── */
export const cardSchema = z.object({
  cardNumber: z
    .string()
    .min(1, 'Card number is required')
    .refine((v) => v.replace(/\s/g, '').length === 16, 'Enter a 16-digit card number'),
  cardName: z.string().min(1, 'Cardholder name is required'),
  expiry: z
    .string()
    .min(1, 'Expiry is required')
    .regex(/^\d{2}\s?\/\s?\d{2}$/, 'Use MM / YY'),
  cvv: z.string().regex(/^\d{3}$/, 'Enter the 3-digit CVV'),
});

export type CardForm = z.infer<typeof cardSchema>;
