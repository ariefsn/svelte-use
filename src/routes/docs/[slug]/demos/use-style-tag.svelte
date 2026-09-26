<script lang="ts">
	import { useStyleTag } from '$lib';

	let hue = $state(265);
	let size = $state(1);

	const tag = useStyleTag(
		() => `.style-tag-demo-target {
	color: hsl(${hue} 80% 70%);
	font-size: ${size}rem;
}`,
		{ id: 'svelte-use-style-tag-demo' }
	);
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">hue</span>
		<input type="range" min="0" max="360" bind:value={hue} />
		<span class="value accent">{hue}</span>
	</div>
	<div class="row">
		<span class="label">size</span>
		<input type="range" min="0.8" max="2" step="0.1" bind:value={size} />
		<span class="value accent">{size}rem</span>
	</div>
	<div class="row">
		<span class="label">isLoaded</span>
		<span class="value">{tag.isLoaded()}</span>
	</div>

	<p class="style-tag-demo-target">Styled by an injected &lt;style&gt; element.</p>

	<div class="actions">
		<button onclick={() => tag.unload()}>unload</button>
		<button onclick={() => tag.load()}>load</button>
	</div>

	<p class="hint">
		The element is reused as the CSS changes rather than recreated. Two call sites passing the same
		<code>id</code> share one element, and it survives until both release it — so one component cannot
		tear down CSS another still needs.
	</p>
</div>

<style>
	input[type='range'] {
		flex: 1;
		accent-color: #a78bfa;
	}
	.row {
		gap: 0.75rem;
	}
</style>
