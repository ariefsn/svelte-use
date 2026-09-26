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
	/** Version this util shipped in, e.g. `'1.2.0'`. Omit for anything older. */
	since?: string;
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

export const sidebar: SidebarGroup[] = [
	{
		title: 'Animation',
		items: [
			{ label: 'useAnimate', slug: 'use-animate' },
			{ label: 'useRafFn', slug: 'use-raf-fn', since: '1.2.0' },
			{ label: 'useParallax', slug: 'use-parallax' },
			{ label: 'useTransition', slug: 'use-transition' }
		]
	},
	{
		title: 'Async',
		items: [
			{ label: 'useFetch', slug: 'use-fetch' },
			{ label: 'useWebSocket', slug: 'use-web-socket' },
			{ label: 'useAsyncState', slug: 'use-async-state' }
		]
	},
	{
		title: 'Time',
		items: [
			{ label: 'useInterval', slug: 'use-interval' },
			{ label: 'useIntervalFn', slug: 'use-interval-fn' },
			{ label: 'useNow', slug: 'use-now' },
			{ label: 'useTimeout', slug: 'use-timeout' },
			{ label: 'useTimeoutFn', slug: 'use-timeout-fn' },
			{ label: 'useTimeoutPoll', slug: 'use-timeout-poll' },
			{ label: 'useTimestamp', slug: 'use-timestamp' }
		]
	},
	{
		title: 'State',
		items: [
			{ label: 'useSorted', slug: 'use-sorted' },
			{ label: 'useCycleList', slug: 'use-cycle-list' },
			{ label: 'useCountdown', slug: 'use-countdown' },
			{ label: 'useTimeAgo', slug: 'use-time-ago' },
			{ label: 'useToggle', slug: 'use-toggle' },
			{ label: 'useCounter', slug: 'use-counter' },
			{ label: 'usePrevious', slug: 'use-previous' },
			{ label: 'useAutoResetState', slug: 'use-auto-reset-state' },
			{ label: 'useDefaultState', slug: 'use-default-state' },
			{ label: 'useLastChanged', slug: 'use-last-changed' },
			{ label: 'useTrackHistory', slug: 'use-track-history' },
			{ label: 'useHistoryState', slug: 'use-history-state' }
		]
	},
	{
		title: 'Reactivity',
		items: [
			{ label: 'useDebounce', slug: 'use-debounce' },
			{ label: 'useWatch', slug: 'use-watch' },
			{ label: 'useWhenever', slug: 'use-whenever' },
			{ label: 'useUntil', slug: 'use-until', since: '1.2.0' }
		]
	},
	{
		title: 'Browser - Keyboard & Scroll',
		items: [
			{ label: 'useMagicKeys', slug: 'use-magic-keys' },
			{ label: 'useKeyModifier', slug: 'use-key-modifier' },
			{ label: 'useScroll', slug: 'use-scroll' },
			{ label: 'useScrollLock', slug: 'use-scroll-lock' },
			{ label: 'useInfiniteScroll', slug: 'use-infinite-scroll', since: '1.2.0' }
		]
	},
	{
		title: 'Browser - Pointer & Drag',
		items: [
			{ label: 'useMouse', slug: 'use-mouse' },
			{ label: 'useMousePressed', slug: 'use-mouse-pressed' },
			{ label: 'useMouseInElement', slug: 'use-mouse-in-element', since: '1.2.0' },
			{ label: 'useDraggable', slug: 'use-draggable' }
		]
	},
	{
		title: 'Browser - Observers',
		items: [
			{ label: 'useElementSize', slug: 'use-element-size' },
			{ label: 'useElementBounding', slug: 'use-element-bounding', since: '1.2.0' },
			{ label: 'useIntersectionObserver', slug: 'use-intersection-observer' },
			{ label: 'useResizeObserver', slug: 'use-resize-observer' },
			{ label: 'useMutationObserver', slug: 'use-mutation-observer' }
		]
	},
	{
		title: 'Browser - Sensors',
		items: [
			{ label: 'useMediaQuery', slug: 'use-media-query', since: '1.2.0' },
			{ label: 'useWindowSize', slug: 'use-window-size', since: '1.2.0' },
			{ label: 'useIdle', slug: 'use-idle' },
			{ label: 'useNetwork', slug: 'use-network' },
			{ label: 'useGeolocation', slug: 'use-geolocation' },
			{ label: 'useBreakpoints', slug: 'use-breakpoints' },
			{ label: 'useBrowserLocation', slug: 'use-browser-location' },
			{ label: 'useNavigatorLanguage', slug: 'use-navigator-language' },
			{ label: 'useOnline', slug: 'use-online' },
			{ label: 'usePageLeave', slug: 'use-page-leave' },
			{ label: 'useDocumentVisibility', slug: 'use-document-visibility' },
			{ label: 'useWindowFocus', slug: 'use-window-focus' },
			{ label: 'useDeviceMotion', slug: 'use-device-motion' },
			{ label: 'useDeviceOrientation', slug: 'use-device-orientation' },
			{ label: 'useDevicePixelRatio', slug: 'use-device-pixel-ratio' },
			{ label: 'useScrollbarWidth', slug: 'use-scrollbar-width' }
		]
	},
	{
		title: 'Browser - Storage',
		items: [
			{ label: 'useStorage', slug: 'use-storage', since: '1.2.0' },
			{ label: 'useLocalStorage', slug: 'use-local-storage' },
			{ label: 'useIndexedDB', slug: 'use-indexed-db' },
			{ label: 'useBase64', slug: 'use-base64' },
			{ label: 'useObjectUrl', slug: 'use-object-url' },
			{ label: 'useSessionStorage', slug: 'use-session-storage' }
		]
	},
	{
		title: 'Browser - Interaction',
		items: [
			{ label: 'useClickOutside', slug: 'use-click-outside' },
			{ label: 'useDropZone', slug: 'use-drop-zone' },
			{ label: 'useElementHover', slug: 'use-element-hover' },
			{ label: 'useFocus', slug: 'use-focus' },
			{ label: 'useActiveElement', slug: 'use-active-element' },
			{ label: 'useLongPress', slug: 'use-long-press' },
			{ label: 'useStartTyping', slug: 'use-start-typing' },
			{ label: 'useTextareaAutosize', slug: 'use-textarea-autosize', since: '1.2.0' },
			{ label: 'useSwipe', slug: 'use-swipe' }
		]
	},
	{
		title: 'Browser - Navigation',
		items: [{ label: 'useNavigationGuard', slug: 'use-navigation-guard' }]
	},
	{
		title: 'Performance',
		items: [
			{ label: 'useFps', slug: 'use-fps' },
			{ label: 'useThrottleFn', slug: 'use-throttle-fn' },
			{ label: 'useDebounceFn', slug: 'use-debounce-fn' }
		]
	},
	{
		title: 'Virtualization',
		items: [{ label: 'useVirtualList', slug: 'use-virtual-list' }]
	},
	{
		title: 'Web APIs',
		items: [
			{ label: 'useClipboard', slug: 'use-clipboard' },
			{ label: 'useBattery', slug: 'use-battery' },
			{ label: 'useSpeechRecognition', slug: 'use-speech-recognition' },
			{ label: 'useEyeDropper', slug: 'use-eye-dropper' },
			{ label: 'useFileDialog', slug: 'use-file-dialog' },
			{ label: 'useShare', slug: 'use-share' },
			{ label: 'useVibrate', slug: 'use-vibrate' },
			{ label: 'useWebNotification', slug: 'use-web-notification' },
			{ label: 'usePermission', slug: 'use-permission' },
			{ label: 'useWakeLock', slug: 'use-wake-lock' },
			{ label: 'useSupported', slug: 'use-supported', since: '1.2.0' },
			{ label: 'useEventListener', slug: 'use-event-listener' },
			{ label: 'useTextDirection', slug: 'use-text-direction' },
			{ label: 'useTextSelection', slug: 'use-text-selection' }
		]
	}
];

export const allSlugs = sidebar.flatMap((g) => g.items.map((i) => i.slug));

export function findItem(slug: string): SidebarItem | undefined {
	return sidebar.flatMap((g) => g.items).find((i) => i.slug === slug);
}
