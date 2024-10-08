<script lang="ts">
	import { timeout } from 'chuchi-utils';
	import Context2d from 'chuchi-legacy/dom/Context2d';
	import BoardView from './BoardView';
	import { Board, Move } from './types';
	import type { Wasm } from '@/lib/wasm';
	import { Writable } from 'chuchi/stores';
	// import { applyMove } from './api/api.js';

	// should be a Board (see api)
	// export let board;
	let {
		board,
		wasm,
		onmove,
		onpiecemove,
		playingSide,
	}: {
		board: Writable<Board>;
		wasm: Wasm;
		onmove: (move: Move) => void;
		onpiecemove: (board: Board) => void;
		playingSide: 'White' | 'Black';
	} = $props();

	let view: BoardView = $state(null as any);
	let canvas: HTMLCanvasElement;

	async function newCanvas(el: HTMLCanvasElement) {
		canvas = el;
		const ctx = new Context2d(el);
		// ctx.updateSize(600, 600);
		ctx.updateSize();

		view = new BoardView(ctx, wasm);

		view.onMove(onmove);
		view.setBoard = nBoard => ($board = nBoard);

		// load sprite
		await timeout(300);

		await view.updateBoard($board);

		requestAnimationFrame(draw);
	}

	$effect(() => {
		if (!view) return;

		view.updateBoard($board);
		view.playingSide = playingSide;
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

	function onResize() {
		view.resize();
	}
</script>

<svelte:window
	on:mousemove={onMouseMove}
	on:mouseup={onMouseUp}
	on:resize={onResize}
/>

<canvas id="canvas" use:newCanvas onmousedown={onMouseDown}></canvas>

<style lang="scss">
	canvas {
		width: 100%;
		height: 100%;
	}
</style>
