<script lang="ts">
	import { useElementHover } from '$lib';

	let card: HTMLDivElement | undefined = $state();
	let btn: HTMLButtonElement | undefined = $state();

	const { hovering: hoverCard } = useElementHover(() => card ?? null);
	const { hovering: hoverBtn } = useElementHover(() => btn ?? null);
</script>

<div class="demo-root">
	<div bind:this={card} class="card" class:hovered={hoverCard()}>
		<span>Hover over this card</span>
		<span class="badge" class:on={hoverCard()}>{hoverCard() ? 'Hovering' : 'Not hovering'}</span>
	</div>

	<div class="row">
		<button bind:this={btn} class:btn-hovered={hoverBtn()}> Hover over this button </button>
		<span class="muted">{hoverBtn() ? 'Button hovered!' : ''}</span>
	</div>
</div>

<style>
	.demo-root {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.card {
		padding: 1.25rem;
		border: 1px solid #2e2e2e;
		border-radius: 8px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		transition:
			border-color 0.15s,
			background 0.15s;
		font-size: 0.9rem;
		color: #aaa;
		cursor: default;
	}
	.card.hovered {
		border-color: #a78bfa;
		background: #1a1630;
		color: #e8e8e8;
	}
	.badge {
		padding: 0.2rem 0.6rem;
		border-radius: 999px;
		font-size: 0.78rem;
		background: #2a2a2a;
		color: #666;
		border: 1px solid #333;
		transition: all 0.15s;
	}
	.badge.on {
		background: #1a1630;
		color: #a78bfa;
		border-color: #3b2d6e;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	button {
		background: #2a2a2a;
		color: #e8e8e8;
		border: 1px solid #3a3a3a;
		border-radius: 6px;
		padding: 0.35rem 0.75rem;
		font-size: 0.85rem;
		cursor: pointer;
		transition: all 0.15s;
	}
	.btn-hovered {
		background: #2a1f4e;
		border-color: #a78bfa;
		color: #a78bfa;
	}
	.muted {
		color: #a78bfa;
		font-size: 0.82rem;
	}
</style>
