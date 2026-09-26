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
		<div
			class="border-border-strong text-text-muted flex h-14 items-center justify-center rounded-lg border border-dashed text-[0.8rem] italic"
		>
			a sibling above just appeared — the box moved down
		</div>
	{/if}

	<div
		bind:this={el}
		class="from-accent to-accent-dim flex h-[70px] items-center justify-center rounded-lg bg-gradient-to-br text-[0.85rem] text-white transition-[width] duration-250 {wide
			? 'w-full'
			: 'w-3/5'}"
	>
		<span>resize or move me</span>
	</div>

	<div class="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-x-4 gap-y-1">
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
			<span
				class="value accent {isStale
					? 'text-warning decoration-warning-border underline decoration-wavy'
					: ''}"
			>
				{box.top().toFixed(0)} / {box.bottom().toFixed(0)}
			</span>
		</div>
		<div class="row">
			<span class="label">left / right</span>
			<span class="value accent">{box.left().toFixed(0)} / {box.right().toFixed(0)}</span>
		</div>
	</div>

	{#if isStale}
		<p
			class="bg-warning-bg border-warning-border text-warning m-0 rounded-lg border px-3 py-2.5 text-[0.82rem] leading-relaxed"
		>
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
