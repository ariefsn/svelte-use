import { PREFERS_DARK_QUERY } from '../../internal/mediaQueries.js';

/** Options for {@link colorModeScript}. All must match the composable's. */
export interface ColorModeScriptOptions {
	/** Default `'svelte-use-color-mode'`. */
	storageKey?: string;
	/** Default `'class'`. */
	attribute?: string;
	/** Default `{ light: 'light', dark: 'dark' }`. */
	modes?: Record<string, string>;
	/** Default `'auto'`. */
	initialValue?: string;
}

/** Default storage key, shared with `useColorMode`. */
export const DEFAULT_COLOR_MODE_STORAGE_KEY = 'svelte-use-color-mode';

/**
 * Returns the source of a blocking script that applies the persisted colour mode before first
 * paint.
 */
export function colorModeScript(options: ColorModeScriptOptions = {}): string {
	const {
		storageKey = DEFAULT_COLOR_MODE_STORAGE_KEY,
		attribute = 'class',
		modes = { light: 'light', dark: 'dark' },
		initialValue = 'auto'
	} = options;

	// Minified by hand rather than generated: this string lands in the HTML of every page, and a
	// build step to compress it would be more machinery than the few bytes are worth.
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
