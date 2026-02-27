export interface SidebarItem {
	label: string;
	slug: string;
}

export interface SidebarGroup {
	title: string;
	items: SidebarItem[];
}

export const sidebar: SidebarGroup[] = [
	{
		title: 'State',
		items: [
			{ label: 'useSorted', slug: 'use-sorted' },
			{ label: 'useCycleList', slug: 'use-cycle-list' },
			{ label: 'useCountdown', slug: 'use-countdown' },
			{ label: 'useTimeAgo', slug: 'use-time-ago' }
		]
	},
	{
		title: 'Browser – Keyboard & Scroll',
		items: [
			{ label: 'useMagicKeys', slug: 'use-magic-keys' },
			{ label: 'useKeyModifier', slug: 'use-key-modifier' },
			{ label: 'useScroll', slug: 'use-scroll' },
			{ label: 'useScrollLock', slug: 'use-scroll-lock' }
		]
	},
	{
		title: 'Browser – Pointer & Drag',
		items: [
			{ label: 'useMouse', slug: 'use-mouse' },
			{ label: 'useMousePressed', slug: 'use-mouse-pressed' },
			{ label: 'useDraggable', slug: 'use-draggable' }
		]
	},
	{
		title: 'Browser – Observers',
		items: [
			{ label: 'useElementSize', slug: 'use-element-size' },
			{ label: 'useIntersectionObserver', slug: 'use-intersection-observer' },
			{ label: 'useResizeObserver', slug: 'use-resize-observer' },
			{ label: 'useMutationObserver', slug: 'use-mutation-observer' }
		]
	},
	{
		title: 'Browser – Sensors',
		items: [
			{ label: 'useIdle', slug: 'use-idle' },
			{ label: 'useNetwork', slug: 'use-network' },
			{ label: 'useGeolocation', slug: 'use-geolocation' }
		]
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
			{ label: 'useSpeechRecognition', slug: 'use-speech-recognition' }
		]
	}
];

export const allSlugs = sidebar.flatMap((g) => g.items.map((i) => i.slug));

export function findItem(slug: string): SidebarItem | undefined {
	return sidebar.flatMap((g) => g.items).find((i) => i.slug === slug);
}
