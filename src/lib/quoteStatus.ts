/**
 * Where a quote request stands, from arrival to a won or lost deal. Kept outside the server folder
 * so table cells and the public form can use the lists too.
 */
export const QUOTE_STATUSES = ['new', 'review', 'quoted', 'won', 'lost'] as const;

export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export const QUOTE_LABELS: Record<QuoteStatus, string> = {
	new: 'New',
	review: 'Reviewing',
	quoted: 'Quoted',
	won: 'Won',
	lost: 'Lost'
};

/** How the cargo travels. `any` lets the visitor leave the choice to EthioLink. */
export const TRANSPORT_MODES = ['sea', 'air', 'land', 'any'] as const;

export type TransportMode = (typeof TRANSPORT_MODES)[number];

export const MODE_LABELS: Record<TransportMode, string> = {
	sea: 'Sea',
	air: 'Air',
	land: 'Land',
	any: 'Advise me'
};

/** The Incoterms 2020 rules, plus "not sure", which most first-time importers pick. */
export const INCOTERMS = ['EXW', 'FCA', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP'] as const;

/** How quote numbers read to staff and to the customer: Q-000042. */
export const quoteNumber = (id: number) => `Q-${String(id).padStart(6, '0')}`;
