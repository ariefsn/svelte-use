import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { colorModeScript } from '../lib/browser/document/colorModeScript.js';

/**
 * `app.html` carries a hand-pasted copy of the pre-paint script, because it is
 * a static file with no build step to generate one.
 *
 * That copy can silently drift from `colorModeScript()` — and the failure mode
 * is nasty: the site keeps working, but the theme flashes on every load, or
 * the script writes an attribute the composable does not read. These checks
 * make the drift a build failure instead.
 */
describe('pre-paint colour mode script', () => {
	const appHtml = readFileSync(join(process.cwd(), 'src/app.html'), 'utf8');

	it('matches colorModeScript() exactly', () => {
		// Must stay in step with the `useColorMode()` call in the root layout.
		expect(appHtml).toContain(colorModeScript({ initialValue: 'dark' }));
	});

	it('runs before the SvelteKit head placeholder', () => {
		// Below %sveltekit.head% the stylesheets would already have applied,
		// which is the flash this script exists to prevent.
		expect(appHtml.indexOf('localStorage.getItem')).toBeLessThan(
			appHtml.indexOf('%sveltekit.head%')
		);
	});

	it('server-renders the dark class, matching the hard dark default', () => {
		// `initialValue: 'dark'` means a visitor with no stored preference gets
		// dark; the served HTML has to agree or the first paint is wrong.
		expect(appHtml).toContain('<html lang="en" class="dark">');
	});
});
