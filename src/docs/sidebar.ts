/**
 * The release whose additions are badged "new" in the sidebar.
 *
 * Bumping this on each release retires the previous badges automatically,
 * rather than needing every `since` field swept by hand.
 */
export const NEW_IN_VERSION = '1.2.0';

export interface SidebarItem {
	label: string;
	slug: string;
	/**
	 * Version this util shipped in, e.g. `'1.2.0'`.
	 *
	 * Required, so a new util cannot be added without recording when it
	 * landed — the docs page renders this as a badge, and a missing one used
	 * to show nothing at all. `coverage.test.ts` enforces the format.
	 */
	since: string;
}

export interface SidebarGroup {
	title: string;
	items: SidebarItem[];
}

/** Whether an item shipped in the release currently being highlighted. */
export function isNew(item: SidebarItem): boolean {
	return item.since === NEW_IN_VERSION;
}

/**
 * Whether a group contains any newly added item.
 *
 * Lets a collapsed group show that something new is hidden inside it —
 * otherwise the only signal lives on children the user cannot see.
 */
export function groupHasNew(group: SidebarGroup): boolean {
	return group.items.some(isNew);
}

/**
 * Groups in authoring order. Exported sorted, not reordered here, so related
 * groups can stay together while editing.
 */
const groups: SidebarGroup[] = [
	{
		title: 'Animation',
		items: [
			{ label: 'useAnimate', slug: 'use-animate', since: '1.0.0' },
			{ label: 'useRafFn', slug: 'use-raf-fn', since: '1.2.0' },
			{ label: 'useParallax', slug: 'use-parallax', since: '1.0.0' },
			{ label: 'useTransition', slug: 'use-transition', since: '1.0.0' }
		]
	},
	{
		title: 'Async',
		items: [
			{ label: 'useFetch', slug: 'use-fetch', since: '1.0.0' },
			{ label: 'useWebSocket', slug: 'use-web-socket', since: '1.0.0' },
			{ label: 'useAsyncState', slug: 'use-async-state', since: '1.1.0' },
			{ label: 'useEventSource', slug: 'use-event-source', since: '1.2.0' },
			{ label: 'useBroadcastChannel', slug: 'use-broadcast-channel', since: '1.2.0' }
		]
	},
	{
		title: 'Time',
		items: [
			{ label: 'useInterval', slug: 'use-interval', since: '1.0.0' },
			{ label: 'useIntervalFn', slug: 'use-interval-fn', since: '1.0.0' },
			{ label: 'useNow', slug: 'use-now', since: '1.0.0' },
			{ label: 'useTimeout', slug: 'use-timeout', since: '1.0.0' },
			{ label: 'useTimeoutFn', slug: 'use-timeout-fn', since: '1.0.0' },
			{ label: 'useTimeoutPoll', slug: 'use-timeout-poll', since: '1.0.0' },
			{ label: 'useTimestamp', slug: 'use-timestamp', since: '1.0.0' }
		]
	},
	{
		title: 'State',
		items: [
			{ label: 'useSorted', slug: 'use-sorted', since: '1.0.0' },
			{ label: 'useCycleList', slug: 'use-cycle-list', since: '1.0.0' },
			{ label: 'useCountdown', slug: 'use-countdown', since: '1.0.0' },
			{ label: 'useTimeAgo', slug: 'use-time-ago', since: '1.0.0' },
			{ label: 'useToggle', slug: 'use-toggle', since: '1.0.0' },
			{ label: 'useCounter', slug: 'use-counter', since: '1.0.0' },
			{ label: 'usePrevious', slug: 'use-previous', since: '1.0.0' },
			{ label: 'useAutoResetState', slug: 'use-auto-reset-state', since: '1.1.0' },
			{ label: 'useDefaultState', slug: 'use-default-state', since: '1.1.0' },
			{ label: 'useLastChanged', slug: 'use-last-changed', since: '1.1.0' },
			{ label: 'useTrackHistory', slug: 'use-track-history', since: '1.1.0' },
			{ label: 'useHistoryState', slug: 'use-history-state', since: '1.1.0' }
		]
	},
	{
		title: 'Reactivity',
		items: [
			{ label: 'useDebounce', slug: 'use-debounce', since: '1.0.0' },
			{ label: 'useWatch', slug: 'use-watch', since: '1.1.0' },
			{ label: 'useWhenever', slug: 'use-whenever', since: '1.1.0' },
			{ label: 'useUntil', slug: 'use-until', since: '1.2.0' }
		]
	},
	{
		title: 'Browser - Keyboard & Scroll',
		items: [
			{ label: 'useMagicKeys', slug: 'use-magic-keys', since: '1.0.0' },
			{ label: 'useKeyModifier', slug: 'use-key-modifier', since: '1.0.0' },
			{ label: 'useScroll', slug: 'use-scroll', since: '1.0.0' },
			{ label: 'useScrollLock', slug: 'use-scroll-lock', since: '1.0.0' },
			{ label: 'useInfiniteScroll', slug: 'use-infinite-scroll', since: '1.2.0' }
		]
	},
	{
		title: 'Browser - Pointer & Drag',
		items: [
			{ label: 'useMouse', slug: 'use-mouse', since: '1.0.0' },
			{ label: 'useMousePressed', slug: 'use-mouse-pressed', since: '1.0.0' },
			{ label: 'useMouseInElement', slug: 'use-mouse-in-element', since: '1.2.0' },
			{ label: 'useDraggable', slug: 'use-draggable', since: '1.0.0' }
		]
	},
	{
		title: 'Browser - Observers',
		items: [
			{ label: 'useElementSize', slug: 'use-element-size', since: '1.0.0' },
			{ label: 'useElementBounding', slug: 'use-element-bounding', since: '1.2.0' },
			{ label: 'useIntersectionObserver', slug: 'use-intersection-observer', since: '1.0.0' },
			{ label: 'useResizeObserver', slug: 'use-resize-observer', since: '1.0.0' },
			{ label: 'useMutationObserver', slug: 'use-mutation-observer', since: '1.0.0' }
		]
	},
	{
		title: 'Browser - Sensors',
		items: [
			{ label: 'useMediaQuery', slug: 'use-media-query', since: '1.2.0' },
			{ label: 'useWindowSize', slug: 'use-window-size', since: '1.2.0' },
			{ label: 'useIdle', slug: 'use-idle', since: '1.0.0' },
			{ label: 'useNetwork', slug: 'use-network', since: '1.0.0' },
			{ label: 'useGeolocation', slug: 'use-geolocation', since: '1.0.0' },
			{ label: 'useBreakpoints', slug: 'use-breakpoints', since: '1.0.0' },
			{ label: 'useBrowserLocation', slug: 'use-browser-location', since: '1.0.0' },
			{ label: 'useNavigatorLanguage', slug: 'use-navigator-language', since: '1.0.0' },
			{ label: 'useOnline', slug: 'use-online', since: '1.0.0' },
			{ label: 'usePageLeave', slug: 'use-page-leave', since: '1.0.0' },
			{ label: 'useDocumentVisibility', slug: 'use-document-visibility', since: '1.1.0' },
			{ label: 'useWindowFocus', slug: 'use-window-focus', since: '1.1.0' },
			{ label: 'useDeviceMotion', slug: 'use-device-motion', since: '1.1.0' },
			{ label: 'useDeviceOrientation', slug: 'use-device-orientation', since: '1.1.0' },
			{ label: 'useDevicePixelRatio', slug: 'use-device-pixel-ratio', since: '1.1.0' },
			{ label: 'useScrollbarWidth', slug: 'use-scrollbar-width', since: '1.1.0' }
		]
	},
	{
		title: 'Browser - Storage',
		items: [
			{ label: 'useStorage', slug: 'use-storage', since: '1.2.0' },
			{ label: 'useLocalStorage', slug: 'use-local-storage', since: '1.0.0' },
			{ label: 'useIndexedDB', slug: 'use-indexed-db', since: '1.0.0' },
			{ label: 'useBase64', slug: 'use-base64', since: '1.0.0' },
			{ label: 'useObjectUrl', slug: 'use-object-url', since: '1.0.0' },
			{ label: 'useSessionStorage', slug: 'use-session-storage', since: '1.0.0' }
		]
	},
	{
		title: 'Browser - Interaction',
		items: [
			{ label: 'useClickOutside', slug: 'use-click-outside', since: '1.0.0' },
			{ label: 'useDropZone', slug: 'use-drop-zone', since: '1.0.0' },
			{ label: 'useElementHover', slug: 'use-element-hover', since: '1.0.0' },
			{ label: 'useFocus', slug: 'use-focus', since: '1.0.0' },
			{ label: 'useActiveElement', slug: 'use-active-element', since: '1.1.0' },
			{ label: 'useLongPress', slug: 'use-long-press', since: '1.1.0' },
			{ label: 'useStartTyping', slug: 'use-start-typing', since: '1.1.0' },
			{ label: 'useTextareaAutosize', slug: 'use-textarea-autosize', since: '1.2.0' },
			{ label: 'useSwipe', slug: 'use-swipe', since: '1.1.0' }
		]
	},
	{
		title: 'Browser - Appearance',
		items: [
			{ label: 'useColorMode', slug: 'use-color-mode', since: '1.2.0' },
			{ label: 'usePreferredDark', slug: 'use-preferred-dark', since: '1.2.0' },
			{ label: 'usePreferredColorScheme', slug: 'use-preferred-color-scheme', since: '1.2.0' },
			{
				label: 'usePreferredReducedMotion',
				slug: 'use-preferred-reduced-motion',
				since: '1.2.0'
			},
			{ label: 'usePreferredContrast', slug: 'use-preferred-contrast', since: '1.2.0' },
			{ label: 'useCssVar', slug: 'use-css-var', since: '1.2.0' }
		]
	},
	{
		title: 'Browser - Document',
		items: [
			{ label: 'useTitle', slug: 'use-title', since: '1.2.0' },
			{ label: 'useFavicon', slug: 'use-favicon', since: '1.2.0' },
			{ label: 'useStyleTag', slug: 'use-style-tag', since: '1.2.0' },
			{ label: 'useScriptTag', slug: 'use-script-tag', since: '1.2.0' }
		]
	},
	{
		title: 'Browser - Navigation',
		items: [
			{ label: 'useNavigationGuard', slug: 'use-navigation-guard', since: '1.1.0' },
			{ label: 'useUrlSearchParams', slug: 'use-url-search-params', since: '1.2.0' }
		]
	},
	{
		title: 'Browser - Media',
		items: [
			{ label: 'useUserMedia', slug: 'use-user-media', since: '1.2.0' },
			{ label: 'useDisplayMedia', slug: 'use-display-media', since: '1.2.0' },
			{ label: 'useDevicesList', slug: 'use-devices-list', since: '1.2.0' }
		]
	},
	{
		title: 'Performance',
		items: [
			{ label: 'useFps', slug: 'use-fps', since: '1.0.0' },
			{ label: 'useThrottleFn', slug: 'use-throttle-fn', since: '1.0.0' },
			{ label: 'useDebounceFn', slug: 'use-debounce-fn', since: '1.0.0' },
			{ label: 'useWebWorkerFn', slug: 'use-web-worker-fn', since: '1.2.0' }
		]
	},
	{
		title: 'Virtualization',
		items: [{ label: 'useVirtualList', slug: 'use-virtual-list', since: '1.0.0' }]
	},
	{
		title: 'Web APIs',
		items: [
			{ label: 'useClipboard', slug: 'use-clipboard', since: '1.0.0' },
			{ label: 'useBattery', slug: 'use-battery', since: '1.0.0' },
			{ label: 'useSpeechRecognition', slug: 'use-speech-recognition', since: '1.0.0' },
			{ label: 'useEyeDropper', slug: 'use-eye-dropper', since: '1.1.0' },
			{ label: 'useFileDialog', slug: 'use-file-dialog', since: '1.1.0' },
			{ label: 'useShare', slug: 'use-share', since: '1.1.0' },
			{ label: 'useVibrate', slug: 'use-vibrate', since: '1.1.0' },
			{ label: 'useWebNotification', slug: 'use-web-notification', since: '1.1.0' },
			{ label: 'usePermission', slug: 'use-permission', since: '1.1.0' },
			{ label: 'useWakeLock', slug: 'use-wake-lock', since: '1.1.0' },
			{ label: 'useSupported', slug: 'use-supported', since: '1.2.0' },
			{ label: 'useEventListener', slug: 'use-event-listener', since: '1.1.0' },
			{ label: 'useTextDirection', slug: 'use-text-direction', since: '1.1.0' },
			{ label: 'useTextSelection', slug: 'use-text-selection', since: '1.1.0' }
		]
	}
];

/**
 * The rendered group order: alphabetical by title.
 *
 * This is also the reading order — `allSlugs` drives the prev/next links at
 * the foot of each doc page, so the sidebar and that navigation cannot drift
 * apart. Items within a group keep their authored order.
 */
export const sidebar: SidebarGroup[] = [...groups].sort((a, b) => a.title.localeCompare(b.title));

export const allSlugs = sidebar.flatMap((g) => g.items.map((i) => i.slug));

export function findItem(slug: string): SidebarItem | undefined {
	return sidebar.flatMap((g) => g.items).find((i) => i.slug === slug);
}
