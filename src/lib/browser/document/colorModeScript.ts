import { PREFERS_DARK_QUERY } from '../../internal/mediaQueries.js';

/** Options for {@link colorModeScript}. All must match the composable's. */
export interface ColorModeScriptOptions {
	/** @default 'svelte-use-color-mode' */
	storageKey?: string;
	/** @default 'class' */
	attribute?: string;
	/** @default { light: 'light', dark: 'dark' } */
	modes?: Record<string, string>;
	/** @default 'auto' */
	initialValue?: string;
}

/** Default storage key, shared with `useColorMode`. */
export const DEFAULT_COLOR_MODE_STORAGE_KEY = 'svelte-use-color-mode';

/**
 * Returns the source of a blocking script that applies the persisted colour
 * mode before first paint.
 *
 * A composable cannot do this: it runs after hydration, which is after first
 * paint, so a stored mode differing from the server-rendered one always
 * flashes. Putting this in `app.html` inside `<head>`, **above every
 * stylesheet**, is the only way to avoid it:
 *
 * ```html
 * <script>%colorModeScript%</script>
 * ```
 *
 * A plain function, not a composable — it touches no runes and is safe to call
 * at build time. Its defaults mirror `useColorMode`; pass the same options to
 * both or the script will apply the wrong attribute.
 *
 * @param options - Must match the `useColorMode` call it pairs with
 * @returns JavaScript source, ready to inline
 */
export function colorModeScript(options: ColorModeScriptOptions = {}): string {
	const {
		storageKey = DEFAULT_COLOR_MODE_STORAGE_KEY,
		attribute = 'class',
		modes = { light: 'light', dark: 'dark' },
		initialValue = 'auto'
	} = options;

	// Minified by hand rather than generated: this string lands in the HTML of
	// every page, and a build step to compress it would be more machinery than
	// the few bytes are worth.
	return (
		`(function(){try{` +
		`var k=${JSON.stringify(storageKey)},a=${JSON.stringify(attribute)},` +
		`m=${JSON.stringify(modes)},s=localStorage.getItem(k)||${JSON.stringify(initialValue)};` +
		`if(s==='auto')s=matchMedia(${JSON.stringify(PREFERS_DARK_QUERY)}).matches?'dark':'light';` +
		`var v=m[s]||'',e=document.documentElement;` +
		`if(a==='class'){for(var p in m){if(m[p])e.classList.remove(m[p]);}if(v)e.classList.add(v);}` +
		`else if(v){e.setAttribute(a,v);}` +
		`}catch(_){}})()`
	);
}
