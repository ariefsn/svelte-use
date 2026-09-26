<script lang="ts">
	import { useUntil } from '$lib';

	let count = $state(0);
	let tags = $state<string[]>([]);
	let status = $state('pending');
	let log = $state<string[]>([]);
	let waiting = $state(false);

	async function waitForFive() {
		waiting = true;
		log = [...log, 'awaiting count === 5…'];
		try {
			const value = await useUntil(() => count).toBe(5, { timeout: 10_000 });
			log = [...log, `resolved with ${value}`];
		} catch (err) {
			log = [...log, (err as Error).message];
		} finally {
			waiting = false;
		}
	}

	async function waitForContains() {
		waiting = true;
		log = [...log, "awaiting tags to contain 'ready'…"];
		try {
			await useUntil(() => tags).toContain('ready', { timeout: 10_000 });
			log = [...log, "resolved — 'ready' present"];
		} catch (err) {
			log = [...log, (err as Error).message];
		} finally {
			waiting = false;
		}
	}

	async function waitNotPending() {
		waiting = true;
		log = [...log, "awaiting status !== 'pending'…"];
		try {
			const value = await useUntil(() => status).not.toBe('pending', { timeout: 10_000 });
			log = [...log, `resolved with '${value}'`];
		} catch (err) {
			log = [...log, (err as Error).message];
		} finally {
			waiting = false;
		}
	}

	async function waitWithTimeout() {
		waiting = true;
		log = [...log, 'awaiting count === 99 (1s timeout)…'];
		try {
			await useUntil(() => count).toBe(99, { timeout: 1000 });
		} catch (err) {
			log = [...log, (err as Error).message];
		} finally {
			waiting = false;
		}
	}
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">count</span>
		<span class="value accent">{count}</span>
	</div>

	<div class="row">
		<span class="label">tags</span>
		<span class="value accent">[{tags.join(', ')}]</span>
	</div>
	<div class="row">
		<span class="label">status</span>
		<span class="value accent">{status}</span>
	</div>

	<div class="actions">
		<button onclick={() => count++}>count++</button>
		<button onclick={() => (tags = [...tags, tags.length ? 'ready' : 'loading'])}>push tag</button>
		<button onclick={() => (status = 'done')}>status = done</button>
	</div>

	<div class="actions">
		<button onclick={waitForFive} disabled={waiting}>toBe(5)</button>
		<button onclick={waitForContains} disabled={waiting}>toContain('ready')</button>
		<button onclick={waitNotPending} disabled={waiting}>not.toBe('pending')</button>
		<button onclick={waitWithTimeout} disabled={waiting}>timeout</button>
		<button onclick={() => ((count = 0), (tags = []), (status = 'pending'), (log = []))}>
			reset
		</button>
	</div>

	<div class="log">
		{#if log.length === 0}
			<span class="empty">Start a wait, then increment the count.</span>
		{:else}
			{#each log as line, i (i)}
				<div class="log-line">{line}</div>
			{/each}
		{/if}
	</div>
	<p class="hint">
		<code>useUntil</code> turns a reactive change into a promise you can <code>await</code> in ordinary
		async code.
	</p>
</div>

<style>
	.log {
		background: #0d0d0d;
		border: 1px solid #1e1e1e;
		border-radius: 8px;
		padding: 0.6rem 0.75rem;
		font-family: monospace;
		font-size: 0.82rem;
		line-height: 1.7;
		min-height: 70px;
		color: #aaa;
	}
	.empty {
		color: #555;
		font-style: italic;
	}
	.log-line {
		color: #a78bfa;
	}
</style>
