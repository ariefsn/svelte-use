import { flushSync } from 'svelte';
import { describe, expect, test } from 'vitest';
import { useScrollLock } from './useScrollLock.svelte.js';

describe('useScrollLock', () => {
	test('isLocked starts as false', () => {
		const cleanup = $effect.root(() => {
			const { isLocked } = useScrollLock();
			flushSync();
			expect(isLocked()).toBe(false);
		});
		cleanup();
	});

	test('lock sets overflow: hidden on body', () => {
		let lock!: () => void;
		let isLocked!: () => boolean;

		const cleanup = $effect.root(() => {
			({ lock, isLocked } = useScrollLock());
		});

		flushSync();

		lock();
		expect(isLocked()).toBe(true);
		expect(document.body.style.overflow).toBe('hidden');

		document.body.style.overflow = '';
		cleanup();
	});

	test('unlock restores original overflow style', () => {
		document.body.style.overflow = 'auto';

		let lock!: () => void;
		let unlock!: () => void;

		const cleanup = $effect.root(() => {
			({ lock, unlock } = useScrollLock());
		});

		flushSync();

		lock();
		expect(document.body.style.overflow).toBe('hidden');

		unlock();
		expect(document.body.style.overflow).toBe('auto');

		document.body.style.overflow = '';
		cleanup();
	});

	test('isLocked is false after unlock', () => {
		let lock!: () => void;
		let unlock!: () => void;
		let isLocked!: () => boolean;

		const cleanup = $effect.root(() => {
			({ lock, unlock, isLocked } = useScrollLock());
		});

		flushSync();

		lock();
		expect(isLocked()).toBe(true);

		unlock();
		expect(isLocked()).toBe(false);

		cleanup();
	});

	test('cleanup restores overflow when locked', () => {
		document.body.style.overflow = '';

		let lock!: () => void;

		const cleanup = $effect.root(() => {
			({ lock } = useScrollLock());
		});

		flushSync();

		lock();
		expect(document.body.style.overflow).toBe('hidden');

		cleanup();
		expect(document.body.style.overflow).toBe('');
	});

	test('cleanup does nothing when not locked', () => {
		document.body.style.overflow = 'scroll';

		const cleanup = $effect.root(() => {
			useScrollLock();
		});

		flushSync();
		cleanup();

		expect(document.body.style.overflow).toBe('scroll');
		document.body.style.overflow = '';
	});

	test('lock on custom target element', () => {
		const el = document.createElement('div');
		document.body.appendChild(el);

		let lock!: () => void;
		let unlock!: () => void;
		let isLocked!: () => boolean;

		const cleanup = $effect.root(() => {
			({ lock, unlock, isLocked } = useScrollLock(() => el));
		});

		flushSync();

		lock();
		expect(el.style.overflow).toBe('hidden');
		expect(isLocked()).toBe(true);

		unlock();
		expect(el.style.overflow).toBe('');
		expect(isLocked()).toBe(false);

		el.remove();
		cleanup();
	});

	test('calling lock twice does not double-set overflow', () => {
		document.body.style.overflow = '';

		let lock!: () => void;
		let unlock!: () => void;

		const cleanup = $effect.root(() => {
			({ lock, unlock } = useScrollLock());
		});

		flushSync();

		lock();
		lock(); // second call should be a no-op
		expect(document.body.style.overflow).toBe('hidden');

		unlock();
		expect(document.body.style.overflow).toBe('');

		cleanup();
	});

	test('calling unlock when not locked is a no-op', () => {
		document.body.style.overflow = '';

		let unlock!: () => void;
		let isLocked!: () => boolean;

		const cleanup = $effect.root(() => {
			({ unlock, isLocked } = useScrollLock());
		});

		flushSync();

		unlock();
		expect(isLocked()).toBe(false);
		expect(document.body.style.overflow).toBe('');

		cleanup();
	});
});
