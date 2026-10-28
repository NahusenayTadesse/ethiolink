import { describe, expect, it } from 'vitest';
import { missingLanguages, paragraphs, pick } from './translated';
import { quoteNumber } from './quoteStatus';

describe('pick', () => {
	const row = { titleEn: 'Customs update', titleAm: 'የጉምሩክ ዜና', titleZh: null, titleAr: '   ' };

	it('shows the translation when there is one', () => {
		expect(pick(row, 'title', 'am')).toBe('የጉምሩክ ዜና');
	});

	it('falls back to English for a missing or blank translation', () => {
		expect(pick(row, 'title', 'zh')).toBe('Customs update');
		expect(pick(row, 'title', 'ar')).toBe('Customs update');
		expect(pick(row, 'title', 'en')).toBe('Customs update');
	});
});

describe('missingLanguages', () => {
	it('lists the languages with an empty field', () => {
		const row = {
			nameEn: 'Abebe',
			nameAm: 'አበበ',
			nameZh: '',
			nameAr: null,
			roleEn: 'CEO',
			roleAm: ''
		};
		expect(missingLanguages(row, ['name', 'role'])).toEqual(['Amharic', 'Chinese', 'Arabic']);
	});

	it('needs no translation of a field left empty in English', () => {
		expect(missingLanguages({ subtitleEn: '', subtitleAm: null }, ['subtitle'])).toEqual([]);
	});
});

describe('paragraphs', () => {
	it('splits on blank lines and drops empty ones', () => {
		expect(paragraphs('One\nstill one\n\n  \n\nTwo  ')).toEqual(['One\nstill one', 'Two']);
		expect(paragraphs(null)).toEqual([]);
	});
});

describe('quoteNumber', () => {
	it('pads the id to six digits', () => {
		expect(quoteNumber(42)).toBe('Q-000042');
		expect(quoteNumber(1234567)).toBe('Q-1234567');
	});
});
