import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { readable } from 'svelte/store';

// `+page.svelte` reads `$page.url` in <svelte:head>. Outside SvelteKit the
// store is unpopulated, so it has to be stubbed or rendering throws.
vi.mock('$app/stores', () => ({
	page: readable({
		url: new URL('http://localhost/'),
		params: {},
		data: {},
		route: { id: '/' },
		status: 200,
		error: null,
		form: undefined,
		state: {}
	})
}));

import Page from './+page.svelte';

describe('/+page.svelte', () => {
	it('should render h1', async () => {
		render(Page);

		const heading = page.getByRole('heading', { level: 1 });
		await expect.element(heading).toBeInTheDocument();
	});
});
