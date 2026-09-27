<script lang="ts">
	import { useWebWorkerFn } from '$lib/performance/useWebWorkerFn.svelte.js';

	// Self-contained: it touches only its argument and built-ins. Anything from
	// this module's scope would be undefined inside the worker.
	const primes = useWebWorkerFn((limit: number) => {
		const sieve = new Uint8Array(limit + 1);
		let count = 0;
		for (let n = 2; n <= limit; n++) {
			if (sieve[n]) continue;
			count++;
			for (let m = n * n; m <= limit; m += n) sieve[m] = 1;
		}
		return count;
	});

	// The sieve allocates one byte per number, so the cap keeps a typo from
	// asking the worker for a multi-gigabyte array.
	const MAX_LIMIT = 100_000_000;

	let limit = $state(5_000_000);
	let count = $state<number | null>(null);
	let elapsed = $state<number | null>(null);
	let failure = $state<string | null>(null);

	async function compute() {
		count = null;
		failure = null;
		const started = performance.now();
		try {
			count = await primes.run(Math.min(Math.max(limit, 1000), MAX_LIMIT));
			elapsed = Math.round(performance.now() - started);
		} catch (error) {
			failure = error instanceof Error ? error.message : String(error);
		}
	}
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">supported</span>
		<span class="value accent">{primes.isSupported()}</span>
	</div>
	<div class="row">
		<span class="label">status</span>
		<span class="value accent">{primes.status()}</span>
	</div>
	<div class="row">
		<span class="label">primes below</span>
		<input type="number" bind:value={limit} min="1000" max={MAX_LIMIT} step="1000000" />
	</div>

	<div class="actions">
		<button onclick={compute} disabled={!primes.isSupported() || primes.status() === 'RUNNING'}>
			Compute
		</button>
		<button onclick={primes.terminate} disabled={primes.status() !== 'RUNNING'}>Terminate</button>
	</div>

	{#if count !== null}
		<div class="row">
			<span class="label">found</span>
			<span class="value accent">{count.toLocaleString()} in {elapsed}ms</span>
		</div>
	{/if}
	{#if failure}
		<div class="row">
			<span class="label">error</span>
			<span class="value">{failure}</span>
		</div>
	{/if}

	<p class="hint">
		The sieve runs off the main thread, so this stays responsive while it works — try scrolling
		during a large run. Terminate mid-run rejects the pending promise and leaves the status on
		<span class="value accent">TERMINATED</span>, so you can run it again straight away. Capped at
		{MAX_LIMIT.toLocaleString()}, since the sieve allocates a byte per number.
	</p>
</div>
