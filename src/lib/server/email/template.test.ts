import { describe, expect, it } from 'vitest';
import { htmlToPlain, layout, panel, richEmailHtml } from './template';

describe('richEmailHtml', () => {
	const origin = 'https://ethiolink.net';

	it('drops scripts, handlers and unsafe links', () => {
		const html = richEmailHtml(
			'<p onclick="x()">Hi<script>alert(1)</script></p><a href="javascript:alert(1)">bad</a>',
			'en',
			origin
		);
		expect(html).not.toMatch(/script|onclick|javascript:/);
		expect(html).toContain('Hi');
	});

	it('puts the brand styles inline', () => {
		const html = richEmailHtml(
			'<h2>Rates</h2><ul><li>Sea</li></ul><blockquote>Note</blockquote>',
			'en',
			origin
		);
		expect(html).toMatch(/<h2 style="[^"]*font-size:24px/);
		expect(html).toMatch(/<ul style="[^"]*padding:0 0 0 22px/);
		expect(html).toMatch(/<blockquote style="[^"]*border-left:4px/);
	});

	it('keeps list items and quotes tight', () => {
		const html = richEmailHtml(
			'<ul><li><p>One</p></li><li><p>Two</p></li></ul><blockquote><p>A</p><p>B</p></blockquote>',
			'en',
			origin
		);
		expect(html).not.toMatch(/<li[^>]*><p|<blockquote[^>]*><p/);
		expect(html).toMatch(/<blockquote[^>]*>A<br><br>B<\/blockquote>/);
	});

	it('leaves nested lists whole', () => {
		const html = richEmailHtml(
			'<ul><li><p>A</p><ul><li><p>B</p></li></ul></li></ul>',
			'en',
			origin
		);
		expect(html.replace(/ style="[^"]*"/g, '')).toBe('<ul><li>A<ul><li>B</li></ul></li></ul>');
	});

	it('mirrors lists and quotes for Arabic', () => {
		const html = richEmailHtml('<ul><li>x</li></ul><blockquote>y</blockquote>', 'ar', origin);
		expect(html).toContain('padding:0 22px 0 0');
		expect(html).toContain('border-right:4px');
	});

	it('makes site links absolute and keeps only https images', () => {
		const html = richEmailHtml(
			'<p><a href="/quote">Quote</a><img src="http://x.test/a.png"><img src="https://x.test/b.png"></p>',
			'en',
			origin
		);
		expect(html).toContain('href="https://ethiolink.net/quote"');
		expect(html).not.toContain('http://x.test/a.png');
		expect(html).toContain('https://x.test/b.png');
	});
});

describe('layout', () => {
	it('sets the language and reading direction, and escapes the subject', () => {
		const html = layout({ locale: 'ar', subject: '<b>Hi</b>', body: '<p>x</p>' });
		expect(html).toContain('<html lang="ar" dir="rtl">');
		expect(html).toContain('&lt;b&gt;Hi&lt;/b&gt;');
		expect(html).toContain('src="cid:logo@ethiolink"');
	});

	it('escapes what a visitor wrote', () => {
		expect(panel('en', 'Your message', [['Service', '<img src=x>']], '<script>')).not.toMatch(
			/<img|<script/
		);
	});
});

describe('htmlToPlain', () => {
	it('keeps paragraphs, bullets and link targets', () => {
		const text = htmlToPlain(
			'<p>Dear Sara,</p><ul><li>One</li><li>Two</li></ul><p>See <a href="https://ethiolink.net/quote">our form</a> &amp; reply.</p>'
		);
		expect(text).toBe(
			'Dear Sara,\n\n• One\n• Two\n\nSee our form (https://ethiolink.net/quote) & reply.'
		);
	});
});
