<script lang="ts">
	import { useScriptTag } from '$lib';

	/** The single global `/demo-script-tag.js` defines once it has executed. */
	type DemoWindow = Window & {
		svelteUseDemoScript?: {
			loadedAt: number;
			burst: (target: HTMLElement | null) => void;
		};
	};

	// Same-origin on purpose: a demo pointing at a third-party CDN shows an
	// error rather than a feature the moment that CDN is blocked or offline.
	const script = useScriptTag('/demo-script-tag.js', { immediate: false });

	let stage = $state<HTMLDivElement | null>(null);
	let message = $state('');

	async function loadAndRun() {
		message = '';
		try {
			await script.load();
			// The global exists only after the script has executed.
			(window as DemoWindow).svelteUseDemoScript?.burst(stage);
		} catch {
			message = 'Could not load the script.';
		}
	}
</script>

<div class="demo-wrap">
	<div class="actions">
		<button onclick={loadAndRun} disabled={script.isLoading()}>
			{script.isLoading() ? 'loading…' : script.isLoaded() ? 'run again' : 'load script'}
		</button>
		<button onclick={() => script.unload()} disabled={!script.isLoaded()}>unload</button>
	</div>

	<div class="row">
		<span class="label">status</span>
		<span class="value accent">{script.status()}</span>
	</div>
	<div class="row">
		<span class="label">global</span>
		<span class="value"
			>{script.isLoaded() ? 'window.svelteUseDemoScript' : '(not yet defined)'}</span
		>
	</div>
	{#if message}
		<p class="muted">{message}</p>
	{/if}

	<div
		class="bg-bg-sunken border-border relative flex min-h-[110px] items-center justify-center overflow-hidden rounded-lg border"
		bind:this={stage}
	>
		{#if !script.isLoaded()}
			<span class="muted">nothing loaded yet</span>
		{/if}
	</div>

	<p class="hint">
		The script is fetched on first click, not at mount. Click again and it runs immediately — the
		tag is reused rather than re-fetched. Two components asking for the same URL share one element
		<em>and</em> one promise, so the second resolves as soon as the first has executed rather than waiting
		on an event that already fired.
	</p>
	<p class="hint">
		Unlike <code>useStyleTag</code>, the tag is left in place on destroy: removing a
		<code>&lt;script&gt;</code> does not undo what it did, but re-adding it would run every side effect
		a second time.
	</p>
</div>
