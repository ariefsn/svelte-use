<script lang="ts">
	import { useCssVar } from '$lib';

	let box = $state<HTMLDivElement | null>(null);

	// Token references rather than raw hex, so the swatches stay correct in both themes — and it
	// shows that a custom property can hold any CSS value, including another variable.
	const swatches = [
		{ label: 'accent', value: 'var(--color-accent)' },
		{ label: 'success', value: 'var(--color-success)' },
		{ label: 'danger', value: 'var(--color-danger)' },
		{ label: 'warning', value: 'var(--color-warning)' }
	];

	const accent = useCssVar('--demo-accent', () => box, { initialValue: swatches[0].value });
</script>

<div class="demo-wrap">
	<div class="actions">
		{#each swatches as swatch (swatch.value)}
			<button
				class:active={accent.current() === swatch.value}
				onclick={() => accent.set(swatch.value)}
			>
				{swatch.label}
			</button>
		{/each}
		<button onclick={() => accent.remove()}>remove</button>
		<button onclick={() => accent.refresh()}>refresh</button>
	</div>

	<div class="row">
		<span class="label">--demo-accent</span>
		<span class="value accent">{accent.current() || '(unset)'}</span>
	</div>

	<div
		class="flex items-center rounded-lg border-2 p-3.5 text-[0.85rem] transition-all"
		style="--demo-accent: var(--color-accent); border-color: var(--demo-accent); color: var(--demo-accent)"
		bind:this={box}
	>
		<span>live custom property</span>
	</div>

	<p class="hint">
		Writes are instant and free. Reads are the compromise: custom properties have no change event,
		so this reads once at init and then only when asked. Pass <code>observe: true</code> to catch a
		theme class flipping, and use <code>refresh()</code> for everything else.
	</p>
</div>
