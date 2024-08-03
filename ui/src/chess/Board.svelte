<script lang="ts">
	import { timeout } from 'chuchi-utils';
	import Context2d from 'chuchi-legacy/dom/Context2d';
	import BoardView from './BoardView';
	import { Board, Move } from './types';
	import type { Wasm } from '@/lib/wasm';
	// import { applyMove } from './api/api.js';

	// should be a Board (see api)
	// export let board;
	let {
		board,
		wasm,
		onmove,
	}: { board: Board; wasm: Wasm; onmove: (move: Move) => void } = $props();

	let view: BoardView = $state(null as any);
	let canvas: HTMLCanvasElement;

	async function newCanvas(el: HTMLCanvasElement) {
		canvas = el;
		const ctx = new Context2d(el);
		ctx.updateSize(600, 600);

		view = new BoardView(ctx, wasm);

		view.onMove(onmove);

		// load sprite
		await timeout(300);

		await view.updateBoard(board);

		requestAnimationFrame(draw);
	}

	$effect(() => {
		if (view) view.updateBoard(board);
	});

	function draw() {
		view.draw();

		requestAnimationFrame(draw);
	}

	// click handling
	let mouseDown = false;

	// might return [null, null] if the xy is invalid
	function getMouseCanvasXY(ev: any) {
		const offset = canvas.getBoundingClientRect();
		let x: number | null = ev.clientX - offset.left;
		let y: number | null = ev.clientY - offset.top;

		if (x > offset.width || y > offset.height) {
			x = null;
			y = null;
		}

		return [x, y];
	}

	function onMouseDown(e: any) {
		mouseDown = true;
		const [x, y] = getMouseCanvasXY(e);

		if (x !== null) view.mouseDown(x, y);
	}

	function onMouseUp(e: any) {
		mouseDown = false;
		const [x, y] = getMouseCanvasXY(e);

		if (x !== null) view.mouseUp(x, y);
	}

	function onMouseMove(e: any) {
		if (!mouseDown) return;

		const [x, y] = getMouseCanvasXY(e);

		if (x !== null) view.mouseMove(x, y);
	}
</script>

<svelte:window on:mousemove={onMouseMove} on:mouseup={onMouseUp} />

<canvas id="canvas" use:newCanvas onmousedown={onMouseDown}></canvas>
