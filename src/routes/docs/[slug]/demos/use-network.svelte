<script lang="ts">
	import { useNetwork } from '$lib/browser/useNetwork.svelte.js';

	const net = useNetwork();
</script>

<div class="demo-wrap">
	<p class="hint">Try toggling your network connection or enabling airplane mode.</p>

	<div
		class="flex items-center gap-3 rounded-lg border px-5 py-4 transition-all duration-300 {net.online()
			? 'border-success-border bg-success-bg'
			: 'border-danger-border bg-danger-bg'}"
	>
		<div class="shrink-0 text-[1.2rem]">{net.online() ? '🟢' : '🔴'}</div>
		<div class="flex flex-col gap-[0.1rem]">
			<span class="text-[0.95rem] font-semibold {net.online() ? 'text-success' : 'text-danger'}"
				>{net.online() ? 'Online' : 'Offline'}</span
			>
			<span class="text-text-faint text-[0.78rem]"
				>{net.online() ? 'Connected to the internet' : 'No network connection detected'}</span
			>
		</div>
	</div>
</div>
