<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { load } from '@/lib/wasm';
	import Connection from '@/chess/Connection';
	import { Board, Move } from '@/chess/types';
	import BoardComp from '@/chess/Board.svelte';

	const conn = new Connection();
	const board = conn.board;
	const history = conn.history;
	let wasm = $state();
	let name = $state('');
	let started = $state(false);

	let playingSide: 'White' | 'Black' = $state('White');

	$effect(() => {
		const hist = $history;
		if (!hist) return;

		// if we haven't played yet, just choose the side which should play now
		// once we have played a move
		// we will never change side, until the game is finished

		const didIPlay = hist.didConPlay(conn.id);
		console.log('didIPlay', didIPlay);
		// if (didIPlay) return undefined;
		if (didIPlay) return;

		playingSide = $board.nextMove;
	});
	$inspect(playingSide, 'playingSide');
	// $effect(() => console.log('playingSide', playingSide));

	console.log('board', board);

	// open a ws connection
	// find out

	$effect(() => {
		console.log('new board or history', $board, $history);
	});

	function onMove(move: Move) {
		// make move
		console.log('make move', move);
		conn.makeMove(name, $history.moves.length, move);
	}

	function onSubmit(e: Event) {
		e.preventDefault();
		started = true;
	}

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
		Play duck chess with other visitors, the board is updated in real time
		but the state get's stored so you can come back at a later time.
		<br />
		Sören is currently online
	</p>

	<!-- games played, live players highscore? -->

	<div class="board">
		{#if !started}
			<div class="start-screen">
				<form class="name-form" onsubmit={onSubmit}>
					<p>To play enter you're name</p>
					<input
						type="text"
						class="input-style"
						placeholder="Enter your name"
						bind:value={name}
					/>

					<button class="btn-style inverted" type="submit">
						Start
					</button>
				</form>
			</div>
		{/if}

		<div class="inner">
			{#if $board && wasm}
				<BoardComp
					board={$board}
					{wasm}
					{playingSide}
					onmove={onMove}
				/>
			{:else}
				<p>Loading...</p>
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	.board {
		position: relative;
		padding-bottom: 100%;
	}

	.start-screen {
		position: absolute;
		display: flex;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		justify-content: center;
		align-items: center;
		background-color: rgb(0 0 0 / 50%);
		z-index: 10;
	}

	.name-form {
		display: flex;
		text-align: center;
		justify-content: center;
		flex-direction: column;
		align-items: center;
		gap: 1rem;

		p {
			font-size: 1.25rem;
			font-weight: 700;
		}

		input {
			text-align: center;
		}
	}

	.inner {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
</style>
