import { z } from 'zod';
import { WILAYAS } from '@/data/products';

/* ── Step 1: Shipping ─────────────────────────────────────────────────────── */
// Messages are translation keys, resolved via `t()` at the display site.
export const shippingSchema = z.object({
  email: z.string().min(1, 'val.emailRequired').email('val.emailValid'),
  firstName: z.string().min(1, 'val.firstNameRequired'),
  lastName: z.string().min(1, 'val.lastNameRequired'),
  phone: z
    .string()
    .min(1, 'val.phoneRequired')
    .regex(/[0-9]/, 'val.phoneValid'),
  address: z.string().min(1, 'val.addressRequired'),
  city: z.string().min(1, 'val.cityRequired'),
  wilaya: z
    .string()
    .min(1, 'val.wilayaSelectShort')
    .refine((v) => WILAYAS.includes(v), 'val.wilayaValid'),
  shippingType: z.enum(['home', 'desk'], {
    required_error: 'val.deliveryTypeSelect',
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
