import { describe, expect, it } from 'vitest';
import { parseMessageData } from './parseMessageData.js';

describe('parseMessageData', () => {
	it('parses a JSON object frame', () => {
		expect(parseMessageData<{ id: number }>('{"id":1}')).toEqual({ id: 1 });
	});

	it('parses JSON scalars, including ones that are falsy', () => {
		// `0`, `false` and `null` are valid JSON documents. An implementation that treated a falsy
		// parse result as failure would hand back the string '0' instead of the number.
		expect(parseMessageData<number>('0')).toBe(0);
		expect(parseMessageData<boolean>('false')).toBe(false);
		expect(parseMessageData<null>('null')).toBeNull();
	});

	it('returns a non-JSON string unchanged rather than throwing', () => {
		// A plain text frame is a legitimate payload, not an error.
		expect(parseMessageData<string>('hello')).toBe('hello');
		expect(parseMessageData<string>('')).toBe('');
		expect(parseMessageData<string>('{not json')).toBe('{not json');
	});

	it('passes binary frames through untouched', () => {
		const buffer = new ArrayBuffer(8);
		expect(parseMessageData<ArrayBuffer>(buffer)).toBe(buffer);
	});

	it('does not coerce a numeric-looking string that is not valid JSON', () => {
		// '1.2.0' starts like a number but is not JSON, so it stays a string.
		expect(parseMessageData<string>('1.2.0')).toBe('1.2.0');
	});
});
