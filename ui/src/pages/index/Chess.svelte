<script lang="ts">
	import { onMount } from 'svelte';
	import { load } from '@/lib/wasm';
	import Connection from '@/chess/Connection';
	import { Board } from '@/chess/types';
	import BoardComp from '@/chess/Board.svelte';

	const conn = new Connection();
	const board = conn.board;
	let wasm = $state();

	console.log('board', board);

	// open a ws connection
	// find out

	$effect(() => {
		console.log('new board', $board);
	});

	onMount(() => {
		conn.connect();
		load().then(wa => {
			wasm = wa;
		});

		return () => conn.disconnect();
	});
</script>

<div class="box">
	<h2 class="box-h2">Play Chess</h2>
	<p>
		Play live with another visitor
		<br />
		To play enter you're name
		<br />
		Sören is currently online
	</p>

	{#if $board && wasm}
		<BoardComp board={$board} {wasm} />
	{/if}
</div>
