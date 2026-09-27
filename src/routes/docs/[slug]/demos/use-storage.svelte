<script lang="ts">
	import { useStorage } from '$lib';

	const local = useStorage('svelte-use-demo-local', 'hello', 'local');
	const session = useStorage('svelte-use-demo-session', 'hello', 'session');
</script>

<div class="demo-wrap">
	<div class="flex flex-wrap items-center gap-2.5">
		<span class="label">localStorage</span>
		<input
			class="bg-bg-sunken border-border-strong text-text focus:border-accent min-w-[140px] flex-1 rounded-md border px-2.5 py-1.5 text-[0.88rem] outline-none"
			value={local.value}
			oninput={(e) => local.set(e.currentTarget.value)}
		/>
		<button onclick={local.remove}>remove()</button>
	</div>

	<div class="flex flex-wrap items-center gap-2.5">
		<span class="label">sessionStorage</span>
		<input value={session.value} oninput={(e) => session.set(e.currentTarget.value)} />
		<button onclick={session.remove}>remove()</button>
	</div>

	<p class="hint">
		Reload the page: the localStorage value survives, the sessionStorage one survives only in this
		tab. Open a second tab to see cross-tab sync.
	</p>
</div>
