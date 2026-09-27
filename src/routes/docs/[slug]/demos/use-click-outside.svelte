<script lang="ts">
	import { useClickOutside } from '$lib';

	let open = $state(false);
	let menu: HTMLDivElement | undefined = $state();
	let log = $state<string[]>([]);

	useClickOutside(
		() => menu ?? null,
		() => {
			if (open) {
				open = false;
				log = [`Closed at ${new Date().toLocaleTimeString()}`, ...log].slice(0, 5);
			}
		}
	);
</script>

<div class="demo-wrap relative">
	<button onclick={() => (open = !open)}>
		{open ? 'Close menu' : 'Open menu'}
	</button>

	{#if open}
		<div
			bind:this={menu}
			class="bg-surface border-accent flex w-fit flex-col gap-2 rounded-lg border p-4"
		>
			<p>Click outside this box to close it.</p>
			<button onclick={() => (open = false)}>Close from inside</button>
		</div>
	{/if}

	{#if log.length > 0}
		<ul class="m-0 flex list-none flex-col gap-0.5 p-0">
			{#each log as entry, i (i)}
				<li>{entry}</li>
			{/each}
		</ul>
	{/if}
</div>
