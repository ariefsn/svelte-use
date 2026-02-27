<script lang="ts">
	import { useMousePressed } from '$lib/browser/useMousePressed.svelte.js';

	const pressed = useMousePressed();
</script>

<div class="demo-wrap">
	<p class="hint">Hold any mouse button anywhere on the page.</p>

	<div class="indicator" class:active={pressed()}>
		<div class="dot"></div>
		<span>{pressed() ? 'Mouse is pressed' : 'Mouse is released'}</span>
	</div>
</div>

<style>
	.indicator {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 1.25rem;
		border-radius: 8px;
		border: 1px solid #2e2e2e;
		background: #1a1a1a;
		transition: all 0.1s;
		font-size: 0.95rem;
		color: #666;
		user-select: none;
	}
	.indicator.active {
		border-color: #a78bfa;
		background: #1a1630;
		color: #c4b5fd;
	}
	.dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: #333;
		flex-shrink: 0;
		transition: background 0.1s;
	}
	.indicator.active .dot {
		background: #a78bfa;
		box-shadow: 0 0 6px #a78bfa88;
	}
</style>
