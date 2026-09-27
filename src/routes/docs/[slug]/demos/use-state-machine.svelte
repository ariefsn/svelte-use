<script lang="ts">
	import { useStateMachine } from '$lib/state/useStateMachine.svelte.js';

	const ACTIONS = ['FETCH', 'RESOLVE', 'REJECT', 'RETRY'] as const;

	const machine = useStateMachine({
		initial: 'idle',
		states: {
			idle: { on: { FETCH: 'loading' } },
			loading: { on: { RESOLVE: 'success', REJECT: 'failure' } },
			success: { on: { FETCH: 'loading' } },
			failure: { on: { RETRY: 'loading' } }
		}
	});
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">state</span>
		<span class="value accent">{machine.state()}</span>
	</div>

	<div class="actions">
		{#each ACTIONS as action (action)}
			<button onclick={() => machine.send(action)} disabled={!machine.can(action)}>
				{action}
			</button>
		{/each}
		<button onclick={machine.reset}>Reset</button>
	</div>

	<div class="row">
		<span class="label">history</span>
		<span class="value accent">{machine.history().join(' → ')}</span>
	</div>

	<p class="hint">
		Buttons disable themselves via <span class="value accent">can()</span> — the machine knows which
		actions are legal from here. Sending an illegal one is a no-op returning
		<span class="value accent">false</span>, never a throw, so a stray click cannot break anything.
	</p>
</div>
