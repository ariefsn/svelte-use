/** Minimal inline-markdown renderer for documentation strings. */

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

/** Converts inline markdown to HTML, escaping everything else. */
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

/** Strips inline markdown markers without emitting any HTML. */
export function stripInline(value: string): string {
	if (!value) return '';

	return value
		.replace(/`([^`]+)`/g, '$1')
		.replace(/\*\*([^*]+)\*\*/g, '$1')
		.replace(/(^|[\s(])[*_]([^*_\n]+)[*_]/g, '$1$2');
}
