/** Where an action leads, optionally gated by a runtime condition. */
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
	/** Starting state. */
	readonly initial: NoInfer<S>;
	/** Every state, keyed by name. */
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
	/** How many past states `history()` keeps. Use `Infinity` for unbounded. Default `100`. */
	historyLimit?: number;
}

/** Return value of `useStateMachine`. */
export interface UseStateMachineReturn<S extends string, A extends string> {
	/** The current state. */
	state: () => S;
	/**
	 * Applies an action. Returns `false` — never throws — when the action is illegal from the current
	 * state or its guard rejects.
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

/** A finite state machine with typed states and actions, inferred from the config. */
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
		// `NoInfer<S>` is `S`, but TypeScript will not prove the two identical when narrowing,
		// so the declared shape is restated here rather than casting the result.
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
