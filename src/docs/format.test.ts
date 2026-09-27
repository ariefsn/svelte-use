import { describe, expect, it } from 'vitest';
import { formatInline, stripInline } from './format.js';

describe('formatInline', () => {
	it('converts code spans', () => {
		expect(formatInline('call `resume()` first')).toBe(
			'call <code class="inline-code">resume()</code> first'
		);
	});

	it('converts bold and italic', () => {
		expect(formatInline('does **not** start')).toBe('does <strong>not</strong> start');
		expect(formatInline('a *word* here')).toBe('a <em>word</em> here');
		expect(formatInline('a _word_ here')).toBe('a <em>word</em> here');
	});

	it('escapes HTML in the source so markup cannot be injected', () => {
		expect(formatInline('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
	});

	it('escapes angle brackets inside code spans', () => {
		expect(formatInline('`Array<T>`')).toBe('<code class="inline-code">Array&lt;T&gt;</code>');
	});

	it('leaves emphasis markers inside code spans alone', () => {
		expect(formatInline('`a**b`')).toBe('<code class="inline-code">a**b</code>');
	});

	it('does not treat multiplication or snake_case as emphasis', () => {
		expect(formatInline('use_snake_case_name')).toBe('use_snake_case_name');
	});

	it('returns an empty string for empty input', () => {
		expect(formatInline('')).toBe('');
	});
});

describe('stripInline', () => {
	it('removes markers without emitting tags', () => {
		expect(stripInline('Unlike `useInterval`, this does **not** start.')).toBe(
			'Unlike useInterval, this does not start.'
		);
	});

	it('leaves plain prose untouched', () => {
		const prose = 'Reactively tracks the document visibility state.';
		expect(stripInline(prose)).toBe(prose);
	});

	it('does not escape HTML, since output is used as an attribute value', () => {
		expect(stripInline('a < b')).toBe('a < b');
	});

	it('returns an empty string for empty input', () => {
		expect(stripInline('')).toBe('');
	});
});
