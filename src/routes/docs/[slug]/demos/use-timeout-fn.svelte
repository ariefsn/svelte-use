<script lang="ts">
	import { useTimeoutFn } from '$lib/time/useTimeoutFn.svelte.js';

	let status = $state<'idle' | 'waiting' | 'done'>('idle');

	const { start, stop, isPending } = useTimeoutFn(() => {
		status = 'done';
	}, 2000);

	function arm() {
		status = 'waiting';
		start();
	}

	function cancel() {
		stop();
		status = 'idle';
	}
</script>

<div class="demo-wrap">
	<div class="status-badge status-{status}">{status}</div>

	<div class="row">
		<span class="label">pending</span>
		<span class="value accent">{isPending()}</span>
	</div>

	<div class="actions">
		<button onclick={arm} disabled={isPending()}>start()</button>
		<button onclick={cancel} disabled={!isPending()}>stop()</button>
	</div>

	<p class="hint">Does not start automatically · call start() to arm · fires after 2s</p>
</div>

<style>
	.status-badge {
		font-size: 1.4rem;
		font-weight: 700;
		font-family: monospace;
		padding: 0.4rem 1rem;
		border-radius: 8px;
		display: inline-block;
		align-self: flex-start;
	}

	.status-idle {
		background: #1e1e1e;
		color: #555;
	}
	.status-waiting {
		background: #1a1630;
		color: #a78bfa;
	}
	.status-done {
		background: #142a14;
		color: #86efac;
	}
</style>
