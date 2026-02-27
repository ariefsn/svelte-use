<script lang="ts">
	import { useSorted } from '$lib/state/useSorted.svelte.js';

	let raw = $state([5, 2, 8, 1, 9, 3]);
	const sorted = useSorted(() => raw);
	const desc = useSorted(
		() => raw,
		(a, b) => b - a
	);

	function addRandom() {
		raw = [...raw, Math.floor(Math.random() * 20)];
	}
	function reset() {
		raw = [5, 2, 8, 1, 9, 3];
	}
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">source</span>
		<span class="value">[{raw.join(', ')}]</span>
	</div>
	<div class="row">
		<span class="label">sorted asc</span>
		<span class="value accent">[{sorted().join(', ')}]</span>
	</div>
	<div class="row">
		<span class="label">sorted desc</span>
		<span class="value accent">[{desc().join(', ')}]</span>
	</div>
	<div class="actions">
		<button onclick={addRandom}>Add random</button>
		<button onclick={reset}>Reset</button>
	</div>
</div>
