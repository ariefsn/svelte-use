<script lang="ts">
	import { useNavigatorLanguage } from '$lib';

	const language = useNavigatorLanguage();
</script>

<div class="demo-root">
	<div class="kv">
		<span class="key">navigator.language</span>
		<span class="val">{language()}</span>
	</div>

	<p class="hint">
		Change your browser's preferred language in settings to see this update (via the
		<code>languagechange</code> event).
	</p>
</div>

<style>
	.demo-root {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.kv {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.9rem;
	}
	.key {
		font-family: monospace;
		color: #666;
	}
	.val {
		font-family: monospace;
		font-size: 1.1rem;
		font-weight: 600;
		color: #a78bfa;
	}
	.hint {
		margin: 0;
		font-size: 0.82rem;
		color: #666;
		font-style: italic;
		line-height: 1.5;
	}
	code {
		background: #2a2a2a;
		padding: 0.1rem 0.35rem;
		border-radius: 4px;
		font-size: 0.85em;
		color: #a78bfa;
	}
</style>
