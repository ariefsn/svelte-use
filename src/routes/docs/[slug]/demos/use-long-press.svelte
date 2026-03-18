<script lang="ts">
	import { useLongPress } from '$lib/browser/interaction/useLongPress.svelte.js';
	let el = $state<HTMLDivElement | null>(null);
	let count = $state(0);
	let pressing = $state(false);
	useLongPress(() => el, () => {
		count++;
		pressing = false;
	}, { delay: 800 });
</script>
<div class="demo-wrap">
	<div class="row">
		<span class="label">long presses</span>
		<span class="value accent">{count}</span>
	</div>
	<div bind:this={el}
		onpointerdown={() => (pressing = true)}
		onpointerup={() => (pressing = false)}
		onpointercancel={() => (pressing = false)}
		style="padding:2rem;background:{pressing ? '#2a1f4e' : '#111'};border:1px solid #333;border-radius:8px;text-align:center;cursor:pointer;user-select:none;transition:background 0.2s;color:#888"
	>
		{pressing ? 'Hold…' : 'Press and hold (800ms)'}
	</div>
	<p class="hint">Hold the element for 800ms to trigger. Moving too far cancels.</p>
</div>
