/**
 * Exposes the cursor position as an offset from the centre of a target element, scaled
 * by a speed multiplier. Drive CSS transforms with the returned `x` and `y`.
 */
export function useParallax(
	target: () => HTMLElement | null | undefined,
	options?: {
		speed?: number;
	}
) {
	const speed = options?.speed ?? 0.1;

	let x = $state(0);
	let y = $state(0);

	$effect(() => {
		const el = target();

		if (typeof window === 'undefined' || !el) {
			x = 0;
			y = 0;
			return;
		}

		function onMouseMove(event: MouseEvent) {
			if (!el) return;

			const rect = el.getBoundingClientRect();
			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;

			x = (event.clientX - centerX) * speed;
			y = (event.clientY - centerY) * speed;
		}

		window.addEventListener('mousemove', onMouseMove);

		return () => {
			window.removeEventListener('mousemove', onMouseMove);
			x = 0;
			y = 0;
		};
	});

	return {
		x: () => x,
		y: () => y
	};
}
