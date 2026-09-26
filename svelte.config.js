// import adapter from '@sveltejs/adapter-auto';
import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: null
		}),
		prerender: {
			handleMissingId: 'warn',
			// Without this, `page.url.origin` is `http://sveltekit-prerender`
			// during the build, and anything derived from it ships that
			// placeholder — which is how every og:url and og:image on the live
			// site ended up pointing at a hostname that does not exist.
			origin: 'https://svelte-use.ariefsn.dev'
		}
	}
};

export default config;
