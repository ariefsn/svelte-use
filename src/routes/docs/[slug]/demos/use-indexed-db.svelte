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

<div class="demo-wrap gap-2.5">
	<div class="flex gap-2">
		<input
			type="text"
			bind:value={input}
			placeholder="New note…"
			onkeydown={(e) => e.key === 'Enter' && add()}
		/>
		<button onclick={add}>Add</button>
	</div>

	{#if db.loading}
		<p class="text-text-muted text-[0.85rem]">Loading…</p>
	{:else if db.error}
		<p class="text-danger text-[0.85rem]">Error: {db.error.message}</p>
	{:else if db.items.length === 0}
		<p class="text-text-muted text-[0.85rem]">No notes yet.</p>
	{:else}
		<ul class="m-0 flex list-none flex-col gap-1.5 p-0">
			{#each db.items as note (note.id)}
				<li class="flex items-center gap-2">
					<button
						class="h-6 w-6 shrink-0 rounded-full p-0 text-[0.75rem] {note.done
							? 'bg-success-bg! text-success! border-success-border!'
							: ''}"
						onclick={() => db.update({ ...note, done: !note.done })}
					>
						{note.done ? '✓' : '○'}
					</button>
					<span class="flex-1 text-[0.88rem] {note.done ? 'text-text-faint line-through' : ''}">
						{note.text}
					</span>
					<button
						class="text-text-muted hover:text-danger hover:bg-danger-bg! hover:border-danger-border! h-6 w-6 shrink-0 p-0 text-base"
						onclick={() => db.remove(note.id!)}>×</button
					>
				</li>
			{/each}
		</ul>
	{/if}

	<div class="flex flex-wrap items-center justify-between gap-2 text-[0.8rem]">
		<span class="muted">{db.items.length} record{db.items.length === 1 ? '' : 's'}</span>
		<button onclick={() => db.clear()}>Clear all</button>
	</div>
</div>
