import type { Attachment } from 'svelte/attachments';

/**
 * Scroll-driven motion for the public site. Each helper is an attachment (`{@attach reveal()}`);
 * the CSS that does the moving lives in `routes/layout.css`.
 */

const reducedMotion = () =>
	typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** One observer for the whole page: elements get `is-in` the first time they scroll into view. */
let observer: IntersectionObserver | undefined;
const onEnter = new WeakMap<Element, () => void>();

function sharedObserver() {
	observer ??= new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				entry.target.classList.add('is-in');
				onEnter.get(entry.target)?.();
				observer?.unobserve(entry.target);
			}
		},
		{ threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
	);
	return observer;
}

/** Adds `is-in` when the element enters the viewport; pair with `data-reveal` or `.rise` children. */
export function reveal(delay = 0): Attachment<HTMLElement> {
	return (node) => {
		if (delay) node.style.setProperty('--reveal-delay', `${delay}ms`);
		const io = sharedObserver();
		io.observe(node);
		return () => io.unobserve(node);
	};
}

/** Counts the digits in an element's text up from zero once it is seen: "20+" → 0+ … 20+. */
export function countUp(duration = 1600): Attachment<HTMLElement> {
	return (node) => {
		const text = node.textContent ?? '';
		const target = Number(text.match(/\d+/)?.[0]);
		if (!target || reducedMotion()) return;

		let frame = 0;
		const render = (value: number) => (node.textContent = text.replace(/\d+/, String(value)));
		render(0);
		onEnter.set(node, () => {
			const start = performance.now();
			const tick = (now: number) => {
				const t = Math.min(1, (now - start) / duration);
				render(Math.round(target * (1 - Math.pow(1 - t, 4))));
				if (t < 1) frame = requestAnimationFrame(tick);
			};
			frame = requestAnimationFrame(tick);
		});
		const io = sharedObserver();
		io.observe(node);
		return () => {
			cancelAnimationFrame(frame);
			io.unobserve(node);
			render(target);
		};
	};
}

/** Moves the element against the scroll, `speed` of the distance from the viewport's centre. */
export function parallax(speed = 0.15): Attachment<HTMLElement> {
	return (node) => {
		if (reducedMotion()) return;
		let frame = 0;
		const update = () => {
			frame = 0;
			const rect = node.parentElement?.getBoundingClientRect() ?? node.getBoundingClientRect();
			const offset = (rect.top + rect.height / 2 - innerHeight / 2) * -speed;
			node.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
		};
		const schedule = () => (frame ||= requestAnimationFrame(update));
		update();
		addEventListener('scroll', schedule, { passive: true });
		addEventListener('resize', schedule);
		return () => {
			cancelAnimationFrame(frame);
			removeEventListener('scroll', schedule);
			removeEventListener('resize', schedule);
		};
	};
}

/** Tracks the pointer inside the element as `--mx` / `--my`, for a light that follows it. */
export const spotlight: Attachment<HTMLElement> = (node) => {
	const move = (event: PointerEvent) => {
		const rect = node.getBoundingClientRect();
		node.style.setProperty('--mx', `${event.clientX - rect.left}px`);
		node.style.setProperty('--my', `${event.clientY - rect.top}px`);
	};
	node.addEventListener('pointermove', move);
	return () => node.removeEventListener('pointermove', move);
};
