/**
 * Minimal inline-markdown renderer for documentation strings.
 *
 * Doc copy in `pages.ts` is authored with markdown-style markers (`` `code` ``,
 * `**bold**`, `*italic*`). Svelte interpolation escapes HTML, so these need to
 * be converted to tags and rendered with `{@html}`.
 *
 * HTML is escaped *before* markers are converted, so nothing in the source text
 * can inject markup — the only tags in the output are the ones this module
 * emits.
 */

const ESCAPES: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;'
};

function escapeHtml(value: string): string {
	return value.replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

/**
 * Converts inline markdown to HTML, escaping everything else.
 *
 * Supports `` `code` ``, `**bold**` and `*italic*` / `_italic_`.
 *
 * @param value - Source text authored in `pages.ts`
 * @returns HTML safe to pass to `{@html}`
 *
 * @example
 * ```ts
 * formatInline('Unlike `useInterval`, this does **not** start automatically.');
 * // → 'Unlike <code class="inline-code">useInterval</code>, this does <strong>not</strong> start automatically.'
 * ```
 */
export function formatInline(value: string): string {
	if (!value) return '';

	return (
		escapeHtml(value)
			// Code spans first: their contents must not be re-processed for
			// emphasis, so that `**` inside backticks stays literal.
			.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
			.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
			.replace(/(^|[\s(])[*_]([^*_\n]+)[*_]/g, '$1<em>$2</em>')
	);
}

/**
 * Strips inline markdown markers without emitting any HTML.
 *
 * Used for `<meta>` tag content, where markup would leak into search results
 * and link previews.
 *
 * @param value - Source text authored in `pages.ts`
 * @returns Plain text with markers removed
 *
 * @example
 * ```ts
 * stripInline('Unlike `useInterval`, this does **not** start automatically.');
 * // → 'Unlike useInterval, this does not start automatically.'
 * ```
 */
export function stripInline(value: string): string {
	if (!value) return '';

	return value
		.replace(/`([^`]+)`/g, '$1')
		.replace(/\*\*([^*]+)\*\*/g, '$1')
		.replace(/(^|[\s(])[*_]([^*_\n]+)[*_]/g, '$1$2');
}
