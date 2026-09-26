<script lang="ts">
	import { usePreferredReducedMotion } from '$lib';

	const motion = usePreferredReducedMotion();
	const duration = $derived(motion() === 'reduce' ? 0 : 600);
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">motion</span>
		<span class="value accent">{motion()}</span>
	</div>
	<div class="row">
		<span class="label">duration</span>
		<span class="value">{duration}ms</span>
	</div>
	<p class="hint">
		Enable “Reduce motion” in your OS accessibility settings to watch this change. Prefer skipping
		an animation outright over merely shortening it.
	</p>
</div>
