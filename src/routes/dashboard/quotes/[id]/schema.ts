import { z } from 'zod';
import { QUOTE_STATUSES } from '$lib/quoteStatus';

export const CURRENCIES = ['ETB', 'USD', 'EUR', 'CNY', 'AED'] as const;

/** What staff record about a quote: where it stands, the price offered, and notes for colleagues. */
export const quoteUpdateSchema = z.object({
	status: z.enum(QUOTE_STATUSES),
	amount: z.coerce.number().min(0, 'Zero or more').max(999_999_999_999).optional(),
	currency: z.enum(CURRENCIES).default('ETB'),
	notes: z.string().trim().max(5000).default('')
});
