/**
 * Loaded on demand by the `useScriptTag` documentation demo.
 *
 * Deliberately same-origin and dependency-free: a demo that reaches for a
 * third-party CDN shows an error rather than a feature whenever that CDN is
 * blocked, offline, or has moved the file.
 *
 * Defines exactly one global, so the demo can show that a script's globals
 * become available only once it has executed.
 */
window.svelteUseDemoScript = {
	loadedAt: Date.now(),

	/** Scatters a few short-lived dots across the target element. */
	burst(target) {
		if (!target) return;

		const colors = ['#a78bfa', '#4ade80', '#f87171', '#fbbf24', '#7dd3fc'];

		for (let i = 0; i < 24; i++) {
			const dot = document.createElement('span');
			const angle = (Math.PI * 2 * i) / 24;
			const distance = 40 + Math.random() * 50;

			dot.style.cssText = [
				'position:absolute',
				'left:50%',
				'top:50%',
				'width:7px',
				'height:7px',
				'border-radius:50%',
				'pointer-events:none',
				`background:${colors[i % colors.length]}`
			].join(';');

			target.appendChild(dot);

			dot.animate(
				[
					{ transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
					{
						transform: `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${Math.sin(angle) * distance}px)) scale(0)`,
						opacity: 0
					}
				],
				{ duration: 700 + Math.random() * 400, easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)' }
			).onfinish = () => dot.remove();
		}
	}
};
