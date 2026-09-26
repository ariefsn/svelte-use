/**
 * Media query literals shared across composables.
 *
 * A plain module rather than a `.svelte.ts` one, so pure consumers — such as
 * the pre-paint script generator — can import it without pulling in runes.
 */

/** The OS dark-mode preference. */
export const PREFERS_DARK_QUERY = '(prefers-color-scheme: dark)';
