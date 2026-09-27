export type TextDirection = 'ltr' | 'rtl' | 'auto';

export interface UseTextDirectionReturn {
	/** The current text direction */
	current: () => TextDirection;
	/** Set the text direction */
	set: (dir: TextDirection) => void;
}

/** Reactively tracks and sets the text directionality (dir attribute) of an element. */
export function useTextDirection(options?: {
	element?: HTMLElement;
	initial?: TextDirection;
}): UseTextDirectionReturn {
	const isBrowser = typeof document !== 'undefined';
	const el = options?.element ?? (isBrowser ? document.documentElement : null);
	const initial = options?.initial ?? 'ltr';

	let dir = $state<TextDirection>((el?.getAttribute('dir') as TextDirection) || initial);

	function set(value: TextDirection) {
		dir = value;
		if (el) {
			el.setAttribute('dir', value);
		}
	}

	$effect(() => {
		if (!isBrowser || !el) return;

		const observer = new MutationObserver(() => {
			const current = el.getAttribute('dir') as TextDirection;
			if (current && current !== dir) {
				dir = current;
			}
		});

		observer.observe(el, { attributes: true, attributeFilter: ['dir'] });

		return () => observer.disconnect();
	});

	return {
		current: () => dir,
		set
	};
}
