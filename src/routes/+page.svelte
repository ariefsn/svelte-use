<script lang="ts">
	import {
		useCounter,
		useDebounce,
		useIndexedDB,
		useLocalStorage,
		usePrevious,
		useToggle
	} from '$lib';

	// --- useToggle ---
	const toggle = useToggle();

	// --- useCounter ---
	const counter = useCounter(0);

	// --- usePrevious ---
	let prevSource = $state(0);
	const previous = usePrevious(() => prevSource);

	// --- useDebounce ---
	let query = $state('');
	const debouncedQuery = useDebounce(() => query, 500);

	// --- useLocalStorage ---
	const theme = useLocalStorage<'light' | 'dark'>('demo-theme', 'light');

	// --- useIndexedDB ---
	interface Note {
		id?: number;
		text: string;
		done: boolean;
	}
	const db = useIndexedDB<Note>('svelte-use-demo', 'notes');
	let noteInput = $state('');
	let filterText = $state('');
	let queryResults = $state<Note[]>([]);

	const visibleNotes = $derived(
		filterText.trim()
			? db.items.filter((n) => n.text.toLowerCase().includes(filterText.toLowerCase()))
			: db.items
	);

	async function addNote() {
		const text = noteInput.trim();
		if (!text) return;
		await db.add({ text, done: false });
		noteInput = '';
	}

	async function toggleNote(note: Note) {
		await db.update({ ...note, done: !note.done });
	}

	async function removeNote(id: number) {
		await db.remove(id);
	}

	async function runQuery() {
		queryResults = await db.query((n) => !n.done);
	}
</script>

<main>
	<header>
		<h1>Svelte Use</h1>
		<p>
			Svelte 5 runes-first utility library. No stores, no external deps, SSR-safe, tree-shakable.
		</p>
	</header>

	<div class="grid">
		<!-- useToggle -->
		<section class="card">
			<h2>useToggle</h2>
			<p class="description">Reactive boolean toggle.</p>

			<div class="demo">
				<span class="badge" class:on={toggle.value}>{toggle.value ? 'ON' : 'OFF'}</span>
				<div class="actions">
					<button onclick={() => toggle.toggle()}>Toggle</button>
					<button onclick={() => toggle.set(true)}>Set true</button>
					<button onclick={() => toggle.set(false)}>Set false</button>
				</div>
			</div>

			<pre><code
					>{`import { useToggle } from '@ariefsn/svelte-use';

const { value, toggle, set } = useToggle();
toggle();     // value → true
set(false);   // value → false`}</code
				></pre>
		</section>

		<!-- useCounter -->
		<section class="card">
			<h2>useCounter</h2>
			<p class="description">Reactive counter with increment, decrement and reset.</p>

			<div class="demo">
				<span class="count">{counter.value}</span>
				<div class="actions">
					<button onclick={() => counter.inc()}>+1</button>
					<button onclick={() => counter.inc(5)}>+5</button>
					<button onclick={() => counter.dec()}>−1</button>
					<button onclick={() => counter.dec(5)}>−5</button>
					<button onclick={() => counter.reset()}>Reset</button>
				</div>
			</div>

			<pre><code
					>{`import { useCounter } from '@ariefsn/svelte-use';

const { value, inc, dec, reset } = useCounter(0);
inc();     // value → 1
inc(5);    // value → 6
dec(3);    // value → 3
reset();   // value → 0`}</code
				></pre>
		</section>

		<!-- usePrevious -->
		<section class="card">
			<h2>usePrevious</h2>
			<p class="description">
				Tracks the previous value of any reactive getter. Returns <code>undefined</code> until the first
				change.
			</p>

			<div class="demo">
				<div class="kv-row">
					<span class="label">current</span>
					<span class="value">{prevSource}</span>
				</div>
				<div class="kv-row">
					<span class="label">previous</span>
					<span class="value muted">{previous() ?? '—'}</span>
				</div>
				<div class="actions">
					<button onclick={() => prevSource++}>Increment source</button>
					<button onclick={() => (prevSource = 0)}>Reset to 0</button>
				</div>
			</div>

			<pre><code
					>{`import { usePrevious } from '@ariefsn/svelte-use';

let count = $state(0);
const prev = usePrevious(() => count);
// prev() → undefined  (before first change)
count = 1;
// prev() → 0
count = 2;
// prev() → 1`}</code
				></pre>
		</section>

		<!-- useDebounce -->
		<section class="card">
			<h2>useDebounce</h2>
			<p class="description">
				Delays a reactive value until the source stops changing for the given duration (500 ms
				here).
			</p>

			<div class="demo">
				<input type="text" placeholder="Type something…" bind:value={query} />
				<div class="kv-row">
					<span class="label">raw</span>
					<span class="value">{query || '—'}</span>
				</div>
				<div class="kv-row">
					<span class="label">debounced</span>
					<span class="value muted">{debouncedQuery() || '—'}</span>
				</div>
			</div>

			<pre><code
					>{`import { useDebounce } from '@ariefsn/svelte-use';

let query = $state('');
const debounced = useDebounce(() => query, 500);
// debounced() updates only after 500 ms of inactivity`}</code
				></pre>
		</section>

		<!-- useLocalStorage -->
		<section class="card">
			<h2>useLocalStorage</h2>
			<p class="description">
				Reactive <code>localStorage</code> with SSR safety. Value persists across page refreshes.
			</p>

			<div class="demo">
				<div class="kv-row">
					<span class="label">stored theme</span>
					<span class="value">{theme.value}</span>
				</div>
				<div class="actions">
					<button onclick={() => theme.set('light')}>Light</button>
					<button onclick={() => theme.set('dark')}>Dark</button>
				</div>
				<p class="hint">Refresh the page — the value survives.</p>
			</div>

			<pre><code
					>{`import { useLocalStorage } from '@ariefsn/svelte-use';

const theme = useLocalStorage('theme', 'light');
theme.set('dark');  // persists to localStorage
theme.value;        // 'dark'`}</code
				></pre>
		</section>

		<!-- useIndexedDB -->
		<section class="card">
			<h2>useIndexedDB</h2>
			<p class="description">
				Reactive IndexedDB with full CRUD, querying, and filtering. Data persists across sessions.
			</p>

			<div class="demo">
				<div class="idb-row">
					<input
						type="text"
						placeholder="New note…"
						bind:value={noteInput}
						onkeydown={(e) => e.key === 'Enter' && addNote()}
					/>
					<button onclick={addNote}>Add</button>
				</div>

				<input type="text" placeholder="Filter notes…" bind:value={filterText} />

				{#if db.loading}
					<span class="muted">Loading…</span>
				{:else if db.error}
					<span style="color:#f87171">Error: {db.error.message}</span>
				{:else if visibleNotes.length === 0}
					<span class="muted">No notes yet.</span>
				{:else}
					<ul class="note-list">
						{#each visibleNotes as note (note.id)}
							<li class="note-item">
								<button
									class="toggle-btn"
									class:done={note.done}
									onclick={() => toggleNote(note)}
									title="Toggle done"
								>
									{note.done ? '✓' : '○'}
								</button>
								<span class="note-text" class:done={note.done}>{note.text}</span>
								<button class="remove-btn" onclick={() => removeNote(note.id!)}>×</button>
							</li>
						{/each}
					</ul>
				{/if}

				<div class="idb-footer">
					<span class="muted">{db.items.length} total · {visibleNotes.length} shown</span>
					<div class="actions">
						<button onclick={runQuery}>Query pending</button>
						<button onclick={() => db.clear()}>Clear all</button>
					</div>
				</div>

				{#if queryResults.length > 0}
					<div class="kv-row">
						<span class="label">pending</span>
						<span class="value muted">{queryResults.map((n) => n.text).join(', ')}</span>
					</div>
				{/if}
			</div>

			<pre><code
					>{`import { useIndexedDB } from '@ariefsn/svelte-use';

interface Note { id?: number; text: string; done: boolean }
const db = useIndexedDB<Note>('my-app', 'notes');

await db.add({ text: 'Buy milk', done: false });
db.items;                              // reactive T[]
await db.update({ id: 1, done: true });
await db.remove(1);
const pending = await db.query(n => !n.done);`}</code
				></pre>
		</section>
	</div>
</main>

<style>
	:global(body) {
		font-family: system-ui, sans-serif;
		background: #0f0f0f;
		color: #e8e8e8;
		margin: 0;
		padding: 0;
	}

	main {
		max-width: 960px;
		margin: 0 auto;
		padding: 3rem 1.5rem;
	}

	header {
		margin-bottom: 3rem;
		border-bottom: 1px solid #2a2a2a;
		padding-bottom: 2rem;
	}

	header h1 {
		font-size: 2.5rem;
		font-weight: 700;
		margin: 0 0 0.5rem;
		letter-spacing: -0.03em;
	}

	header p {
		color: #888;
		margin: 0;
		font-size: 1rem;
	}

	.grid {
		display: grid;
		gap: 1.5rem;
		grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
	}

	.card {
		background: #161616;
		border: 1px solid #2a2a2a;
		border-radius: 10px;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.card h2 {
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0;
		font-family: monospace;
		color: #a78bfa;
	}

	.description {
		margin: 0;
		color: #aaa;
		font-size: 0.9rem;
		line-height: 1.5;
	}

	.demo {
		background: #1e1e1e;
		border: 1px solid #2e2e2e;
		border-radius: 8px;
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	button {
		background: #2a2a2a;
		color: #e8e8e8;
		border: 1px solid #3a3a3a;
		border-radius: 6px;
		padding: 0.35rem 0.75rem;
		font-size: 0.85rem;
		cursor: pointer;
		transition: background 0.15s;
	}

	button:hover {
		background: #3a3a3a;
	}

	.badge {
		display: inline-block;
		padding: 0.3rem 0.9rem;
		border-radius: 999px;
		font-size: 0.85rem;
		font-weight: 600;
		background: #2a2a2a;
		color: #888;
		border: 1px solid #3a3a3a;
		width: fit-content;
		transition: all 0.15s;
	}

	.badge.on {
		background: #1a3a1a;
		color: #4ade80;
		border-color: #166534;
	}

	.count {
		font-size: 2.5rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		line-height: 1;
	}

	.kv-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.9rem;
	}

	.label {
		color: #666;
		font-family: monospace;
		min-width: 70px;
	}

	.value {
		font-family: monospace;
		font-weight: 500;
	}

	.muted {
		color: #888;
	}

	input[type='text'] {
		width: 100%;
		background: #2a2a2a;
		border: 1px solid #3a3a3a;
		border-radius: 6px;
		padding: 0.4rem 0.75rem;
		color: #e8e8e8;
		font-size: 0.9rem;
		outline: none;
		box-sizing: border-box;
	}

	input[type='text']:focus {
		border-color: #a78bfa;
	}

	.hint {
		margin: 0;
		color: #555;
		font-size: 0.8rem;
		font-style: italic;
	}

	.idb-row {
		display: flex;
		gap: 0.5rem;
	}

	.idb-row input {
		flex: 1;
	}

	.idb-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 0.5rem;
		font-size: 0.8rem;
	}

	.note-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.note-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.note-text {
		flex: 1;
		font-size: 0.9rem;
	}

	.note-text.done {
		text-decoration: line-through;
		color: #555;
	}

	.toggle-btn {
		width: 1.75rem;
		height: 1.75rem;
		padding: 0;
		font-size: 0.8rem;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.toggle-btn.done {
		background: #1a3a1a;
		color: #4ade80;
		border-color: #166534;
	}

	.remove-btn {
		width: 1.75rem;
		height: 1.75rem;
		padding: 0;
		font-size: 1rem;
		color: #888;
		flex-shrink: 0;
	}

	.remove-btn:hover {
		color: #f87171;
		background: #2a1a1a;
		border-color: #7f1d1d;
	}

	pre {
		background: #111;
		border: 1px solid #222;
		border-radius: 8px;
		padding: 1rem;
		overflow-x: auto;
		margin: 0;
	}

	code {
		font-family: 'Fira Code', 'Cascadia Code', monospace;
		font-size: 0.8rem;
		color: #a78bfa;
		white-space: pre;
	}

	.description code {
		background: #2a2a2a;
		padding: 0.1rem 0.35rem;
		border-radius: 4px;
		font-size: 0.85em;
		color: #a78bfa;
	}
</style>
