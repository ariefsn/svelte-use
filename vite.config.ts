import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		port: Number(process.env.PORT || '5173')
	},
	test: {
		expect: { requireAssertions: true },
		coverage: {
			provider: 'v8',
			// The library only. The docs site under `src/routes` and `src/docs` is the
			// consumer of this package, not part of the published surface.
			include: ['src/lib/**'],
			exclude: [
				'src/lib/**/*.{test,spec}.{js,ts}',
				// Re-export barrel: no logic to cover.
				'src/lib/index.ts',
				// Type-only modules compile away, so v8 reports them as 0%.
				'src/lib/seo/types.ts'
			],
			reporter: ['text', 'html', 'lcov'],
			reportsDirectory: './coverage',
			thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 }
		},
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**']
				}
			},

			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
