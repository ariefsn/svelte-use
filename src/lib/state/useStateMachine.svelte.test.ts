import { flushSync } from 'svelte';
import { describe, expect, test, vi } from 'vitest';
import { useStateMachine } from './useStateMachine.svelte.js';

/** The fetch machine used across most of these tests. */
function fetchMachine() {
	return useStateMachine({
		initial: 'idle',
		states: {
			idle: { on: { FETCH: 'loading' } },
			loading: { on: { RESOLVE: 'success', REJECT: 'failure' } },
			success: { on: { FETCH: 'loading' } },
			failure: { on: { RETRY: 'loading' } }
		}
	});
}

describe('useStateMachine', () => {
	test('starts in the initial state', () => {
		const cleanup = $effect.root(() => {
			const machine = fetchMachine();
			expect(machine.state()).toBe('idle');
			expect(machine.matches('idle')).toBe(true);
			expect(machine.matches('loading')).toBe(false);
		});
		cleanup();
	});

	test('send() follows a declared transition', () => {
		const cleanup = $effect.root(() => {
			const machine = fetchMachine();

			expect(machine.send('FETCH')).toBe(true);
			flushSync();
			expect(machine.state()).toBe('loading');

			expect(machine.send('RESOLVE')).toBe(true);
			flushSync();
			expect(machine.state()).toBe('success');
		});
		cleanup();
	});

	test('an action illegal from the current state is a no-op returning false', () => {
		// Never a throw: a stray click must not crash a component.
		const cleanup = $effect.root(() => {
			const machine = fetchMachine();

			expect(machine.send('RESOLVE')).toBe(false);
			flushSync();
			expect(machine.state()).toBe('idle');
		});
		cleanup();
	});

	test('can() reports runtime legality, which types cannot', () => {
		const cleanup = $effect.root(() => {
			const machine = fetchMachine();

			expect(machine.can('FETCH')).toBe(true);
			expect(machine.can('RESOLVE')).toBe(false);

			machine.send('FETCH');
			flushSync();

			expect(machine.can('FETCH')).toBe(false);
			expect(machine.can('RESOLVE')).toBe(true);
		});
		cleanup();
	});

	test('a guard can block a transition', () => {
		let allowed = false;

		const cleanup = $effect.root(() => {
			const machine = useStateMachine({
				initial: 'closed',
				states: {
					closed: { on: { OPEN: { target: 'open', guard: () => allowed } } },
					open: { on: { CLOSE: 'closed' } }
				}
			});

			expect(machine.can('OPEN')).toBe(false);
			expect(machine.send('OPEN')).toBe(false);
			expect(machine.state()).toBe('closed');

			allowed = true;
			expect(machine.can('OPEN')).toBe(true);
			expect(machine.send('OPEN')).toBe(true);
			flushSync();
			expect(machine.state()).toBe('open');
		});
		cleanup();
	});

	test('onTransition fires only for successful transitions', () => {
		const onTransition = vi.fn();

		const cleanup = $effect.root(() => {
			const machine = useStateMachine(
				{
					initial: 'idle',
					states: {
						idle: { on: { FETCH: 'loading' } },
						loading: { on: { RESOLVE: 'idle' } }
					}
				},
				{ onTransition }
			);

			machine.send('FETCH');
			expect(onTransition).toHaveBeenCalledWith({ from: 'idle', to: 'loading', action: 'FETCH' });

			// Illegal from 'loading' — no callback.
			machine.send('FETCH');
			expect(onTransition).toHaveBeenCalledTimes(1);
		});
		cleanup();
	});

	test('history records visited states, including the initial one', () => {
		const cleanup = $effect.root(() => {
			const machine = fetchMachine();
			expect(machine.history()).toEqual(['idle']);

			machine.send('FETCH');
			machine.send('REJECT');
			machine.send('RETRY');
			flushSync();

			expect(machine.history()).toEqual(['idle', 'loading', 'failure', 'loading']);
		});
		cleanup();
	});

	test('history is trimmed to historyLimit', () => {
		const cleanup = $effect.root(() => {
			const machine = useStateMachine(
				{
					initial: 'a',
					states: { a: { on: { GO: 'b' } }, b: { on: { GO: 'a' } } }
				},
				{ historyLimit: 3 }
			);

			for (let i = 0; i < 10; i++) machine.send('GO');
			flushSync();

			expect(machine.history()).toHaveLength(3);
			// The most recent entries are the ones kept.
			expect(machine.history().at(-1)).toBe(machine.state());
		});
		cleanup();
	});

	test('reset() returns to initial and clears history', () => {
		const cleanup = $effect.root(() => {
			const machine = fetchMachine();

			machine.send('FETCH');
			machine.send('RESOLVE');
			flushSync();
			expect(machine.state()).toBe('success');

			machine.reset();
			flushSync();

			expect(machine.state()).toBe('idle');
			expect(machine.history()).toEqual(['idle']);
		});
		cleanup();
	});

	test('state is reactive, so $derived tracks it', () => {
		const cleanup = $effect.root(() => {
			const machine = fetchMachine();
			const label = $derived(machine.state().toUpperCase());

			expect(label).toBe('IDLE');
			machine.send('FETCH');
			flushSync();
			expect(label).toBe('LOADING');
		});
		cleanup();
	});

	test('a state with no transitions is terminal', () => {
		const cleanup = $effect.root(() => {
			const machine = useStateMachine({
				initial: 'running',
				states: { running: { on: { END: 'done' } }, done: {} }
			});

			machine.send('END');
			flushSync();
			expect(machine.state()).toBe('done');
			expect(machine.send('END')).toBe(false);
		});
		cleanup();
	});

	test('explicit type parameters give exhaustiveness checking', () => {
		type State = 'idle' | 'loading' | 'done';
		type Action = 'START' | 'FINISH';

		const cleanup = $effect.root(() => {
			const machine = useStateMachine<State, Action>({
				initial: 'idle',
				states: {
					idle: { on: { START: 'loading' } },
					loading: { on: { FINISH: 'done' } },
					// Omitting `done` here is a compile error — that is the
					// whole point of supplying the parameters.
					done: {}
				}
			});

			expect(machine.state()).toBe('idle');
		});
		cleanup();
	});

	// The type-level guarantees are this util's main claim, so they are pinned here: an unused
	// `@ts-expect-error` fails `bun run check`, so a later loosening breaks the build.
	test('rejects unknown actions, states and transition targets at compile time', () => {
		const cleanup = $effect.root(() => {
			const machine = fetchMachine();

			// @ts-expect-error -- 'FECTH' is not an action in this machine
			machine.send('FECTH');
			// @ts-expect-error -- 'idel' is not a state in this machine
			machine.matches('idel');

			useStateMachine({
				initial: 'idle',
				// @ts-expect-error -- 'lodaing' is not a declared state
				states: { idle: { on: { FETCH: 'lodaing' } }, loading: {} }
			});

			useStateMachine({
				// @ts-expect-error -- 'idel' is not a declared state
				initial: 'idel',
				states: { idle: { on: { FETCH: 'loading' } }, loading: {} }
			});

			expect(machine.state()).toBe('idle');
		});
		cleanup();
	});
});
