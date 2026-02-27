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

<div class="demo-root">
	<button onclick={() => (open = !open)}>
		{open ? 'Close menu' : 'Open menu'}
	</button>

	{#if open}
		<div bind:this={menu} class="menu">
			<p>Click outside this box to close it.</p>
			<button onclick={() => (open = false)}>Close from inside</button>
		</div>
	{/if}

	{#if log.length > 0}
		<ul class="log">
			{#each log as entry}
				<li>{entry}</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.demo-root {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		position: relative;
	}
	button {
		background: #2a2a2a;
		color: #e8e8e8;
		border: 1px solid #3a3a3a;
		border-radius: 6px;
		padding: 0.35rem 0.75rem;
		font-size: 0.85rem;
		cursor: pointer;
		width: fit-content;
	}
	button:hover {
		background: #3a3a3a;
	}
	.menu {
		background: #1e1e1e;
		border: 1px solid #a78bfa;
		border-radius: 8px;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		width: fit-content;
	}
	.menu p {
		margin: 0;
		font-size: 0.88rem;
		color: #aaa;
	}
	.log {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}
	.log li {
		font-size: 0.8rem;
		color: #666;
		font-family: monospace;
	}
</style>
