import { flushSync } from 'svelte';
import { describe, expect, test } from 'vitest';
import { useBase64 } from './useBase64.svelte.js';

/** Waits for all pending microtasks and the FileReader async callback. */
function waitForAsync(): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('useBase64', () => {
	test('returns undefined when input is undefined', () => {
		const cleanup = $effect.root(() => {
			const b64 = useBase64(() => undefined);
			flushSync();
			expect(b64()).toBeUndefined();
		});
		cleanup();
	});

	test('encodes a plain ASCII string', () => {
		const cleanup = $effect.root(() => {
			const b64 = useBase64(() => 'hello');
			flushSync();
			expect(b64()).toBe(btoa('hello'));
		});
		cleanup();
	});

	test('encodes a UTF-8 string correctly', () => {
		// "é" is multi-byte in UTF-8; btoa alone would throw without encoding
		const cleanup = $effect.root(() => {
			const input = 'héllo';
			const b64 = useBase64(() => input);
			flushSync();
			const encoded = b64()!;
			const decoded = new TextDecoder().decode(
				Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0))
			);
			expect(decoded).toBe(input);
		});
		cleanup();
	});

	test('encodes an ArrayBuffer', () => {
		const cleanup = $effect.root(() => {
			const buffer = new TextEncoder().encode('world').buffer as ArrayBuffer;
			const b64 = useBase64(() => buffer);
			flushSync();
			expect(b64()).toBe(btoa('world'));
		});
		cleanup();
	});

	test('encodes a Blob asynchronously', async () => {
		// Verify via native FileReader that blob content encodes correctly
		await new Promise<void>((resolve) => {
			const reader = new FileReader();
			reader.onload = () => {
				const expected = (reader.result as string).split(',')[1];
				expect(expected).toBe(btoa('svelte'));
				resolve();
			};
			reader.readAsDataURL(new Blob(['svelte'], { type: 'text/plain' }));
		});
	});

	test('resolves Blob value to correct base64', async () => {
		let getResult!: () => string | undefined;
		let resolved = false;

		const cleanup = $effect.root(() => {
			const blob = new Blob(['test-blob'], { type: 'text/plain' });
			getResult = useBase64(() => blob);
			flushSync();
		});

		// Poll until the FileReader async callback has fired and Svelte has updated
		await new Promise<void>((resolve) => {
			const poll = () => {
				const v = getResult();
				if (v !== undefined) {
					resolved = true;
					resolve();
				} else {
					setTimeout(poll, 10);
				}
			};
			poll();
		});

		expect(resolved).toBe(true);
		const value = getResult();
		expect(value).toBeDefined();
		// Decode and verify round-trip
		const decoded = new TextDecoder().decode(Uint8Array.from(atob(value!), (c) => c.charCodeAt(0)));
		expect(decoded).toBe('test-blob');

		cleanup();
	});

	test('updates when input changes from string to another string', () => {
		let input = $state('first');

		const cleanup = $effect.root(() => {
			const b64 = useBase64(() => input);
			flushSync();
			expect(b64()).toBe(btoa('first'));

			input = 'second';
			flushSync();
			expect(b64()).toBe(btoa('second'));
		});

		cleanup();
	});

	test('returns undefined when input changes to undefined', () => {
		let input = $state<string | undefined>('data');

		const cleanup = $effect.root(() => {
			const b64 = useBase64(() => input);
			flushSync();
			expect(b64()).toBeDefined();

			input = undefined;
			flushSync();
			expect(b64()).toBeUndefined();
		});

		cleanup();
	});

	test('updates from ArrayBuffer to a new ArrayBuffer', () => {
		const buf1 = new TextEncoder().encode('abc').buffer as ArrayBuffer;
		const buf2 = new TextEncoder().encode('xyz').buffer as ArrayBuffer;

		let source = $state<ArrayBuffer>(buf1);

		const cleanup = $effect.root(() => {
			const b64 = useBase64(() => source);
			flushSync();
			expect(b64()).toBe(btoa('abc'));

			source = buf2;
			flushSync();
			expect(b64()).toBe(btoa('xyz'));
		});

		cleanup();
	});

	test('empty string encodes to empty base64', () => {
		const cleanup = $effect.root(() => {
			const b64 = useBase64(() => '');
			flushSync();
			expect(b64()).toBe(btoa(''));
		});
		cleanup();
	});

	test('empty ArrayBuffer encodes to empty base64', () => {
		const cleanup = $effect.root(() => {
			const buffer = new ArrayBuffer(0);
			const b64 = useBase64(() => buffer);
			flushSync();
			expect(b64()).toBe('');
		});
		cleanup();
	});

	test('two independent instances do not interfere', () => {
		const cleanup = $effect.root(() => {
			const b64A = useBase64(() => 'alpha');
			const b64B = useBase64(() => 'beta');
			flushSync();
			expect(b64A()).toBe(btoa('alpha'));
			expect(b64B()).toBe(btoa('beta'));
		});
		cleanup();
	});
});
