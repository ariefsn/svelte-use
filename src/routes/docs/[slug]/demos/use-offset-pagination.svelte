<script lang="ts">
	import { useOffsetPagination } from '$lib/state/useOffsetPagination.svelte.js';

	let total = $state(95);
	let size = $state(10);

	const pagination = useOffsetPagination({
		total: () => total,
		pageSize: () => size
	});

	const visible = $derived(
		Array.from(
			{ length: Math.min(size, total - pagination.offset()) },
			(_, i) => pagination.offset() + i + 1
		)
	);
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">total items</span>
		<input type="number" bind:value={total} min="0" max="500" />
	</div>
	<div class="row">
		<span class="label">page size</span>
		<input type="number" bind:value={size} min="1" max="50" />
	</div>

	<div class="divider"></div>

	<div class="row">
		<span class="label">page</span>
		<span class="value accent">{pagination.page()} / {pagination.pageCount()}</span>
	</div>
	<div class="row">
		<span class="label">offset</span>
		<span class="value accent">{pagination.offset()}</span>
	</div>
	<div class="row">
		<span class="label">showing</span>
		<span class="value accent">
			{visible.length > 0 ? `#${visible[0]}–#${visible.at(-1)}` : 'nothing'}
		</span>
	</div>

	<div class="actions">
		<button onclick={pagination.first} disabled={pagination.isFirstPage()}>First</button>
		<button onclick={pagination.prev} disabled={pagination.isFirstPage()}>Prev</button>
		<button onclick={pagination.next} disabled={pagination.isLastPage()}>Next</button>
		<button onclick={pagination.last} disabled={pagination.isLastPage()}>Last</button>
	</div>

	<p class="hint">
		Go to a late page, then drop <span class="value accent">total items</span> — the page corrects itself
		instantly, with no out-of-range render. Put the total back and your original page returns, because
		the request is stored unclamped.
	</p>
</div>
