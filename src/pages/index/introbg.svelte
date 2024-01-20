<script>
	import { onMount, onDestroy } from 'svelte';
	import Context2d from 'fire/dom/context2d.js';

	let canvas, ctx;

	function render() {
		ctx.clearRect(0, 0, ctx.width, ctx.height);

		const w = ctx.width;
		const h = ctx.height;
		ctx.strokeStyle = 'rgba(255, 255, 255, .05)';
		ctx.lineWidth = 1;

		const ss = 40;

		const squaresY = Math.ceil(h / ss);
		const squaresX = Math.ceil(w / ss);

		// let's just render a few squares
		for (let y = 0; y < squaresY; y++) {
			for (let x = 0; x < squaresX; x++) {
				ctx.beginPath();
				ctx.moveTo(x * ss + ss, y * ss);
				ctx.lineTo(x * ss + ss, y * ss + ss);
				ctx.lineTo(x * ss, y * ss + ss);
				ctx.stroke();
				ctx.closePath();
			}
		}
	}

	onMount(() => {
		ctx = new Context2d(canvas);
		ctx.updateSize();

		render();
	});
</script>

<svelte:window on:resize={() => render()} />

<canvas bind:this={canvas} />


<style lang="scss">
	canvas {
		width: 100%;
		height: 100%;
	}
</style>