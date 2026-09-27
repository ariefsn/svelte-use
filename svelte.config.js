// import adapter from '@sveltejs/adapter-auto';
import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: null
		}),
		prerender: {
			handleMissingId: 'warn',
			// Without this, `page.url.origin` is `http://sveltekit-prerender` during the build,
			// so every og:url and og:image would ship that non-existent hostname.
			origin: 'https://svelte-use.ariefsn.dev'
		}
	}
};

export default config;
