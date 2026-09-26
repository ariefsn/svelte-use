<script lang="ts">
	import { untrack } from 'svelte';
	import { usePageLeave } from '$lib';

	const hasLeft = usePageLeave();
	let leaveCount = $state(0);

	// `leaveCount++` reads and writes the same $state, so it must be untracked —
	// otherwise the effect depends on what it writes and loops until Svelte
	// throws effect_update_depth_exceeded.
	$effect(() => {
		if (hasLeft()) {
			untrack(() => {
				leaveCount++;
			});
		}
	});
</script>

<div class="demo-root">
	<div class="status" class:left={hasLeft()}>
		<span class="dot"></span>
		<span>{hasLeft() ? 'Cursor left the viewport' : 'Cursor inside viewport'}</span>
	</div>

	<div class="kv">
		<span class="key">leave count</span>
		<span class="val">{leaveCount}</span>
	</div>

	<p class="hint">Move your cursor out of the browser window to trigger the state change.</p>
</div>

<style>
	.demo-root {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.status {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		border: 1px solid #166534;
		background: #0f2e1f;
		color: #4ade80;
		font-size: 0.9rem;
		font-weight: 500;
		width: fit-content;
		transition: all 0.2s;
	}
	.status.left {
		border-color: #92400e;
		background: #2a1e0f;
		color: #fbbf24;
	}
	.dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: #4ade80;
		flex-shrink: 0;
		transition: background 0.2s;
	}
	.left .dot {
		background: #fbbf24;
	}
	.kv {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.88rem;
	}
	.key {
		font-family: monospace;
		color: #666;
	}
	.val {
		font-family: monospace;
		color: #a78bfa;
		font-weight: 600;
	}
	.hint {
		margin: 0;
		font-size: 0.82rem;
		color: #666;
		font-style: italic;
	}
</style>
