import { useState, useRef, useLayoutEffect, useMemo } from 'react';

interface IItem {
	id: string;
	text: string;
}

const ITEMS_COUNT = 10_000;
const ITEM_HEIGHT = 40;
const CONTAINER_HEIGHT = 600;
const OVER_SCAN = 3;

const generateItems = (): IItem[] => {
	return Array.from({ length: ITEMS_COUNT }, (_, index) => ({
		id: Math.random().toString(36).slice(2),
		text: String(index)
	}));
};

const ITEMS = generateItems();

const App: React.FC = () => {
	// const [items, setItems] = useState<IItem[]>(() => createItems());
	const [scrollTop, setScrollTop] = useState<number>(0);

	const scrollContainerRef = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		const scrollContainerEl = scrollContainerRef.current;

		if (!scrollContainerEl) return;

		const scrollHandle: EventListener = (e: Event) => {
			setScrollTop((e.target as HTMLElement).scrollTop);
		};

		scrollContainerEl.addEventListener('scroll', scrollHandle);

		return () => {
			scrollContainerEl.removeEventListener('scroll', scrollHandle);
		};
	}, []);

	const virtualItems = useMemo(() => {
		const rangeStart = scrollTop;
		const rangeEnd = scrollTop + CONTAINER_HEIGHT;

		let startIndex = Math.floor(rangeStart / ITEM_HEIGHT);
		let endIndex = Math.ceil(rangeEnd / ITEM_HEIGHT);

		startIndex = Math.max(0, startIndex - OVER_SCAN);
		endIndex = Math.min(ITEMS.length - 1, endIndex + OVER_SCAN);

		const virtualItems = [];

		for (let index = startIndex; index <= endIndex; index++) {
			virtualItems.push({
				index,
				offsetTop: index * ITEM_HEIGHT
			});
		}

		return virtualItems;
	}, [scrollTop]);

	const scrollHeight = ITEM_HEIGHT * ITEMS.length;

	return (
		<div style={{ height: '100%', padding: 30 }}>
			<h1>Table</h1>

			<div
				ref={scrollContainerRef}
				style={{
					height: CONTAINER_HEIGHT,
					position: 'relative',
					overflowY: 'scroll'
				}}>
				<div
					style={{
						height: scrollHeight
					}}>
					{virtualItems.map(virtualItem => {
						const item = ITEMS[virtualItem.index];
						return (
							<div
								key={item.id}
								style={{
									height: ITEM_HEIGHT,
									position: 'absolute',
									top: 0,
									transform: `translateY(${virtualItem.offsetTop}px)`
								}}>
								{item.text}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};
export default App;
