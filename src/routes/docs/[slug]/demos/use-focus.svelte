<script lang="ts">
	import { useFocus } from '$lib';

	let input: HTMLInputElement | undefined = $state();
	let textarea: HTMLTextAreaElement | undefined = $state();

	const { focused: inputFocused } = useFocus(() => input ?? null);
	const { focused: textareaFocused } = useFocus(() => textarea ?? null);
</script>

<div class="demo-wrap">
	<div class="flex flex-col gap-1.5">
		<label
			class="text-[0.82rem] transition-colors {inputFocused() ? 'text-accent' : 'text-text-muted'}"
		>
			Text input {inputFocused() ? '— focused' : ''}
		</label>
		<input
			bind:this={input}
			type="text"
			placeholder="Click to focus…"
			class="bg-surface-2 text-text resize-y rounded-md border px-2.5 py-1.5 font-[inherit] text-[0.88rem] outline-none transition-colors {inputFocused()
				? 'border-accent'
				: 'border-border-strong'}"
		/>
	</div>

	<div class="flex flex-col gap-1.5">
		<label
			class="text-[0.82rem] transition-colors {textareaFocused()
				? 'text-accent'
				: 'text-text-muted'}"
		>
			Textarea {textareaFocused() ? '— focused' : ''}
		</label>
		<textarea
			bind:this={textarea}
			placeholder="Click to focus…"
			rows="3"
			class="bg-surface-2 text-text resize-y rounded-md border px-2.5 py-1.5 font-[inherit] text-[0.88rem] outline-none transition-colors {textareaFocused()
				? 'border-accent'
				: 'border-border-strong'}"
		></textarea>
	</div>
</div>
