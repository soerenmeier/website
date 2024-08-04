import { Board, Move, PieceMove, History } from '@/chess/types.js';
import init, {
	available_moves,
	move_piece,
	extended_history,
} from '../../../wasm/js/wasm.js';
import type DateTime from 'chuchi-legacy/time/DateTime';

export type AvailableMoves =
	| { kind: 'Piece'; moves: PieceMove[] }
	| { kind: 'Duck'; squares: string[] };

export type ExtendedHistoryMove = {
	conId: string;
	name: string;
	board: Board;
	move: Move;
	pgn: string;
	time: DateTime;
};

export class Wasm {
	constructor(mod: any) {}

	availableMoves(board: Board): AvailableMoves {
		const moves = available_moves(board);
		console.log('moves', moves);
		switch (moves.kind) {
			case 'Piece':
				moves.moves = moves.moves.map((m: any) => new PieceMove(m));
				break;
		}

		return moves;
	}

	movePiece(board: Board, move: PieceMove): Board {
		board = move_piece(board, move.toJSON());
		board = new Board(board);

		return board;
	}

	extendedHistory(history: History): ExtendedHistoryMove[] {
		const moves = history.moves.map(m => m.move.toJSON());

		const nMoves = extended_history(moves);

		return nMoves.map((m: any, i: number) => {
			const hm = history.moves[i];

			return {
				conId: hm.conId,
				name: hm.name,
				board: new Board(m.board),
				move: new Move(m.move),
				pgn: m.pgn,
				time: hm.time,
			};
		});
	}
}

let wasm: Wasm | null = null;

export async function load(): Promise<Wasm> {
	if (wasm) return wasm;

	const mod = await init();
	wasm = new Wasm(mod);

	return wasm;
}

export function tryGlobal(): Wasm | null {
	return wasm;
}
