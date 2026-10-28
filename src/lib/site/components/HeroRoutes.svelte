<script lang="ts">
	/**
	 * Trade lanes fanning out from Addis Ababa: arcs draw themselves on load, then cargo "comets"
	 * travel along them for as long as the hero is on screen. Pure SVG — no images, no library.
	 */
	const hub = { x: 470, y: 360 };

	const routes = [
		{ x: 120, y: 130, bend: -170, mode: 'air', duration: 6.5 },
		{ x: 260, y: 70, bend: -120, mode: 'air', duration: 7.5 },
		{ x: 760, y: 110, bend: -150, mode: 'sea', duration: 8.5 },
		{ x: 860, y: 300, bend: -90, mode: 'air', duration: 6 },
		{ x: 760, y: 560, bend: 120, mode: 'sea', duration: 9 },
		{ x: 520, y: 640, bend: 90, mode: 'land', duration: 5.5 },
		{ x: 150, y: 520, bend: 130, mode: 'land', duration: 7 },
		{ x: 40, y: 330, bend: -80, mode: 'sea', duration: 8 }
	];

	/** A quadratic arc whose control point sits `bend` units off the chord's midpoint. */
	function arc(to: { x: number; y: number; bend: number }) {
		const mx = (hub.x + to.x) / 2;
		const my = (hub.y + to.y) / 2;
		const dx = to.x - hub.x;
		const dy = to.y - hub.y;
		const len = Math.hypot(dx, dy);
		const cx = mx + (-dy / len) * to.bend;
		const cy = my + (dx / len) * to.bend;
		return { d: `M${hub.x} ${hub.y} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${to.x} ${to.y}`, len: len * 1.25 };
	}

	const paths = routes.map((route) => ({ ...route, ...arc(route) }));
</script>

<svg viewBox="0 0 900 700" class="h-full w-full" fill="none" aria-hidden="true">
	<defs>
		<pattern id="hero-dots" width="18" height="18" patternUnits="userSpaceOnUse">
			<circle cx="1.5" cy="1.5" r="1.2" fill="white" fill-opacity="0.16" />
		</pattern>
		<radialGradient id="hero-fade" cx="52%" cy="52%" r="55%">
			<stop offset="0%" stop-color="white" />
			<stop offset="100%" stop-color="white" stop-opacity="0" />
		</radialGradient>
		<mask id="hero-mask">
			<rect width="900" height="700" fill="url(#hero-fade)" />
		</mask>
		<linearGradient id="hero-lane" x1="0" x2="1">
			<stop offset="0%" stop-color="#ff7a45" />
			<stop offset="100%" stop-color="#ffd2bb" />
		</linearGradient>
		<filter id="hero-glow" x="-50%" y="-50%" width="200%" height="200%">
			<feGaussianBlur stdDeviation="4" result="blur" />
			<feMerge>
				<feMergeNode in="blur" />
				<feMergeNode in="SourceGraphic" />
			</feMerge>
		</filter>
	</defs>

	<rect width="900" height="700" fill="url(#hero-dots)" mask="url(#hero-mask)" />

	<g mask="url(#hero-mask)">
		<circle cx={hub.x} cy={hub.y} r="150" stroke="white" stroke-opacity="0.07" />
		<circle cx={hub.x} cy={hub.y} r="260" stroke="white" stroke-opacity="0.05" stroke-dasharray="2 8" />
		<circle cx={hub.x} cy={hub.y} r="370" stroke="white" stroke-opacity="0.04" />
	</g>

	{#each paths as route, i (i)}
		<path id="lane-{i}" d={route.d} stroke="white" stroke-opacity="0.08" stroke-width="1" />
		<path
			d={route.d}
			class="draw"
			stroke="url(#hero-lane)"
			stroke-width="1.6"
			stroke-linecap="round"
			style:--len={route.len}
			style:--draw-delay="{0.6 + i * 0.12}s"
			opacity="0.75"
		/>
		<circle cx={route.x} cy={route.y} r="3.5" fill="#ff7a45" class="enter" style:--enter-delay="{1.6 + i * 0.1}s" />
		<circle cx={route.x} cy={route.y} r="10" stroke="#ff7a45" stroke-opacity="0.35" class="enter" style:--enter-delay="{1.7 + i * 0.1}s" />

		<g filter="url(#hero-glow)">
			<circle r="3" fill="#fff">
				<animateMotion dur="{route.duration}s" begin="{2 + i * 0.4}s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.45 0 0.55 1">
					<mpath href="#lane-{i}" />
				</animateMotion>
				<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur="{route.duration}s" begin="{2 + i * 0.4}s" repeatCount="indefinite" />
			</circle>
		</g>
	{/each}

	<!-- Addis Ababa -->
	<g class="enter" style:--enter-delay="0.4s">
		<circle cx={hub.x} cy={hub.y} r="34" fill="#ff7a45" fill-opacity="0.12" />
		<circle cx={hub.x} cy={hub.y} r="18" fill="#ff7a45" fill-opacity="0.25">
			<animate attributeName="r" values="14;30;14" dur="3.2s" repeatCount="indefinite" />
			<animate attributeName="fill-opacity" values="0.35;0;0.35" dur="3.2s" repeatCount="indefinite" />
		</circle>
		<circle cx={hub.x} cy={hub.y} r="7" fill="#ff7a45" filter="url(#hero-glow)" />
		<circle cx={hub.x} cy={hub.y} r="2.5" fill="#fff" />
	</g>
</svg>
