<script lang="ts">
	import { useScriptTag } from '$lib';

	/** The global the SDK defines once it has executed. */
	type ConfettiWindow = Window & {
		confetti?: (options?: {
			particleCount?: number;
			spread?: number;
			origin?: { y?: number };
		}) => void;
	};

	const script = useScriptTag(
		'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.min.js',
		{ immediate: false }
	);

	let message = $state('');

	async function celebrate() {
		message = '';
		try {
			await script.load();
			// The SDK's global only exists once the script has executed.
			(window as ConfettiWindow).confetti?.({
				particleCount: 80,
				spread: 70,
				origin: { y: 0.8 }
			});
		} catch {
			message = 'Could not load the script — offline, or blocked by the network.';
		}
	}
</script>

<div class="demo-wrap">
	<div class="actions">
		<button onclick={celebrate} disabled={script.isLoading()}>
			{script.isLoading() ? 'loading…' : script.isLoaded() ? 'celebrate again' : 'load & celebrate'}
		</button>
		<button onclick={() => script.unload()} disabled={!script.isLoaded()}>unload</button>
	</div>

	<div class="row">
		<span class="label">status</span>
		<span class="value accent">{script.status()}</span>
	</div>
	<div class="row">
		<span class="label">id</span>
		<span class="value">{script.id}</span>
	</div>
	{#if message}
		<p class="muted">{message}</p>
	{/if}

	<p class="hint">
		The script is fetched on first click, not at mount. Click again and it fires immediately — the
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
