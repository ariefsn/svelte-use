import { flushSync } from 'svelte';
import { describe, expect, test } from 'vitest';
import { useCloned } from './useCloned.svelte.js';

describe('useCloned', () => {
	test('produces a deep copy that is not the source', () => {
		const cleanup = $effect.root(() => {
			const source = { name: 'Ada', tags: ['a'] };
			const draft = useCloned(() => source);

			expect(draft.cloned()).toEqual(source);
			expect(draft.cloned()).not.toBe(source);
			// Deep, not shallow: nested references must not be shared.
			expect(draft.cloned().tags).not.toBe(source.tags);
		});
		cleanup();
	});

	test('mutating the clone leaves the source untouched', () => {
		const cleanup = $effect.root(() => {
			const source = { name: 'Ada' };
			const draft = useCloned(() => source);

			draft.cloned().name = 'Grace';
			expect(source.name).toBe('Ada');
		});
		cleanup();
	});

	test('preserves types a JSON round-trip would destroy', () => {
		const cleanup = $effect.root(() => {
			const source = {
				when: new Date('2026-01-01'),
				seen: new Set([1, 2]),
				by: new Map([['a', 1]])
			};
			const draft = useCloned(() => source);

			expect(draft.cloned().when).toBeInstanceOf(Date);
			expect(draft.cloned().seen).toBeInstanceOf(Set);
			expect(draft.cloned().by).toBeInstanceOf(Map);
			expect(draft.cloned().by.get('a')).toBe(1);
		});
		cleanup();
	});

	test('re-clones when the source changes', () => {
		const cleanup = $effect.root(() => {
			let source = $state({ n: 1 });
			const draft = useCloned(() => source);
			flushSync();

			source = { n: 2 };
			flushSync();

			expect(draft.cloned().n).toBe(2);
		});
		cleanup();
	});

	test('manual mode keeps edits when the source changes', () => {
		// The reason `manual` exists: an incoming update must not wipe a
		// half-finished form.
		const cleanup = $effect.root(() => {
			let source = $state({ n: 1 });
			const draft = useCloned(() => source, { manual: true });
			flushSync();

			draft.set({ n: 99 });
			source = { n: 2 };
			flushSync();

			expect(draft.cloned().n).toBe(99);

			draft.sync();
			flushSync();
			expect(draft.cloned().n).toBe(2);
		});
		cleanup();
	});

	test('isModified compares structurally, not by reference', () => {
		const cleanup = $effect.root(() => {
			const source = { name: 'Ada', tags: ['a'] };
			const draft = useCloned(() => source, { manual: true });
			flushSync();

			// A fresh but equal object is not a modification.
			expect(draft.isModified()).toBe(false);

			draft.set({ name: 'Grace', tags: ['a'] });
			flushSync();
			expect(draft.isModified()).toBe(true);

			draft.set({ name: 'Ada', tags: ['a'] });
			flushSync();
			expect(draft.isModified()).toBe(false);
		});
		cleanup();
	});

	test('isModified handles nested differences and dates', () => {
		const cleanup = $effect.root(() => {
			const source = { at: new Date('2026-01-01'), meta: { deep: [1, 2] } };
			const draft = useCloned(() => source, { manual: true });
			flushSync();

			expect(draft.isModified()).toBe(false);

			draft.set({ at: new Date('2026-01-01'), meta: { deep: [1, 3] } });
			flushSync();
			expect(draft.isModified()).toBe(true);
		});
		cleanup();
	});

	test('clones a reactive $state object', () => {
		// The primary use case, and the one that breaks without unwrapping:
		// `$state` deep-proxies plain objects and `structuredClone` throws
		// DataCloneError on a Proxy.
		const cleanup = $effect.root(() => {
			const source = $state({ name: 'Ada', nested: { tags: ['a'] } });
			const draft = useCloned(() => source);
			flushSync();

			expect(draft.cloned()).toEqual({ name: 'Ada', nested: { tags: ['a'] } });

			draft.cloned().nested.tags.push('b');
			expect(source.nested.tags).toEqual(['a']);
		});
		cleanup();
	});

	test('mutating a field of the clone is reactive', () => {
		// The primary way an edit buffer is used: `bind:value` writes to a
		// field rather than replacing the object. This needs the clone to be
		// deeply reactive, which a plain `$derived` value is not.
		const cleanup = $effect.root(() => {
			const source = $state({ name: 'Ada', role: 'Engineer' });
			const draft = useCloned(() => source, { manual: true });
			const modified = $derived(draft.isModified());
			flushSync();

			expect(modified).toBe(false);

			draft.cloned().name = 'Grace';
			flushSync();

			expect(draft.cloned().name).toBe('Grace');
			expect(modified).toBe(true);
			expect(source.name).toBe('Ada');
		});
		cleanup();
	});

	test('accepts a custom clone function', () => {
		const cleanup = $effect.root(() => {
			const source = { n: 1 };
			const draft = useCloned(() => source, { clone: (value) => ({ ...value, n: value.n * 10 }) });

			expect(draft.cloned().n).toBe(10);
		});
		cleanup();
	});
});
