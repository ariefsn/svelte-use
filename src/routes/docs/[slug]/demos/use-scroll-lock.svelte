<script lang="ts">
	import { useScrollLock } from '$lib/browser/input/useScrollLock.svelte.js';

	// Lock the demo panel's inner scroll container (not document.body) so the
	// demo works correctly inside an iframe / scrollable page.
	let scrollEl: HTMLElement | null = $state(null);

	const { isLocked, lock, unlock } = useScrollLock(() => scrollEl ?? undefined);
</script>

<div class="demo-wrap">
	<p class="hint">
		Lock scrolling on the container below. While locked, the inner list cannot be scrolled.
	</p>

	<div class="actions">
		<button class:active={isLocked()} onclick={lock} disabled={isLocked()}>Lock</button>
		<button onclick={unlock} disabled={!isLocked()}>Unlock</button>
	</div>

	<div class="row">
		<span class="label">isLocked</span>
		<span class="value accent">{isLocked()}</span>
	</div>

	<div class="divider"></div>

	<!-- Scrollable target element -->
	<div
		class="bg-bg-sunken border-border h-40 overflow-y-auto rounded-lg border"
		bind:this={scrollEl}
	>
		{#each { length: 20 } as _, i (i)}
			<div
				class="border-border/60 flex items-center gap-3 border-b px-3 py-[0.45rem] text-[0.82rem] last:border-b-0"
			>
				<span class="text-text-faint min-w-[30px] shrink-0 font-mono text-[0.75rem]">#{i + 1}</span>
				<span class="text-text-muted">Scroll row {i + 1} of 20</span>
			</div>
		{/each}
	</div>

	<p class="hint">
		The <code>overflow</code> style of the box above is toggled between its original value and
		<code>hidden</code>.
	</p>
</div>
