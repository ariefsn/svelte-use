/**
 * Where an action leads, optionally gated by a runtime condition.
 *
 * The bare-string form is the common case; the object form adds a `guard`
 * that must return `true` for the transition to happen.
 */
export type Transition<S extends string> =
	| S
	| {
			readonly target: S;
			/** Blocks the transition when it returns `false`. */
			readonly guard?: () => boolean;
	  };

/** One state and the actions it accepts. */
export interface StateNode<S extends string, A extends string> {
	/** Action to destination. An action absent here is illegal from this state. */
	readonly on?: Readonly<Partial<Record<A, Transition<S>>>>;
}

/** The machine definition. */
export interface MachineConfig<S extends string, A extends string> {
	/**
	 * Starting state.
	 *
	 * `NoInfer` so a typo is *checked* against the declared states rather than
	 * silently widening the state union to include it.
	 */
	readonly initial: NoInfer<S>;
	/**
	 * Every state, keyed by name.
	 *
	 * `NoInfer` on the transition target matters more than on `initial`:
	 * without it, `on: { FETCH: 'lodaing' }` would *add* `'lodaing'` to the
	 * state union instead of erroring, which is exactly the unreachable-state
	 * typo this is supposed to catch.
	 */
	readonly states: { readonly [K in S]: StateNode<NoInfer<S>, A> };
}

/** A transition that actually happened. */
export interface StateTransition<S extends string, A extends string> {
	readonly from: S;
	readonly to: S;
	readonly action: A;
}

/** Options for `useStateMachine`. */
export interface UseStateMachineOptions<S extends string, A extends string> {
	/** Called after each successful transition. */
	onTransition?: (transition: StateTransition<S, A>) => void;
	/**
	 * How many past states `history()` keeps. Use `Infinity` for unbounded.
	 * @default 100
	 */
	historyLimit?: number;
}

/** Return value of `useStateMachine`. */
export interface UseStateMachineReturn<S extends string, A extends string> {
	/** The current state. */
	state: () => S;
	/**
	 * Applies an action. Returns `false` — never throws — when the action is
	 * illegal from the current state or its guard rejects.
	 */
	send: (action: A) => boolean;
	/** Whether the action would be accepted right now, guards included. */
	can: (action: A) => boolean;
	/** Whether the machine is in a given state. */
	matches: (state: S) => boolean;
	/** States visited, oldest first, including the current one. */
	history: () => readonly S[];
	/** Returns to `initial` and clears history. */
	reset: () => void;
}

/**
 * A finite state machine with typed states and actions.
 *
 * The config drives inference, so each machine gets its own state and action
 * unions with nothing hardcoded. What the types catch:
 *
 * - `send('FECTH')` — not an action in this machine
 * - `matches('idel')` — not a state in this machine
 * - `on: { FETCH: 'lodaing' }` — a target that is not a declared state
 * - `initial: 'idel'` — not a declared state
 *
 * What they **cannot** catch is whether an action is legal from the state you
 * happen to be in at runtime; that is data, not type information. `can()`
 * answers it, and an illegal `send()` is a no-op returning `false` so a stray
 * click cannot crash a component.
 *
 * Supplying `State` and `Action` explicitly adds exhaustiveness: `states`
 * becomes a required record over the full union, so a forgotten state is a
 * compile error. TypeScript has no partial type-argument inference, so supply
 * **both** or neither.
 *
 * Pure state with no DOM, timers or effects, so it renders on the server and
 * hydrates without a guard.
 *
 * @param config - States, transitions and the starting state
 * @param options - Transition callback and history limit
 * @returns The machine state plus `send`, `can`, `matches`, `history` and `reset`
 *
 * @example
 * ```ts
 * const machine = useStateMachine({
 *   initial: 'idle',
 *   states: {
 *     idle: { on: { FETCH: 'loading' } },
 *     loading: { on: { RESOLVE: 'success', REJECT: 'failure' } },
 *     success: { on: { FETCH: 'loading' } },
 *     failure: { on: { RETRY: 'loading' } }
 *   }
 * });
 *
 * machine.send('FETCH');    // → true, now 'loading'
 * machine.can('RETRY');     // → false, not legal from 'loading'
 * machine.state();          // → 'idle' | 'loading' | 'success' | 'failure'
 * ```
 *
 * @example
 * ```ts
 * // Explicit parameters add exhaustiveness checking
 * type State = 'idle' | 'loading' | 'done';
 * type Action = 'START' | 'FINISH';
 *
 * const machine = useStateMachine<State, Action>({
 *   initial: 'idle',
 *   states: {
 *     idle: { on: { START: 'loading' } },
 *     loading: { on: { FINISH: 'done' } },
 *     done: {}
 *     // omitting `done` would be a compile error
 *   }
 * });
 * ```
 */
export function useStateMachine<const S extends string, const A extends string>(
	config: MachineConfig<S, A>,
	options: UseStateMachineOptions<S, A> = {}
): UseStateMachineReturn<S, A> {
	const { onTransition, historyLimit = 100 } = options;
	const initial = config.initial as S;

	let current = $state<S>(initial);
	let visited = $state<readonly S[]>([initial]);

	/** The transition an action would take, or `null` when it is illegal. */
	function resolve(action: A): { target: S; guard?: () => boolean } | null {
		const node = config.states[current];
		// `NoInfer<S>` is `S` — it only suppresses inference at the call site —
		// but TypeScript will not prove the two identical when narrowing, so the
		// declared shape is restated here rather than casting the result.
		const transition: Transition<S> | undefined = node?.on?.[action];
		if (transition === undefined) return null;
		return typeof transition === 'string' ? { target: transition } : { ...transition };
	}

	function can(action: A): boolean {
		const transition = resolve(action);
		if (!transition) return false;
		return transition.guard ? transition.guard() : true;
	}

	function send(action: A): boolean {
		const transition = resolve(action);
		if (!transition) return false;
		if (transition.guard && !transition.guard()) return false;

		const from = current;
		current = transition.target;

		// Appending in an event handler, outside any tracking pass — this is
		// never called from an effect body.
		const next = [...visited, transition.target];
		visited = next.length > historyLimit ? next.slice(next.length - historyLimit) : next;

		onTransition?.({ from, to: transition.target, action });
		return true;
	}

	function reset(): void {
		current = initial;
		visited = [initial];
	}

	return {
		state: () => current,
		send,
		can,
		matches: (state: S) => current === state,
		history: () => visited,
		reset
	};
}
