import { describe, expect, test, vi, beforeEach } from 'vitest';

// `$app/navigation` is SvelteKit-only and unavailable in unit tests, so the two functions
// useNavigationGuard depends on are stubbed.
const mocks = vi.hoisted(() => ({
	navCallback: null as ((nav: unknown) => void) | null,
	goto: vi.fn(() => Promise.resolve())
}));

vi.mock('$app/navigation', () => ({
	beforeNavigate: (cb: (nav: unknown) => void) => {
		mocks.navCallback = cb;
	},
	goto: mocks.goto
}));

const { useNavigationGuard } = await import('./useNavigationGuard.svelte.js');

type Nav = { type: string; to: { url: URL } | null; cancel: () => void };

function navigateTo(url: string, type = 'link'): Nav {
	const nav: Nav = {
		type,
		to: { url: new URL(url) },
		cancel: vi.fn()
	};
	mocks.navCallback?.(nav);
	return nav;
}

beforeEach(() => {
	mocks.navCallback = null;
	mocks.goto.mockClear();
});

describe('useNavigationGuard', () => {
	test('lets navigation through when shouldBlock is false', () => {
		const onBlock = vi.fn();
		useNavigationGuard({ shouldBlock: () => false, onBlock });

		const nav = navigateTo('https://example.com/next');

		expect(nav.cancel).not.toHaveBeenCalled();
		expect(onBlock).not.toHaveBeenCalled();
	});

	test('cancels navigation and fires onBlock when shouldBlock is true', () => {
		const onBlock = vi.fn();
		useNavigationGuard({ shouldBlock: () => true, onBlock });

		const nav = navigateTo('https://example.com/next');

		expect(nav.cancel).toHaveBeenCalledOnce();
		expect(onBlock).toHaveBeenCalledOnce();
	});

	test('ignores navigation types it does not guard', () => {
		const onBlock = vi.fn();
		useNavigationGuard({ shouldBlock: () => true, onBlock });

		const nav = navigateTo('https://example.com/next', 'form');

		expect(nav.cancel).not.toHaveBeenCalled();
		expect(onBlock).not.toHaveBeenCalled();
	});

	test('confirm() navigates to the pending URL', () => {
		const { confirm } = useNavigationGuard({ shouldBlock: () => true });

		navigateTo('https://example.com/next');
		confirm();

		expect(mocks.goto).toHaveBeenCalledWith('https://example.com/next');
	});

	test('confirm() lets the retried navigation through while shouldBlock is still true', () => {
		// Regression: confirm() re-enters the guard via goto(). Without a one-shot bypass the retry is
		// cancelled again and confirm() can never actually navigate.
		const onBlock = vi.fn();
		const { confirm } = useNavigationGuard({ shouldBlock: () => true, onBlock });

		navigateTo('https://example.com/next');
		expect(onBlock).toHaveBeenCalledOnce();

		confirm();

		// goto() triggers the guard again; this attempt must pass through.
		const retry = navigateTo('https://example.com/next', 'goto');

		expect(retry.cancel).not.toHaveBeenCalled();
		expect(onBlock).toHaveBeenCalledOnce();
	});

	test('the bypass is single-use', () => {
		const { confirm } = useNavigationGuard({ shouldBlock: () => true });

		navigateTo('https://example.com/next');
		confirm();
		navigateTo('https://example.com/next', 'goto'); // consumes the bypass

		const later = navigateTo('https://example.com/elsewhere');

		expect(later.cancel).toHaveBeenCalledOnce();
	});

	test('cancel() discards the pending navigation', () => {
		const { confirm, cancel } = useNavigationGuard({ shouldBlock: () => true });

		navigateTo('https://example.com/next');
		cancel();
		confirm();

		expect(mocks.goto).not.toHaveBeenCalled();
	});

	test('confirm() without a blocked navigation is a no-op', () => {
		const { confirm } = useNavigationGuard({ shouldBlock: () => true });

		confirm();

		expect(mocks.goto).not.toHaveBeenCalled();
	});
});
