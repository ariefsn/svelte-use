import { flushSync } from 'svelte';
import { describe, expect, test } from 'vitest';
import { useMouse } from './useMouse.svelte.js';

describe('useMouse', () => {
	test('initialises x, y to 0 and sourceType to null', () => {
		const cleanup = $effect.root(() => {
			const mouse = useMouse();
			flushSync();
			expect(mouse.x()).toBe(0);
			expect(mouse.y()).toBe(0);
			expect(mouse.sourceType()).toBeNull();
		});
		cleanup();
	});

	test('updates position and sourceType on mousemove', () => {
		let mouse!: ReturnType<typeof useMouse>;

		const cleanup = $effect.root(() => {
			mouse = useMouse();
		});

		flushSync();

		window.dispatchEvent(
			new MouseEvent('mousemove', { clientX: 150, clientY: 250, bubbles: true })
		);

		expect(mouse.x()).toBe(150);
		expect(mouse.y()).toBe(250);
		expect(mouse.sourceType()).toBe('mouse');

		cleanup();
	});

	test('updates position and sourceType on touchmove', () => {
		let mouse!: ReturnType<typeof useMouse>;

		const cleanup = $effect.root(() => {
			mouse = useMouse({ touch: true });
		});

		flushSync();

		const touch = new Touch({ identifier: 1, target: document.body, clientX: 80, clientY: 90 });
		window.dispatchEvent(new TouchEvent('touchmove', { touches: [touch], bubbles: true }));

		expect(mouse.x()).toBe(80);
		expect(mouse.y()).toBe(90);
		expect(mouse.sourceType()).toBe('touch');

		cleanup();
	});

	test('ignores touch when touch option is false', () => {
		let mouse!: ReturnType<typeof useMouse>;

		const cleanup = $effect.root(() => {
			mouse = useMouse({ touch: false });
		});

		flushSync();

		const touch = new Touch({ identifier: 1, target: document.body, clientX: 50, clientY: 60 });
		window.dispatchEvent(new TouchEvent('touchmove', { touches: [touch], bubbles: true }));

		expect(mouse.x()).toBe(0);
		expect(mouse.y()).toBe(0);
		expect(mouse.sourceType()).toBeNull();

		cleanup();
	});

	test('switches sourceType from touch to mouse', () => {
		let mouse!: ReturnType<typeof useMouse>;

		const cleanup = $effect.root(() => {
			mouse = useMouse();
		});

		flushSync();

		const touch = new Touch({ identifier: 1, target: document.body, clientX: 10, clientY: 20 });
		window.dispatchEvent(new TouchEvent('touchmove', { touches: [touch], bubbles: true }));
		expect(mouse.sourceType()).toBe('touch');

		window.dispatchEvent(new MouseEvent('mousemove', { clientX: 30, clientY: 40, bubbles: true }));
		expect(mouse.sourceType()).toBe('mouse');
		expect(mouse.x()).toBe(30);
		expect(mouse.y()).toBe(40);

		cleanup();
	});

	test('removes listener on cleanup — events no longer update position', () => {
		let mouse!: ReturnType<typeof useMouse>;

		const cleanup = $effect.root(() => {
			mouse = useMouse();
		});

		flushSync();

		window.dispatchEvent(new MouseEvent('mousemove', { clientX: 50, clientY: 60, bubbles: true }));
		expect(mouse.x()).toBe(50);

		cleanup();

		window.dispatchEvent(
			new MouseEvent('mousemove', { clientX: 999, clientY: 999, bubbles: true })
		);
		expect(mouse.x()).toBe(50);
	});

	test('multiple instances track independently', () => {
		let a!: ReturnType<typeof useMouse>;
		let b!: ReturnType<typeof useMouse>;

		const cleanup = $effect.root(() => {
			a = useMouse();
			b = useMouse({ touch: false });
		});

		flushSync();

		window.dispatchEvent(
			new MouseEvent('mousemove', { clientX: 100, clientY: 200, bubbles: true })
		);

		expect(a.x()).toBe(100);
		expect(b.x()).toBe(100);

		const touch = new Touch({ identifier: 1, target: document.body, clientX: 5, clientY: 5 });
		window.dispatchEvent(new TouchEvent('touchmove', { touches: [touch], bubbles: true }));

		expect(a.sourceType()).toBe('touch');
		expect(b.sourceType()).toBe('mouse'); // touch: false

		cleanup();
	});
});
