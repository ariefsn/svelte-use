#!/usr/bin/env node
/**
 * Flags read-modify-write of reactive state directly in a `$effect` body, which self-triggers
 * until Svelte throws. Only the body itself counts; nested callbacks defer. Silence with `untrack`.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOTS = ['src/lib', 'src/routes'];
const EXTENSIONS = ['.svelte', '.svelte.ts'];

/** `x++`, `x--`, `x += 1`, `x -= 1`, … but not `===` or a lone `+`. */
const MUTATION =
	/^(?:(?:\+\+|--)\s*[A-Za-z_$][\w$.]*|[A-Za-z_$][\w$.]*\s*(?:\+\+|--|[+\-*/]=(?!=)))/;

function walk(dir, out = []) {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) walk(full, out);
		else if (EXTENSIONS.some((ext) => entry.endsWith(ext))) out.push(full);
	}
	return out;
}

/**
 * Strips comments and string/template literals so their contents can't be
 * mistaken for code. Replaces them with spaces to keep column positions.
 */
function stripNoise(source) {
	let out = '';
	let i = 0;
	while (i < source.length) {
		const two = source.slice(i, i + 2);
		if (two === '//') {
			while (i < source.length && source[i] !== '\n') {
				out += ' ';
				i++;
			}
		} else if (two === '/*') {
			while (i < source.length && source.slice(i, i + 2) !== '*/') {
				out += source[i] === '\n' ? '\n' : ' ';
				i++;
			}
			out += '  ';
			i += 2;
		} else if (source[i] === '"' || source[i] === "'" || source[i] === '`') {
			const quote = source[i];
			out += ' ';
			i++;
			while (i < source.length && source[i] !== quote) {
				if (source[i] === '\\') {
					out += ' ';
					i++;
				}
				out += source[i] === '\n' ? '\n' : ' ';
				i++;
			}
			out += ' ';
			i++;
		} else {
			out += source[i];
			i++;
		}
	}
	return out;
}

function scan(file) {
	const raw = readFileSync(file, 'utf8');
	const source = stripNoise(raw);
	const rawLines = raw.split('\n');

	const findings = [];
	// Each entry is a brace scope: 'effect-body', 'nested-func' or 'block'.
	const stack = [];
	let pendingFunc = false; // saw `=>` or `function`, awaiting its `{`
	let pendingEffect = false; // saw `$effect(`, awaiting its body `{`
	let line = 1;

	for (let i = 0; i < source.length; i++) {
		const rest = source.slice(i, i + 12);

		if (source[i] === '\n') {
			line++;
			continue;
		}

		if (/^\$effect(\.pre)?\s*\(/.test(rest)) {
			pendingEffect = true;
			continue;
		}
		if (rest.startsWith('=>') || /^function[\s(*]/.test(rest)) {
			pendingFunc = true;

			// Concise arrow body (`=> expr`, no braces) opens no brace scope.
			if (rest.startsWith('=>')) {
				let j = i + 2;
				while (j < source.length && /\s/.test(source[j])) j++;

				// `$effect(() => count++)` — the effect body *is* the
				// expression, so check it rather than skipping it.
				if (pendingEffect && source[j] !== '{') {
					const concise = source.slice(j, j + 80);
					if (MUTATION.test(concise)) {
						findings.push({ line, text: (rawLines[line - 1] ?? '').trim() });
					}
					pendingEffect = false;
					pendingFunc = false;
					continue;
				}

				if (!pendingEffect && source[j] !== '{') {
					let parens = 0;
					while (j < source.length) {
						const char = source[j];
						if (char === '(') parens++;
						else if (char === ')') {
							if (parens === 0) break;
							parens--;
						} else if ((char === ',' || char === ';') && parens === 0) break;
						else if (char === '\n') line++;
						j++;
					}
					pendingFunc = false;
					i = j - 1;
				}
			}
			continue;
		}

		if (source[i] === '{') {
			if (pendingEffect && pendingFunc) stack.push('effect-body');
			else if (pendingFunc) stack.push('nested-func');
			else stack.push('block');
			pendingEffect = false;
			pendingFunc = false;
			continue;
		}

		if (source[i] === '}') {
			stack.pop();
			continue;
		}

		// Only the region between an effect body and the next nested function
		// runs during the tracking pass.
		const lastFuncScope = stack.lastIndexOf('effect-body');
		const lastNested = stack.lastIndexOf('nested-func');
		if (lastFuncScope === -1 || lastNested > lastFuncScope) continue;

		// Anchored at the cursor, so regions already skipped (nested arrows, untracked blocks) are
		// never examined.
		const prev = i > 0 ? source[i - 1] : ' ';
		if (/[\w$.]/.test(prev)) continue;

		const match = MUTATION.exec(source.slice(i, i + 80));
		if (match && match.index === 0) {
			findings.push({ line, text: (rawLines[line - 1] ?? '').trim() });
			i += match[0].length - 1;
		}
	}

	// De-duplicate: one report per line is enough.
	return findings.filter((f, idx, all) => all.findIndex((o) => o.line === f.line) === idx);
}

let total = 0;
for (const root of ROOTS) {
	for (const file of walk(root)) {
		for (const { line, text } of scan(file)) {
			console.error(`${relative(process.cwd(), file)}:${line}  ${text}`);
			total++;
		}
	}
}

if (total > 0) {
	console.error(
		`\n${total} possible self-triggering $effect mutation(s).\n` +
			`Reading and writing the same $state inside an $effect body loops until\n` +
			`Svelte throws effect_update_depth_exceeded. Wrap it in untrack().`
	);
	process.exit(1);
}

console.log('check-effects: no self-triggering $effect mutations found');
