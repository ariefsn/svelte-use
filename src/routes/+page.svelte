<script lang="ts">
	import { sidebar } from '$lib/docs/sidebar.js';
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

	const features = [
		{ icon: '⚡', label: 'Svelte 5 Runes', desc: 'Built for $state, $derived, $effect — no stores' },
		{ icon: '🌲', label: 'Tree-shakable', desc: 'Import only what you use' },
		{ icon: '🔒', label: 'Fully typed', desc: 'First-class TypeScript, no any' },
		{ icon: '🌐', label: 'SSR safe', desc: 'All browser APIs are guarded' },
		{ icon: '📦', label: 'Zero deps', desc: 'No runtime dependencies' },
		{ icon: '🧹', label: 'Auto cleanup', desc: 'Listeners removed on component destroy' },
		{ icon: '🎞️', label: 'Animation', desc: 'useAnimate, useParallax, useTransition' },
		{ icon: '🔌', label: 'Async & WebSocket', desc: 'useFetch, useWebSocket' },
		{ icon: '⏱️', label: 'Time utilities', desc: 'useInterval, useTimeout, useNow, useTimestamp…' },
		{ icon: '🖱️', label: 'Pointer & Drag', desc: 'useMouse, useDraggable, useDropZone…' },
		{ icon: '📡', label: 'Sensors', desc: 'useGeolocation, useNetwork, useIdle, useBreakpoints…' },
		{ icon: '💾', label: 'Storage', desc: 'useLocalStorage, useIndexedDB, useSessionStorage…' }
	];

	// Total composable count from sidebar
	const totalComposables = sidebar.reduce((acc, g) => acc + g.items.length, 0);
</script>

<div class="page">
	<!-- ─── Hero ─── -->
	<header class="hero">
		<div class="hero-top">
			<img src="/logo.svg" alt="svelte-use logo" class="hero-logo" width="80" height="80" />
			<div class="hero-badges">
				<span class="hero-badge">@ariefsn/svelte-use</span>
				<a
					href="https://www.npmjs.com/package/@ariefsn/svelte-use"
					class="hero-badge hero-badge-link"
					target="_blank"
					rel="noopener"
					aria-label="View on npm"
				>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M0 0v24h24V0H0zm19.2 19.2H4.8V4.8h14.4v14.4z"/><path d="M7.2 7.2h9.6v9.6h-2.4V9.6H12v7.2H7.2z"/></svg>
					npm
				</a>
				<a
					href="https://github.com/ariefsn/svelte-use"
					class="hero-badge hero-badge-link"
					target="_blank"
					rel="noopener"
					aria-label="View on GitHub"
				>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
					GitHub
				</a>
			</div>
		</div>
		<h1>svelte-use</h1>
		<p class="hero-desc">
			A collection of <strong>{totalComposables}+</strong> Svelte 5 runes-first utility composables.<br />
			No stores. No external dependencies. SSR-safe. Fully typed.
		</p>

		<div class="hero-actions">
			<a href="/docs/use-toggle" class="btn btn-primary">Browse Docs</a>
			<a href="#demos" class="btn btn-secondary">Live Demos</a>
			<a
				href="https://github.com/ariefsn/svelte-use"
				class="btn btn-ghost"
				target="_blank"
				rel="noopener">GitHub</a
			>
			<a
				href="https://www.npmjs.com/package/@ariefsn/svelte-use"
				class="btn btn-ghost"
				target="_blank"
				rel="noopener">npm</a
			>
		</div>
	</header>

	<!-- ─── Install ─── -->
	<section class="section">
		<h2 class="section-title">Installation</h2>
		<pre class="code-block"><code>{`npm install @ariefsn/svelte-use
# or
pnpm add @ariefsn/svelte-use
# or
bun add @ariefsn/svelte-use`}</code></pre>
		<p class="note">Requires <strong>Svelte 5</strong> as a peer dependency.</p>
	</section>

	<!-- ─── Quick Start ─── -->
	<section class="section">
		<h2 class="section-title">Quick Start</h2>
		<p class="section-desc">
			All composables follow the runes-first pattern. State is exposed as <strong
				>getter functions</strong
			>
			backed by <code>$state</code> — call them in templates or <code>$derived</code> to read reactively.
		</p>
		<pre class="code-block"><code>{`import { useMouse, useScroll, useCountdown } from '@ariefsn/svelte-use';

// Tracks pointer position
const mouse = useMouse();
mouse.x()   // → number (reactive)
mouse.y()   // → number (reactive)

// Tracks scroll state of window or any element
const scroll = useScroll();
scroll.y()                   // → number
scroll.arrivedState.bottom() // → boolean

// Countdown timer
const timer = useCountdown(60);
timer.start();
timer.count()    // → 60, 59, 58 …`}</code></pre>
	</section>

	<!-- ─── Features ─── -->
	<section class="section">
		<h2 class="section-title">Features</h2>
		<div class="features-grid">
			{#each features as f}
				<div class="feature-card">
					<span class="feature-icon">{f.icon}</span>
					<strong>{f.label}</strong>
					<span class="feature-desc">{f.desc}</span>
				</div>
			{/each}
		</div>
	</section>

	<!-- ─── Category Overview ─── -->
	<section class="section">
		<h2 class="section-title">Utilities <span class="count-badge">{totalComposables}</span></h2>
		<div class="cat-grid">
			{#each sidebar as group}
				<div class="cat-card">
					<h3 class="cat-title">{group.title}</h3>
					<ul class="cat-list">
						{#each group.items as item}
							<li>
								<a href="/docs/{item.slug}" class="cat-link">{item.label}</a>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</section>

	<!-- ─── Runes Pattern ─── -->
	<section class="section">
		<h2 class="section-title">Runes-first Pattern</h2>
		<p class="section-desc">
			Every composable exposes state as <strong>getter functions</strong> rather than raw reactive
			variables or Svelte stores. This means you always have a stable reference — safe to pass as
			props, store in objects, and use in <code>$derived</code>.
		</p>
		<pre class="code-block"><code>{`// ✅ Getter function — stable reference, works everywhere
const mouse = useMouse();
const dist = $derived(Math.sqrt(mouse.x() ** 2 + mouse.y() ** 2));

// The getter itself is not reactive — calling it inside $derived
// or a Svelte template establishes the reactive dependency automatically.`}</code></pre>
	</section>

	<!-- ─── Interactive Demos ─── -->
	<section class="section demos-section" id="demos">
		<h2 class="section-title">Interactive Demos</h2>
		<p class="section-desc">
			Try these composables live. Browse the full demo collection in the
			<a href="/docs/use-toggle" class="inline-link">docs</a>.
		</p>

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

				<pre><code>{`import { useToggle } from '@ariefsn/svelte-use';

const { value, toggle, set } = useToggle();
toggle();     // value → true
set(false);   // value → false`}</code></pre>
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

				<pre><code>{`import { useCounter } from '@ariefsn/svelte-use';

const { value, inc, dec, reset } = useCounter(0);
inc();     // value → 1
inc(5);    // value → 6
dec(3);    // value → 3
reset();   // value → 0`}</code></pre>
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

				<pre><code>{`import { usePrevious } from '@ariefsn/svelte-use';

let count = $state(0);
const prev = usePrevious(() => count);
// prev() → undefined  (before first change)
count = 1;
// prev() → 0
count = 2;
// prev() → 1`}</code></pre>
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

				<pre><code>{`import { useDebounce } from '@ariefsn/svelte-use';

let query = $state('');
const debounced = useDebounce(() => query, 500);
// debounced() updates only after 500 ms of inactivity`}</code></pre>
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

				<pre><code>{`import { useLocalStorage } from '@ariefsn/svelte-use';

const theme = useLocalStorage('theme', 'light');
theme.set('dark');  // persists to localStorage
theme.value;        // 'dark'`}</code></pre>
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

				<pre><code>{`import { useIndexedDB } from '@ariefsn/svelte-use';

interface Note { id?: number; text: string; done: boolean }
const db = useIndexedDB<Note>('my-app', 'notes');

await db.add({ text: 'Buy milk', done: false });
db.items;                              // reactive T[]
await db.update({ id: 1, done: true });
await db.remove(1);
const pending = await db.query(n => !n.done);`}</code></pre>
			</section>
		</div>
	</section>

	<!-- ─── Footer ─── -->
	<footer class="footer">
		<div class="footer-logo">
			<img src="/logo.svg" alt="svelte-use logo" width="24" height="24" />
			<span>svelte-use</span>
		</div>
		<div class="footer-links">
			<a href="https://github.com/ariefsn/svelte-use" target="_blank" rel="noopener" class="footer-link">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
				GitHub
			</a>
			<a href="https://www.npmjs.com/package/@ariefsn/svelte-use" target="_blank" rel="noopener" class="footer-link">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M0 0v24h24V0H0zm19.2 19.2H4.8V4.8h14.4v14.4z"/><path d="M7.2 7.2h9.6v9.6h-2.4V9.6H12v7.2H7.2z"/></svg>
				npm
			</a>
		</div>
		<p class="footer-copy">MIT License · Built with Svelte 5</p>
	</footer>
</div>

<style>
	.page {
		max-width: 900px;
	}

	/* ─── Hero ─── */
	.hero {
		padding-bottom: 3rem;
		border-bottom: 1px solid #1e1e1e;
		margin-bottom: 3rem;
	}

	.hero-top {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.25rem;
		flex-wrap: wrap;
	}

	.hero-logo {
		width: 72px;
		height: 72px;
		flex-shrink: 0;
	}

	.hero-badges {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: center;
	}

	.hero-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		background: #1a1630;
		color: #a78bfa;
		border: 1px solid #3b2d6e;
		border-radius: 999px;
		padding: 0.2rem 0.75rem;
		font-size: 0.78rem;
		font-family: monospace;
	}

	.hero-badge-link {
		text-decoration: none;
		transition: background 0.15s, border-color 0.15s;
	}

	.hero-badge-link:hover {
		background: #231d45;
		border-color: #5b3fa0;
	}

	h1 {
		font-size: clamp(2rem, 6vw, 3rem);
		font-weight: 800;
		margin: 0 0 0.75rem;
		letter-spacing: -0.04em;
		background: linear-gradient(135deg, #e8e8e8 40%, #a78bfa);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.hero-desc {
		color: #888;
		font-size: 1.05rem;
		line-height: 1.6;
		margin: 0 0 1.75rem;
	}

	.hero-actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		padding: 0.5rem 1.25rem;
		border-radius: 8px;
		font-size: 0.9rem;
		font-weight: 500;
		text-decoration: none;
		transition: all 0.15s;
		cursor: pointer;
		border: none;
	}

	.btn-primary {
		background: #a78bfa;
		color: #0f0f0f;
	}

	.btn-primary:hover {
		background: #c4b5fd;
	}

	.btn-secondary {
		background: #1e1e2e;
		color: #a78bfa;
		border: 1px solid #3b2d6e;
	}

	.btn-secondary:hover {
		background: #231d45;
	}

	.btn-ghost {
		background: #1e1e1e;
		color: #e8e8e8;
		border: 1px solid #2e2e2e;
	}

	.btn-ghost:hover {
		background: #2a2a2a;
	}

	/* ─── Sections ─── */
	.section {
		margin-bottom: 3.5rem;
	}

	.section-title {
		font-size: 1.35rem;
		font-weight: 700;
		margin: 0 0 1rem;
		letter-spacing: -0.02em;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.count-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: #1a1630;
		color: #a78bfa;
		border: 1px solid #3b2d6e;
		border-radius: 999px;
		padding: 0.1rem 0.6rem;
		font-size: 0.75rem;
		font-weight: 600;
		font-family: monospace;
	}

	.section-desc {
		color: #999;
		line-height: 1.65;
		margin: 0 0 1rem;
		font-size: 0.95rem;
	}

	.inline-link {
		color: #a78bfa;
		text-decoration: none;
	}

	.inline-link:hover {
		text-decoration: underline;
	}

	.note {
		color: #666;
		font-size: 0.85rem;
		margin: 0.5rem 0 0;
	}

	.note strong {
		color: #a78bfa;
	}

	/* ─── Code ─── */
	.code-block {
		background: #111;
		border: 1px solid #222;
		border-radius: 8px;
		padding: 1.1rem 1.25rem;
		overflow-x: auto;
		margin: 0;
	}

	.code-block code {
		font-family: 'Fira Code', 'Cascadia Code', monospace;
		font-size: 0.82rem;
		color: #a78bfa;
		white-space: pre;
	}

	/* ─── Feature Grid ─── */
	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 1rem;
	}

	.feature-card {
		background: #141414;
		border: 1px solid #222;
		border-radius: 10px;
		padding: 1rem 1.1rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.feature-icon {
		font-size: 1.3rem;
		margin-bottom: 0.15rem;
	}

	.feature-card strong {
		font-size: 0.9rem;
		color: #e8e8e8;
	}

	.feature-desc {
		font-size: 0.8rem;
		color: #666;
	}

	/* ─── Category Grid ─── */
	.cat-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
	}

	.cat-card {
		background: #141414;
		border: 1px solid #222;
		border-radius: 10px;
		padding: 1rem 1.1rem;
	}

	.cat-title {
		font-size: 0.78rem;
		font-weight: 600;
		color: #555;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		margin: 0 0 0.6rem;
	}

	.cat-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.cat-link {
		display: block;
		color: #888;
		text-decoration: none;
		font-family: monospace;
		font-size: 0.85rem;
		padding: 0.2rem 0;
		transition: color 0.15s;
	}

	.cat-link:hover {
		color: #a78bfa;
	}

	/* ─── Demo Grid ─── */
	.demos-section .section-desc {
		margin-bottom: 1.5rem;
	}

	.grid {
		display: grid;
		gap: 1.5rem;
		grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
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

	/* ─── Footer ─── */
	.footer {
		border-top: 1px solid #1e1e1e;
		padding: 2rem 0;
		margin-top: 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		text-align: center;
	}

	.footer-logo {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: monospace;
		font-weight: 700;
		color: #a78bfa;
		font-size: 0.95rem;
	}

	.footer-links {
		display: flex;
		gap: 1.5rem;
	}

	.footer-link {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		color: #666;
		text-decoration: none;
		font-size: 0.85rem;
		transition: color 0.15s;
	}

	.footer-link:hover {
		color: #a78bfa;
	}

	.footer-copy {
		color: #444;
		font-size: 0.8rem;
		margin: 0;
	}

	/* ─── Mobile Responsive ─── */
	@media (max-width: 640px) {
		.hero-logo {
			width: 56px;
			height: 56px;
		}

		.hero-desc {
			font-size: 0.95rem;
		}

		.features-grid {
			grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		}

		.cat-grid {
			grid-template-columns: 1fr 1fr;
		}

		.grid {
			grid-template-columns: 1fr;
		}

		.code-block code,
		code {
			font-size: 0.75rem;
		}

		.count {
			font-size: 2rem;
		}
	}

	@media (max-width: 400px) {
		.cat-grid {
			grid-template-columns: 1fr;
		}

		.features-grid {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
