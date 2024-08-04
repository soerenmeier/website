<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { load, Wasm } from '@/lib/wasm';
	import Connection from '@/chess/Connection';
	import { Board, Move } from '@/chess/types';
	import BoardComp from '@/chess/Board.svelte';
	import Duration from 'chuchi-legacy/time/Duration';
	import { Writable } from 'chuchi/stores';
	import Toasts from './Toasts.svelte';

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

	<!-- todo add waiting? -->
	<p class="turn">
		{#if $board?.nextMove !== playingSide}
			Waiting for
		{/if}
		<strong>
			{$board?.nextMove}
		</strong>
		to move
		{#if $board?.movedPiece}
			<strong>the duck</strong>
		{/if}
	</p>

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
					/>

					<button class="btn-style inverted" type="submit">
						Start
					</button>
				</form>
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

			<p class="move">
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

	.history {
		margin-top: 1rem;
	}

	.move {
		display: grid;
		grid-template-columns: 2fr 1fr 1fr;
		margin-top: 0.1rem;
	}
</style>
