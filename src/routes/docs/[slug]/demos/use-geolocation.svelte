<script lang="ts">
	import { useGeolocation } from '$lib/browser/useGeolocation.svelte.js';

	const geo = useGeolocation({ enableHighAccuracy: false });
</script>

<div class="demo-wrap">
	<p class="hint">Click the button — your browser will ask for location permission.</p>

	{#if geo.error()}
		<div
			class="border-danger-border bg-danger-bg flex items-start gap-3 rounded-lg border px-5 py-4"
		>
			<span class="mt-[0.1rem] shrink-0 text-[1.3rem]">⚠</span>
			<div class="flex flex-col gap-0.5">
				<span class="text-text-muted text-[0.9rem]">Error</span>
				<span class="text-text-faint text-[0.78rem]">{geo.error()?.message}</span>
			</div>
		</div>
	{:else if geo.coords()}
		<div
			class="border-success-border bg-success-bg flex items-start gap-3 rounded-lg border px-5 py-4"
		>
			<span class="mt-[0.1rem] shrink-0 text-[1.3rem]">📍</span>
			<div class="flex flex-col gap-0.5">
				<div class="row">
					<span class="label">lat</span><span class="value accent"
						>{geo.coords()?.latitude.toFixed(6)}</span
					>
				</div>
				<div class="row">
					<span class="label">lon</span><span class="value accent"
						>{geo.coords()?.longitude.toFixed(6)}</span
					>
				</div>
				<div class="row">
					<span class="label">accuracy</span><span class="value accent"
						>{geo.coords()?.accuracy.toFixed(0)}m</span
					>
				</div>
			</div>
		</div>
	{:else}
		<div class="border-border bg-bg-elev flex items-start gap-3 rounded-lg border px-5 py-4">
			<span class="mt-[0.1rem] shrink-0 text-[1.3rem]">🌐</span>
			<div class="flex flex-col gap-0.5">
				<span class="text-text-muted text-[0.9rem]">Waiting for permission…</span>
				<span class="text-text-faint text-[0.78rem]"
					>useGeolocation starts watching automatically</span
				>
			</div>
		</div>
	{/if}
</div>
