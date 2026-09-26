<script lang="ts">
	import { useUrlSearchParams } from '$lib';

	const params = useUrlSearchParams('history', { debounce: 300 });

	const query = $derived((params.get('q') as string | undefined) ?? '');
	const page = $derived((params.get('page') as string | undefined) ?? '1');
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">q</span>
		<input
			type="text"
			value={query}
			placeholder="type to update the URL"
			oninput={(event) => params.set('q', event.currentTarget.value)}
		/>
	</div>

	<div class="row">
		<span class="label">page</span>
		<div class="actions">
			{#each ['1', '2', '3'] as candidate (candidate)}
				<button class:active={page === candidate} onclick={() => params.set('page', candidate)}>
					{candidate}
				</button>
			{/each}
		</div>
	</div>

	<div class="row">
		<span class="label">query()</span>
		<span class="value accent">{params.query() || '(empty)'}</span>
	</div>

	<div class="actions">
		<button onclick={() => params.remove('q')}>remove q</button>
		<button onclick={() => params.clear()}>clear</button>
	</div>

	<p class="hint">
		Watch the address bar, then use browser back and forward — navigation flows back into the
		parameters. Typing is debounced by 300ms so a burst of keystrokes produces one URL write. The
		reactive value updates immediately regardless.
	</p>
</div>

<style>
	.row input[type='text'] {
		flex: 1;
	}
</style>
