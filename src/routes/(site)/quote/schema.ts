import { z } from 'zod';
import { m } from '$lib/paraglide/messages.js';
import { SERVICE_SLUGS } from '$lib/site/services';
import { INCOTERMS, TRANSPORT_MODES } from '$lib/quoteStatus';
import { contactSchema } from '../contact/schema';

/** The documents a visitor may attach: invoices and packing lists, as PDFs or photos. */
export const DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const MAX_BYTES = 10 * 1024 * 1024;

const place = (error: () => string) => z.string().trim().min(2, { error }).max(160);
const amount = z
	.number({ error: () => m.quote_err_number() })
	.positive({ error: () => m.quote_err_number() })
	.max(1_000_000_000)
	.optional();

/**
 * The public quote form. The contact details are checked exactly as on the contact form; messages
 * are functions so they read in the visitor's language, in the browser and on the server.
 */
export const quoteSchema = z.object({
	name: contactSchema.shape.name,
	company: contactSchema.shape.company,
	email: contactSchema.shape.email,
	phone: contactSchema.shape.phone,
	service: z.enum(['general', ...SERVICE_SLUGS]).default('general'),
	mode: z.enum(TRANSPORT_MODES).default('any'),
	origin: place(() => m.quote_err_origin()),
	destination: place(() => m.quote_err_destination()),
	cargo: z
		.string()
		.trim()
		.min(5, { error: () => m.quote_err_cargo() })
		.max(5000),
	weightKg: amount,
	volumeCbm: amount,
	incoterm: z.enum(['', ...INCOTERMS]).default(''),
	readyDate: z.iso.date().or(z.literal('')).default(''),
	documents: z
		.array(
			z
				.file()
				.mime(DOCUMENT_TYPES, { error: () => m.quote_err_files() })
				.max(MAX_BYTES, { error: () => m.quote_err_files() })
		)
		.max(5, { error: () => m.quote_err_files() })
		.default([]),
	website: contactSchema.shape.website
});

export type QuoteSchema = typeof quoteSchema;
