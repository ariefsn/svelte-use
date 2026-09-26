<script lang="ts">
	import { useElementBounding } from '$lib';

	let el = $state<HTMLDivElement | null>(null);
	let wide = $state(false);
	let spacer = $state(false);

	const box = useElementBounding(() => el);

	// Whatever the element's position actually is right now, independent of the
	// tracked values — used purely to show when they have gone stale.
	let actualTop = $state(0);
	let checkedAt = $state(0);

	function checkStale() {
		actualTop = el?.getBoundingClientRect().top ?? 0;
		checkedAt = Date.now();
	}

	$effect(() => {
		// Re-measure whenever the layout toggles change.
		void spacer;
		void wide;
		checkStale();
	});

	const isStale = $derived(Math.abs(actualTop - box.top()) > 1 && checkedAt > 0);
</script>

<div class="demo-wrap">
	{#if spacer}
		<div class="spacer">a sibling above just appeared — the box moved down</div>
	{/if}

	<div bind:this={el} class="target" class:wide>
		<span>resize or move me</span>
	</div>

	<div class="grid">
		<div class="row">
			<span class="label">x / y</span>
			<span class="value accent">{box.x().toFixed(0)}, {box.y().toFixed(0)}</span>
		</div>
		<div class="row">
			<span class="label">width × height</span>
			<span class="value accent">{box.width().toFixed(0)} × {box.height().toFixed(0)}</span>
		</div>
		<div class="row">
			<span class="label">top / bottom</span>
			<span class="value accent" class:stale={isStale}>
				{box.top().toFixed(0)} / {box.bottom().toFixed(0)}
			</span>
		</div>
		<div class="row">
			<span class="label">left / right</span>
			<span class="value accent">{box.left().toFixed(0)} / {box.right().toFixed(0)}</span>
		</div>
	</div>

	{#if isStale}
		<p class="warn">
			Stale — the box really is at <strong>top: {actualTop.toFixed(0)}</strong>. Moving an element
			resizes nothing, so <code>ResizeObserver</code> stays quiet and no scroll or resize event
			fires. Press <code>update()</code>.
		</p>
	{/if}

	<div class="actions">
		<button onclick={() => (wide = !wide)}>toggle width</button>
		<button onclick={() => (spacer = !spacer)}>toggle sibling above</button>
		<button
			class:primary={isStale}
			onclick={() => {
				box.update();
				checkStale();
			}}
		>
			update()
		</button>
	</div>

	<p class="hint">
		Toggling the <em>width</em> updates by itself — that is a size change, so
		<code>ResizeObserver</code> catches it. Toggling the <em>sibling</em> only moves the box, which
		nothing observes, so the values need <code>update()</code>.
	</p>
</div>

<style>
	.spacer {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 56px;
		border-radius: 8px;
		border: 1px dashed #3a3a3a;
		color: #666;
		font-size: 0.8rem;
		font-style: italic;
	}
	.target {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 70px;
		width: 60%;
		border-radius: 8px;
		background: linear-gradient(135deg, #a78bfa, #7c3aed);
		color: #fff;
		font-size: 0.85rem;
		transition: width 0.25s;
	}
	.target.wide {
		width: 100%;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
		gap: 0.2rem 1rem;
	}
	.value.stale {
		color: #fbbf24;
		text-decoration: underline wavy #92400e;
	}
	.warn {
		margin: 0;
		padding: 0.55rem 0.75rem;
		border-radius: 8px;
		background: #2a1e0f;
		border: 1px solid #92400e;
		color: #fbbf24;
		font-size: 0.82rem;
		line-height: 1.6;
	}
	.warn strong {
		font-family: monospace;
	}
	button.primary {
		border-color: #a78bfa;
		color: #c4b5fd;
	}
</style>
