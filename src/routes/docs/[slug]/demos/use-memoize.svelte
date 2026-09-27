<script lang="ts">
	import { useMemoize } from '$lib/performance/useMemoize.svelte.js';

	let calls = $state(0);
	let input = $state(35);
	let result = $state<number | null>(null);
	let elapsed = $state<number | null>(null);

	// Deliberately slow and pure — the ideal shape for memoisation
	const fib = useMemoize(
		(n: number) => {
			calls += 1;
			const step = (k: number): number => (k < 2 ? k : step(k - 1) + step(k - 2));
			return step(n);
		},
		{ max: 5 }
	);

	function compute() {
		const started = performance.now();
		result = fib(Math.min(Math.max(input, 1), 38));
		elapsed = Math.round(performance.now() - started);
	}
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">fib(n)</span>
		<input type="number" bind:value={input} min="1" max="38" />
	</div>

	<div class="actions">
		<button onclick={compute}>Compute</button>
		<button onclick={fib.clear}>Clear Cache</button>
	</div>

	<div class="row">
		<span class="label">result</span>
		<span class="value accent">{result ?? '—'}</span>
	</div>
	<div class="row">
		<span class="label">took</span>
		<span class="value accent">{elapsed === null ? '—' : `${elapsed}ms`}</span>
	</div>
	<div class="row">
		<span class="label">actual calls</span>
		<span class="value accent">{calls}</span>
	</div>
	<div class="row">
		<span class="label">cached (max 5)</span>
		<span class="value accent">{fib.size()}</span>
	</div>

	<p class="hint">
		Compute the same n twice: the second is instant and the call count does not move. Cache more
		than five values and the least recently used one is evicted.
	</p>
</div>
