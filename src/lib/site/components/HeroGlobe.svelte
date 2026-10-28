<script lang="ts">
	/**
	 * A slowly swaying globe, centred on the Horn of Africa. On load it spins in to Ethiopia, the
	 * country lights up, rings of light spread out from Addis Ababa across the surface, and trade
	 * lanes arc out to the ports and markets EthioLink works with, with cargo travelling along them.
	 * Visitors can drag it around (it drifts back to Ethiopia after a while) and hover a city to see
	 * its name. Canvas + d3-geo; the map data is loaded lazily so it never blocks the first paint.
	 */
	import type { Attachment } from 'svelte/attachments';
	import { geoDistance, geoGraticule10, geoInterpolate, geoOrthographic, geoPath, geoCircle } from 'd3-geo';
	import { feature, mesh } from 'topojson-client';
	import type { Topology, GeometryCollection } from 'topojson-specification';
	import type { Feature, FeatureCollection, MultiLineString } from 'geojson';
	import { m } from '$lib/paraglide/messages.js';
	import { getLocale } from '$lib/paraglide/runtime';
	import type { GlobeCity } from '../globeCity';

	/** The destinations, already named in the visitor's language. Managed from /dashboard/globe. */
	let { cities }: { cities: GlobeCity[] } = $props();

	type LonLat = [number, number];

	const ADDIS: LonLat = [38.75, 9.03];
	const EMBER = '255,122,69';

	/** Each city's lane: when it draws, when cargo starts on it, and how high it arcs. */
	function lanes(list: GlobeCity[]) {
		return list.map((city, i) => {
			const at: LonLat = [city.longitude, city.latitude];
			const distance = geoDistance(ADDIS, at);
			return {
				name: () => city.name,
				at,
				interpolate: geoInterpolate(ADDIS, at),
				// Long hauls fly higher, like real great-circle arcs drawn above the map.
				lift: 0.04 + (distance / Math.PI) * 0.42,
				// Cargo takes longer to reach far cities, between about 3 and 8 seconds.
				dur: 3 + distance * 2.2,
				drawAt: 2.6 + i * 0.14,
				launchAt: 3.8 + i * 0.37
			};
		});
	}

	const clamp = (v: number) => Math.min(1, Math.max(0, v));
	const easeOut = (v: number) => 1 - Math.pow(1 - v, 3);
	const easeInOut = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);

	type Geo = { land: Feature | FeatureCollection; borders: MultiLineString; ethiopia: Feature };

	async function loadGeo(): Promise<Geo> {
		const topo = (await import('world-atlas/countries-110m.json')).default as unknown as Topology<{
			countries: GeometryCollection;
			land: GeometryCollection;
		}>;
		const countries = feature(topo, topo.objects.countries) as FeatureCollection;
		return {
			land: feature(topo, topo.objects.land),
			borders: mesh(topo, topo.objects.countries, (a, b) => a !== b),
			ethiopia: countries.features.find((f) => f.id === '231')!
		};
	}

	const globe: Attachment<HTMLCanvasElement> = (canvas) => {
		const routes = lanes(cities);
		const ctx = canvas.getContext('2d')!;
		const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
		const projection = geoOrthographic().clipAngle(90).precision(0.4);
		const path = geoPath(projection, ctx);
		const graticule = geoGraticule10();
		const ring = geoCircle().center(ADDIS);

		let geo: Geo | undefined;
		let width = 0;
		let height = 0;
		let frame = 0;
		let visible = true;
		let start = 0;
		let last = 0;
		let clock = 0;

		// Where the visitor has turned the globe to, on top of the scripted motion.
		const user = { lon: 0, lat: 0, vLon: 0, vLat: 0, dragging: false, releasedAt: -Infinity };
		let view = { cx: 0, cy: 0, r: 0 };
		let hovered: { name: () => string; at: LonLat } | null = null;
		let pointer: { x: number; y: number; time: number } | null = null;

		const resize = () => {
			const box = canvas.getBoundingClientRect();
			const dpr = Math.min(devicePixelRatio || 1, 2);
			width = box.width;
			height = box.height;
			canvas.width = Math.round(width * dpr);
			canvas.height = Math.round(height * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			if (reduced) draw(60);
		};

		/** Inertia after a fling, then a slow drift home once the visitor has let go for a while. */
		const settle = (dt: number) => {
			if (user.dragging) return;
			user.lon += user.vLon * dt;
			user.lat += user.vLat * dt;
			const friction = Math.exp(-2.8 * dt);
			user.vLon *= friction;
			user.vLat *= friction;
			user.lon = ((((user.lon + 180) % 360) + 360) % 360) - 180;
			if (clock - user.releasedAt > 3.5) {
				const home = Math.exp(-0.9 * dt);
				user.lon *= home;
				user.lat *= home;
			}
		};

		/** Screen position of a lane point raised `alt` above the surface, or null when behind the globe. */
		const lifted = (p: LonLat, alt: number, cx: number, cy: number, r: number, centre: LonLat) => {
			const xy = projection(p);
			if (!xy) return null;
			const x = cx + (xy[0] - cx) * (1 + alt);
			const y = cy + (xy[1] - cy) * (1 + alt);
			const front = geoDistance(p, centre) < Math.PI / 2;
			return front || Math.hypot(x - cx, y - cy) > r ? ([x, y] as const) : null;
		};

		/** Strokes the stretch of a lane between fractions `from` and `to`, skipping hidden parts. */
		const strokeLane = (
			route: ReturnType<typeof lanes>[number],
			from: number,
			to: number,
			geom: [number, number, number, LonLat]
		) => {
			const steps = Math.max(2, Math.ceil((to - from) * 64));
			let pen = false;
			ctx.beginPath();
			for (let s = 0; s <= steps; s++) {
				const f = from + ((to - from) * s) / steps;
				const pt = lifted(route.interpolate(f), Math.sin(Math.PI * f) * route.lift, ...geom);
				if (!pt) {
					pen = false;
					continue;
				}
				if (pen) ctx.lineTo(pt[0], pt[1]);
				else ctx.moveTo(pt[0], pt[1]);
				pen = true;
			}
			ctx.stroke();
		};

		function draw(t: number) {
			ctx.clearRect(0, 0, width, height);
			if (!width || !height) return;

			const intro = reduced ? 1 : easeInOut(clamp(t / 2.6));
			const cx = width / 2;
			const cy = height / 2;
			const r = Math.min(width, height) * 0.4 * (0.86 + 0.14 * easeOut(clamp(t / 2.2)));

			// Spin in from the Atlantic to the Horn, then sway gently so the lanes cross the horizon.
			const sway = reduced ? 0 : Math.sin(Math.max(0, t - 2.6) * 0.09) * 26;
			const lon = 30 - 120 * (1 - intro) + sway * intro + user.lon;
			const lat = Math.max(-70, Math.min(70, 14 + 6 * (1 - intro) + user.lat));
			view = { cx, cy, r };
			const centre: LonLat = [lon, lat];
			projection.rotate([-lon, -lat]).translate([cx, cy]).scale(r);
			const geom: [number, number, number, LonLat] = [cx, cy, r, centre];

			ctx.globalAlpha = easeOut(clamp(t / 1.2));

			// Atmosphere, then the ocean sphere lit from the upper left.
			const halo = ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 1.32);
			halo.addColorStop(0, 'rgba(120,160,255,0.16)');
			halo.addColorStop(0.35, 'rgba(90,120,220,0.06)');
			halo.addColorStop(1, 'rgba(60,90,200,0)');
			ctx.fillStyle = halo;
			ctx.fillRect(0, 0, width, height);

			const ocean = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.1, cx, cy, r);
			ocean.addColorStop(0, '#16284a');
			ocean.addColorStop(0.7, '#0b1730');
			ocean.addColorStop(1, '#070e1f');
			ctx.beginPath();
			path({ type: 'Sphere' });
			ctx.fillStyle = ocean;
			ctx.fill();

			ctx.beginPath();
			path(graticule);
			ctx.lineWidth = 0.6;
			ctx.strokeStyle = 'rgba(255,255,255,0.05)';
			ctx.stroke();

			if (geo) {
				ctx.beginPath();
				path(geo.land);
				ctx.fillStyle = 'rgba(190,210,255,0.13)';
				ctx.fill();
				ctx.lineWidth = 0.7;
				ctx.strokeStyle = 'rgba(210,225,255,0.22)';
				ctx.stroke();

				ctx.beginPath();
				path(geo.borders);
				ctx.lineWidth = 0.4;
				ctx.strokeStyle = 'rgba(210,225,255,0.09)';
				ctx.stroke();
			}

			// Light spreads out from Addis across the curve of the earth.
			const lit = reduced ? 1 : easeOut(clamp((t - 2.1) / 1));
			if (lit > 0) {
				const pulses = reduced ? [0.35, 0.7] : [0, 1, 2].map((k) => ((t - 2.1) / 4.2 + k / 3) % 1);
				for (const p of pulses) {
					if (p < 0) continue;
					ctx.beginPath();
					path(ring.radius(2 + p * 70)());
					ctx.lineWidth = 1.2 + (1 - p) * 1.6;
					ctx.strokeStyle = `rgba(${EMBER},${0.55 * (1 - p) * lit})`;
					ctx.stroke();
				}

				const hub = projection(ADDIS);
				if (hub) {
					const flare = ctx.createRadialGradient(hub[0], hub[1], 0, hub[0], hub[1], r * 0.55);
					flare.addColorStop(0, `rgba(${EMBER},${0.38 * lit})`);
					flare.addColorStop(0.3, `rgba(${EMBER},${0.12 * lit})`);
					flare.addColorStop(1, `rgba(${EMBER},0)`);
					ctx.save();
					ctx.beginPath();
					path({ type: 'Sphere' });
					ctx.clip();
					ctx.globalCompositeOperation = 'lighter';
					ctx.fillStyle = flare;
					ctx.fillRect(0, 0, width, height);
					ctx.restore();
				}

				if (geo) {
					ctx.save();
					ctx.beginPath();
					path(geo.ethiopia);
					ctx.shadowColor = `rgba(${EMBER},0.9)`;
					ctx.shadowBlur = 18 * lit;
					ctx.fillStyle = `rgba(${EMBER},${0.85 * lit})`;
					ctx.fill();
					ctx.restore();
					ctx.lineWidth = 1;
					ctx.strokeStyle = `rgba(255,214,190,${0.9 * lit})`;
					ctx.stroke();
				}
			}

			// Rim light so the globe reads as a sphere against the dark hero.
			const rim = ctx.createRadialGradient(cx, cy, r * 0.82, cx, cy, r);
			rim.addColorStop(0, 'rgba(0,0,0,0)');
			rim.addColorStop(1, 'rgba(150,185,255,0.18)');
			ctx.beginPath();
			path({ type: 'Sphere' });
			ctx.fillStyle = rim;
			ctx.fill();

			// Trade lanes: each draws itself out of Addis, then cargo keeps flowing along it.
			ctx.lineCap = 'round';
			for (const route of routes) {
				const grow = reduced ? 1 : easeOut(clamp((t - route.drawAt) / 1.4));
				if (grow <= 0) continue;

				ctx.lineWidth = 1.1;
				ctx.strokeStyle = `rgba(${EMBER},0.45)`;
				strokeLane(route, 0, grow, geom);

				if (grow >= 1) {
					const end = lifted(route.at, 0, ...geom);
					if (end) {
						const ping = reduced ? 0.5 : ((t - route.drawAt) / 2.4) % 1;
						ctx.beginPath();
						ctx.arc(end[0], end[1], 2 + ping * 9, 0, Math.PI * 2);
						ctx.strokeStyle = `rgba(${EMBER},${0.5 * (1 - ping)})`;
						ctx.stroke();
						ctx.beginPath();
						ctx.arc(end[0], end[1], 2.4, 0, Math.PI * 2);
						ctx.fillStyle = `rgb(${EMBER})`;
						ctx.fill();
					}
				}

				if (!reduced && t > route.launchAt) {
					const head = ((t - route.launchAt) / route.dur) % 1;
					const tail = Math.max(0, head - 0.18);
					ctx.lineWidth = 2;
					ctx.strokeStyle = 'rgba(255,226,210,0.85)';
					strokeLane(route, tail, head, geom);
					const pt = lifted(route.interpolate(head), Math.sin(Math.PI * head) * route.lift, ...geom);
					if (pt) {
						ctx.save();
						ctx.shadowColor = `rgb(${EMBER})`;
						ctx.shadowBlur = 12;
						ctx.beginPath();
						ctx.arc(pt[0], pt[1], 2.6, 0, Math.PI * 2);
						ctx.fillStyle = '#fff';
						ctx.fill();
						ctx.restore();
					}
				}
			}

			// Addis Ababa itself.
			const hub = projection(ADDIS);
			if (hub && lit > 0) {
				const beat = reduced ? 0.5 : (t % 2.4) / 2.4;
				ctx.beginPath();
				ctx.arc(hub[0], hub[1], 5 + beat * 16, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(${EMBER},${0.35 * (1 - beat) * lit})`;
				ctx.fill();
				ctx.save();
				ctx.shadowColor = `rgb(${EMBER})`;
				ctx.shadowBlur = 16;
				ctx.beginPath();
				ctx.arc(hub[0], hub[1], 4.5, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(${EMBER},${lit})`;
				ctx.fill();
				ctx.restore();
				ctx.beginPath();
				ctx.arc(hub[0], hub[1], 1.8, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(255,255,255,${lit})`;
				ctx.fill();
			}

			// The name of the city under the pointer.
			const label = hovered && lifted(hovered.at, 0, ...geom);
			if (hovered && label) {
				// The page's own font stack, so Amharic, Chinese and Arabic names render properly;
				// letter-spacing would break up Arabic and Ethiopic script, so it is Latin only.
				const latin = getLocale() === 'en';
				ctx.font = `600 ${latin ? 11 : 13}px ${getComputedStyle(canvas).fontFamily}`;
				ctx.letterSpacing = latin ? '1.5px' : '0px';
				ctx.direction = 'ltr';
				ctx.textAlign = 'left';
				const text = latin ? hovered.name().toUpperCase() : hovered.name();
				const w = ctx.measureText(text).width + 20;
				const x = Math.min(label[0] + 12, width - w - 4);
				const y = label[1] - 30;
				ctx.beginPath();
				ctx.roundRect(x, y, w, 24, 12);
				ctx.fillStyle = 'rgba(6,12,24,0.85)';
				ctx.fill();
				ctx.lineWidth = 1;
				ctx.strokeStyle = `rgba(${EMBER},0.6)`;
				ctx.stroke();
				ctx.fillStyle = '#fff';
				ctx.textBaseline = 'middle';
				ctx.fillText(text, x + 10, y + 12.5);
				ctx.letterSpacing = '0px';
			}

			ctx.globalAlpha = 1;
		}

		const redraw = () => reduced && draw(60);
		const local = (e: PointerEvent) => {
			const box = canvas.getBoundingClientRect();
			return { x: e.clientX - box.left, y: e.clientY - box.top };
		};
		const onGlobe = (x: number, y: number) => Math.hypot(x - view.cx, y - view.cy) <= view.r * 1.04;

		const places = [{ name: m.city_addis, at: ADDIS }, ...routes];
		const findPlace = (x: number, y: number) => {
			const centre = projection.invert?.([view.cx, view.cy]);
			let best: (typeof places)[number] | null = null;
			let bestDistance = 14;
			for (const place of places) {
				if (centre && geoDistance(place.at, centre) > Math.PI / 2) continue;
				const xy = projection(place.at);
				const d = xy ? Math.hypot(xy[0] - x, xy[1] - y) : Infinity;
				if (d < bestDistance) [best, bestDistance] = [place, d];
			}
			return best;
		};

		const down = (e: PointerEvent) => {
			const { x, y } = local(e);
			if (!onGlobe(x, y)) return;
			canvas.setPointerCapture(e.pointerId);
			user.dragging = true;
			user.vLon = user.vLat = 0;
			hovered = null;
			pointer = { x, y, time: performance.now() };
			canvas.style.cursor = 'grabbing';
		};

		const move = (e: PointerEvent) => {
			const { x, y } = local(e);
			if (user.dragging && pointer) {
				const now = performance.now();
				const dt = Math.max(1, now - pointer.time) / 1000;
				// One pixel near the middle of the globe is about this many degrees.
				const k = 57.3 / Math.max(view.r, 1);
				const dLon = -(x - pointer.x) * k;
				const dLat = (y - pointer.y) * k;
				user.lon += dLon;
				user.lat = Math.max(-60, Math.min(60, user.lat + dLat));
				user.vLon = dLon / dt;
				user.vLat = dLat / dt;
				pointer = { x, y, time: now };
				redraw();
				return;
			}
			const place = e.pointerType === 'mouse' ? findPlace(x, y) : null;
			if (place !== hovered) {
				hovered = place;
				redraw();
			}
			canvas.style.cursor = place ? 'pointer' : onGlobe(x, y) ? 'grab' : '';
		};

		const up = (e: PointerEvent) => {
			if (!user.dragging) return;
			user.dragging = false;
			user.releasedAt = clock;
			// A pointer that stopped before letting go shouldn't fling the globe.
			if (pointer && performance.now() - pointer.time > 80) user.vLon = user.vLat = 0;
			pointer = null;
			canvas.releasePointerCapture(e.pointerId);
			canvas.style.cursor = 'grab';
		};

		const leave = () => {
			if (user.dragging) return;
			hovered = null;
			redraw();
		};

		canvas.addEventListener('pointerdown', down);
		canvas.addEventListener('pointermove', move);
		canvas.addEventListener('pointerup', up);
		canvas.addEventListener('pointercancel', up);
		canvas.addEventListener('pointerleave', leave);

		const loop = (now: number) => {
			clock = (now - start) / 1000;
			settle(Math.min(0.05, (now - (last || now)) / 1000));
			last = now;
			draw(clock);
			if (visible) frame = requestAnimationFrame(loop);
			else frame = last = 0;
		};

		const sizer = new ResizeObserver(resize);
		sizer.observe(canvas);

		// Stop drawing while the hero is scrolled away.
		const watcher = new IntersectionObserver(([entry]) => {
			visible = entry.isIntersecting;
			if (visible && geo && !reduced && !frame) frame = requestAnimationFrame(loop);
		});
		watcher.observe(canvas);

		// The clock starts once the map is in, so the spin-in always shows the continents.
		loadGeo().then((data) => {
			geo = data;
			start = performance.now();
			if (reduced) draw(60);
			else if (visible && !frame) frame = requestAnimationFrame(loop);
		});

		return () => {
			cancelAnimationFrame(frame);
			sizer.disconnect();
			watcher.disconnect();
			canvas.removeEventListener('pointerdown', down);
			canvas.removeEventListener('pointermove', move);
			canvas.removeEventListener('pointerup', up);
			canvas.removeEventListener('pointercancel', up);
			canvas.removeEventListener('pointerleave', leave);
		};
	};
</script>

<!-- Vertical swipes still scroll the page on touch screens; sideways ones turn the globe. -->
<canvas class="h-full w-full touch-pan-y select-none" aria-hidden="true" {@attach globe}></canvas>
