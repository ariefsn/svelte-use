<script lang="ts">
	import { useCycleList } from '$lib/state/useCycleList.svelte.js';

	const themes = useCycleList(['light', 'dark', 'system', 'high-contrast']);
	const dirs = useCycleList(['North', 'East', 'South', 'West']);
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">theme</span>
		<span class="value accent">{themes.state()}</span>
		<span class="muted">({themes.index()} / {3})</span>
	</div>
	<div class="actions">
		<button onclick={() => themes.prev()}>← Prev</button>
		<button onclick={() => themes.next()}>Next →</button>
	</div>

	<div class="divider"></div>

	<div class="row">
		<span class="label">direction</span>
		<span class="value accent">{dirs.state()}</span>
	</div>
	<div class="actions">
		{#each ['North', 'East', 'South', 'West'] as d, i}
			<button class:active={dirs.index() === i} onclick={() => dirs.setIndex(i)}>{d}</button>
		{/each}
	</div>
</div>
