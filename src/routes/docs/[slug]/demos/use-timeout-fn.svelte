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
	<div
		class="inline-block self-start rounded-lg px-4 py-1.5 font-mono text-[1.4rem] font-bold {status ===
		'waiting'
			? 'bg-accent-bg text-accent'
			: status === 'done'
				? 'bg-success-bg text-success'
				: 'bg-surface text-text-faint'}"
	>
		{status}
	</div>

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
