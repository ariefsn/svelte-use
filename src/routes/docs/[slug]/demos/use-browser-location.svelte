<script lang="ts">
	import { useBrowserLocation } from '$lib';

	const loc = useBrowserLocation();
</script>

<div class="demo-root">
	<p class="hint">Navigate, use browser back/forward, or change the URL hash to see updates.</p>

	<div class="kv-list">
		<div class="kv">
			<span class="key">pathname</span>
			<span class="val">{loc.pathname()}</span>
		</div>
		<div class="kv">
			<span class="key">search</span>
			<span class="val">{loc.search() || '—'}</span>
		</div>
		<div class="kv">
			<span class="key">hash</span>
			<span class="val">{loc.hash() || '—'}</span>
		</div>
		<div class="kv">
			<span class="key">href</span>
			<span class="val href">{loc.href()}</span>
		</div>
	</div>

	<div class="actions">
		<a href="#section-1">Set #section-1</a>
		<a href="#section-2">Set #section-2</a>
		<a href={loc.pathname()}>Clear hash</a>
	</div>
</div>

<style>
	.demo-root {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.hint {
		margin: 0;
		font-size: 0.82rem;
		color: #666;
		font-style: italic;
	}
	.kv-list {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.kv {
		display: flex;
		gap: 0.75rem;
		align-items: baseline;
		font-size: 0.88rem;
	}
	.key {
		font-family: monospace;
		color: #666;
		min-width: 72px;
		flex-shrink: 0;
	}
	.val {
		font-family: monospace;
		color: #a78bfa;
		word-break: break-all;
	}
	.href {
		color: #888;
		font-size: 0.78rem;
	}
	.actions {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	a {
		background: #2a2a2a;
		color: #e8e8e8;
		border: 1px solid #3a3a3a;
		border-radius: 6px;
		padding: 0.3rem 0.65rem;
		font-size: 0.82rem;
		text-decoration: none;
		transition: background 0.15s;
	}
	a:hover {
		background: #3a3a3a;
	}
</style>
