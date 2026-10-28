import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { blankToNull, optionalUrl, slugify, translatedField } from './translatedSchema';

describe('translatedField', () => {
	const schema = z.object(translatedField('title', 'Title', 10));

	it('requires English and defaults the others to empty', () => {
		expect(schema.parse({ titleEn: ' Hello ' })).toEqual({
			titleEn: 'Hello',
			titleAm: '',
			titleZh: '',
			titleAr: ''
		});
		expect(schema.safeParse({ titleEn: '  ' }).error?.issues[0].message).toBe(
			'Write the title in English'
		);
	});

	it('limits every language', () => {
		expect(schema.safeParse({ titleEn: 'ok', titleAr: 'x'.repeat(11) }).success).toBe(false);
	});

	it('lets an optional field be empty in English', () => {
		expect(
			z.object(translatedField('note', 'Note', 10, { optional: true })).safeParse({ noteEn: '' })
				.success
		).toBe(true);
	});
});

describe('blankToNull', () => {
	it('stores empty translations as NULL but leaves English and other fields', () => {
		expect(blankToNull({ titleEn: '', titleAm: '', titleZh: 'x', email: '' })).toEqual({
			titleEn: '',
			titleAm: null,
			titleZh: 'x',
			email: ''
		});
	});
});

describe('slugify', () => {
	it('makes a URL-safe slug', () => {
		expect(slugify('New Customs Rules 2026!')).toBe('new-customs-rules-2026');
		expect(slugify('  Café — Déclaration  ')).toBe('cafe-declaration');
		expect(slugify('ዜና')).toBe('');
	});
});

describe('optionalUrl', () => {
	it('adds the https:// people leave off', () => {
		expect(optionalUrl.parse('linkedin.com/company/ethiolink')).toBe(
			'https://linkedin.com/company/ethiolink'
		);
		expect(optionalUrl.parse('')).toBe('');
		expect(optionalUrl.safeParse('not a url').success).toBe(false);
	});
});
