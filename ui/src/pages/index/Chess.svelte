<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { load, Wasm } from '@/lib/wasm';
	import Connection from '@/chess/Connection';
	import { Board, Move } from '@/chess/types';
	import BoardComp from '@/chess/Board.svelte';
	import Duration from 'chuchi-legacy/time/Duration';
	import { Writable } from 'chuchi/stores';
	import Toasts from './Toasts.svelte';
	import Confetti from 'svelte-confetti';

	const conn = new Connection();
	const board = conn.board;
	const history = conn.history;
	let wasm = $state();
	let name = $state('');
	let started = $state(false);

	let extendedHistory = $derived.by(() => {
		if (!wasm || !$history) return null;

		return (wasm as Wasm).extendedHistory($history);
	});

	let playingSide: 'White' | 'Black' = $state('White');

	$effect(() => {
		const hist = $history;
		if (!hist) return;

		// if we haven't played yet, just choose the side which should play now
		// once we have played a move
		// we will never change side, until the game is finished

		const didIPlay = hist.didConPlay(conn.id);
		if (didIPlay) return;

		playingSide = $board!.nextMove;
	});

	function onMove(move: Move) {
		conn.makeMove(name, $history!.moves.length, move);
	}

	function onSubmit(e: Event) {
		e.preventDefault();
		started = true;

		if (typeof sa_event === 'function') {
			sa_event('play_chess', { name });
		}
	}

	function onPlayAgain() {
		conn.restart();
	}

	const now = new Writable(Date.now());
	const timeInterval = setInterval(() => {
		now.set(Date.now());
	}, 5000);

	onMount(() => {
		conn.connect();
		load().then(wa => {
			wasm = wa;
		});

		return () => {
			clearInterval(timeInterval);
			conn.disconnect();
		};
	});
</script>

<Toasts getId={() => conn.id} {extendedHistory} />

<div class="box">
	<h2 class="box-h2">Play Chess</h2>
	<p>
		Play duck chess with other visitors, the board is updated in real time
		but the state get's stored so you can come back at a later time.
	</p>

	{#if $board && !$board.hasEnded()}
		<p class="turn">
			{#if $board.nextMove !== playingSide}
				Waiting for
			{/if}
			<strong>
				{$board.nextMove}
			</strong>
			to move
			{#if $board.movedPiece}
				<strong>the duck</strong>
			{/if}
		</p>
	{/if}

	<!-- who is online, which turn is it, does the duck need to be moved?, games played, live players highscore? -->

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
						required
					/>

					<button class="btn-style inverted" type="submit">
						Start
					</button>
				</form>
			</div>
		{/if}

		{#if $board?.hasEnded()}
			<div class="end-screen">
				{#if $board.winner === playingSide}
					<div class="confetti">
						<!-- not really perfect but let's leave it like this for the moment -->
						<Confetti x={[-2, 2]} y={[2, -2]} amount={300} />
					</div>
				{/if}

				<div class="end-center">
					<p>
						{$board.winner} won the game
					</p>

					<button class="btn-style inverted" onclick={onPlayAgain}>
						Play again
					</button>
				</div>
			</div>
		{/if}

		<div class="inner">
			{#if $board && wasm}
				<BoardComp {board} {wasm} {playingSide} onmove={onMove} />
			{:else}
				<p>Loading...</p>
			{/if}
		</div>
	</div>

	<div class="history">
		{#each (extendedHistory ?? []).slice().reverse() as move}
			{@const dur = new Duration(move.time.time - $now)}

			<p class="move" class:ending-move={move.board.hasEnded()}>
				<span class="name">{move.name}</span>
				<span class="pgn">{move.pgn}</span>
				<span class="time">{dur.toStr('en')}</span>
			</p>
		{/each}
	</div>
</div>

<style lang="scss">
	.turn {
		margin-top: 2rem;
		margin-bottom: 1rem;
		font-size: 2rem;
		text-align: center;

		strong {
			font-weight: 700;
		}
	}

	.board {
		position: relative;
		padding-bottom: 100%;
		margin-top: 1rem;
	}

	.start-screen,
	.end-screen {
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

	.confetti {
		position: absolute;
		top: 50%;
		left: 50%;
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

	.end-center {
		display: flex;
		text-align: center;
		justify-content: center;
		flex-direction: column;
		align-items: center;
		gap: 1rem;

		p {
			font-size: 2rem;
			font-weight: 700;
		}
	}

	.inner {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	.history {
		margin-top: 1rem;
	}

	.move {
		display: grid;
		grid-template-columns: 2fr 1fr 1fr;
		margin-top: 0.1rem;

		&.ending-move {
			.pgn {
				font-weight: 700;
			}
		}
	}
</style>
