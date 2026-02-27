<script lang="ts">
	import { useFocus } from '$lib';

	let input: HTMLInputElement | undefined = $state();
	let textarea: HTMLTextAreaElement | undefined = $state();

	const { focused: inputFocused } = useFocus(() => input ?? null);
	const { focused: textareaFocused } = useFocus(() => textarea ?? null);
</script>

<div class="demo-root">
	<div class="field">
		<label class:active={inputFocused()}>
			Text input {inputFocused() ? '— focused' : ''}
		</label>
		<input
			bind:this={input}
			type="text"
			placeholder="Click to focus…"
			class:focused={inputFocused()}
		/>
	</div>

	<div class="field">
		<label class:active={textareaFocused()}>
			Textarea {textareaFocused() ? '— focused' : ''}
		</label>
		<textarea
			bind:this={textarea}
			placeholder="Click to focus…"
			class:focused={textareaFocused()}
			rows="3"
		></textarea>
	</div>
</div>

<style>
	.demo-root {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}
	label {
		font-size: 0.82rem;
		color: #666;
		transition: color 0.15s;
	}
	label.active {
		color: #a78bfa;
	}
	input,
	textarea {
		background: #2a2a2a;
		border: 1px solid #3a3a3a;
		border-radius: 6px;
		padding: 0.4rem 0.7rem;
		color: #e8e8e8;
		font-size: 0.88rem;
		outline: none;
		resize: vertical;
		transition: border-color 0.15s;
		font-family: inherit;
	}
	input.focused,
	textarea.focused {
		border-color: #a78bfa;
	}
</style>
