<script lang="ts">
	import { useIndexedDB } from '$lib';

	interface Note {
		id?: number;
		text: string;
		done: boolean;
	}

	const db = useIndexedDB<Note>('demo-idb', 'notes');
	let input = $state('');

	async function add() {
		const text = input.trim();
		if (!text) return;
		await db.add({ text, done: false });
		input = '';
	}
</script>

<div class="demo-root">
	<div class="add-row">
		<input
			bind:value={input}
			placeholder="New note…"
			onkeydown={(e) => e.key === 'Enter' && add()}
		/>
		<button onclick={add}>Add</button>
	</div>

	{#if db.loading}
		<p class="muted">Loading…</p>
	{:else if db.error}
		<p class="error">Error: {db.error.message}</p>
	{:else if db.items.length === 0}
		<p class="muted">No notes yet.</p>
	{:else}
		<ul class="list">
			{#each db.items as note (note.id)}
				<li class="item">
					<button
						class="toggle"
						class:done={note.done}
						onclick={() => db.update({ ...note, done: !note.done })}
					>
						{note.done ? '✓' : '○'}
					</button>
					<span class="text" class:done={note.done}>{note.text}</span>
					<button class="remove" onclick={() => db.remove(note.id!)}>×</button>
				</li>
			{/each}
		</ul>
	{/if}

	<div class="footer">
		<span class="muted">{db.items.length} record{db.items.length === 1 ? '' : 's'}</span>
		<button onclick={() => db.clear()}>Clear all</button>
	</div>
</div>

<style>
	.demo-root {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
	}
	.add-row {
		display: flex;
		gap: 0.5rem;
	}
	input {
		flex: 1;
		background: #2a2a2a;
		border: 1px solid #3a3a3a;
		border-radius: 6px;
		padding: 0.35rem 0.65rem;
		color: #e8e8e8;
		font-size: 0.88rem;
		outline: none;
	}
	input:focus {
		border-color: #a78bfa;
	}
	button {
		background: #2a2a2a;
		color: #e8e8e8;
		border: 1px solid #3a3a3a;
		border-radius: 6px;
		padding: 0.3rem 0.65rem;
		font-size: 0.82rem;
		cursor: pointer;
	}
	button:hover {
		background: #3a3a3a;
	}
	.list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}
	.item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.toggle {
		width: 1.6rem;
		height: 1.6rem;
		padding: 0;
		border-radius: 50%;
		font-size: 0.75rem;
		flex-shrink: 0;
	}
	.toggle.done {
		background: #1a3a1a;
		color: #4ade80;
		border-color: #166534;
	}
	.text {
		flex: 1;
		font-size: 0.88rem;
	}
	.text.done {
		text-decoration: line-through;
		color: #555;
	}
	.remove {
		width: 1.6rem;
		height: 1.6rem;
		padding: 0;
		font-size: 1rem;
		color: #666;
		flex-shrink: 0;
	}
	.remove:hover {
		color: #f87171;
		background: #2a1a1a;
		border-color: #7f1d1d;
	}
	.footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 0.5rem;
		font-size: 0.8rem;
	}
	.muted {
		color: #666;
		font-size: 0.85rem;
	}
	.error {
		color: #f87171;
		font-size: 0.85rem;
	}
</style>
