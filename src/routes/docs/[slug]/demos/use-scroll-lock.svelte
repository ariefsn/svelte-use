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
	<div class="scroll-box" bind:this={scrollEl}>
		{#each { length: 20 } as _, i}
			<div class="scroll-row">
				<span class="scroll-index">#{i + 1}</span>
				<span class="scroll-text">Scroll row {i + 1} of 20</span>
			</div>
		{/each}
	</div>

	<p class="hint">
		The <code>overflow</code> style of the box above is toggled between its original value and
		<code>hidden</code>.
	</p>
</div>

<style>
	.scroll-box {
		height: 160px;
		overflow-y: auto;
		border: 1px solid #2a2a2a;
		border-radius: 8px;
		background: #0d0d0d;
	}

	.scroll-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.45rem 0.75rem;
		border-bottom: 1px solid #141414;
		font-size: 0.82rem;
	}

	.scroll-row:last-child {
		border-bottom: none;
	}

	.scroll-index {
		font-family: monospace;
		font-size: 0.75rem;
		color: #444;
		min-width: 30px;
		flex-shrink: 0;
	}

	.scroll-text {
		color: #666;
	}

	button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
</style>
