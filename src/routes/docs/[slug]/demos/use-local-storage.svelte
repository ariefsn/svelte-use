<script lang="ts">
	import { useLocalStorage } from '$lib';

	const theme = useLocalStorage<'light' | 'dark'>('demo-ls-theme', 'light');
	const count = useLocalStorage<number>('demo-ls-count', 0);
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">theme</span>
		<span class="value">{theme.value}</span>
		<div class="actions">
			<button onclick={() => theme.set('light')}>Light</button>
			<button onclick={() => theme.set('dark')}>Dark</button>
		</div>
	</div>

	<div class="row">
		<span class="label">count</span>
		<span class="value">{count.value}</span>
		<div class="actions">
			<button onclick={() => count.set(count.value + 1)}>+1</button>
			<button onclick={() => count.set(count.value - 1)}>-1</button>
			<button onclick={() => count.set(0)}>Reset</button>
		</div>
	</div>

	<p class="hint">Refresh the page — values survive.</p>
</div>
