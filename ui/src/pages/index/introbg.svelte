<script>
	import { onMount } from 'svelte';
	import Context2d from 'fire/dom/Context2d';
	import { sineIn, quintIn, quintOut } from 'chnobli/easing';

	let canvas, ctx;

	let mouse = null;

	async function render() {
		ctx.clearRect(0, 0, ctx.width, ctx.height);

		const w = ctx.width;
		const h = ctx.height;
		ctx.strokeStyle = 'white';
		ctx.fillStyle = 'white';
		ctx.lineWidth = 1;

		const ss = 30;

		const squaresY = Math.ceil(h / ss);
		const squaresX = Math.ceil(w / ss);

		const hoverRadius = 300;

		// let's just render a few squares
		for (let y = 0; y < squaresY; y++) {
			for (let x = 0; x < squaresX; x++) {
				let size = 2;

				const circleX = x * ss + ss / 2;
				const circleY = y * ss + ss / 2;

				if (mouse) {
					const dist = Math.sqrt(
						Math.pow(mouse.x - circleX, 2) +
							Math.pow(mouse.y - circleY, 2),
					);

					const relDist = Math.max(
						Math.min(dist / hoverRadius, 1),
						0,
					);

					size = sineIn(1 - relDist) * 2 + size;
				}

				ctx.fillCircle(circleX, circleY, size);
			}
		}

		requestAnimationFrame(() => render());
	}

	function onResize() {
		ctx.updateSize(window.innerWidth, window.innerHeight * 1.1);
	}

	function onMouseMove(e) {
		mouse = {
			x: e.pageX,
			y: Math.min(e.pageY, window.innerHeight),
		};
	}

	onMount(() => {
		ctx = new Context2d(canvas);
		onResize();

		render();
	});
</script>

<svelte:window on:resize={onResize} on:mousemove={onMouseMove} />

<canvas bind:this={canvas} />

<style lang="scss">
	canvas {
		width: 100%;
		height: 100%;
		opacity: 0.05;
	}
</style>
