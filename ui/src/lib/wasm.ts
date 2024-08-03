import { PieceMove, type Board } from '@/chess/types.js';
import init, { available_moves } from '../../../wasm/js/wasm.js';

export type AvailableMoves =
	| { kind: 'Piece'; moves: PieceMove[] }
	| { kind: 'Duck'; squares: string[] };

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
}

let wasm: Wasm | null = null;

export async function load(): Promise<Wasm> {
	if (wasm) return wasm;

	const mod = await init();
	wasm = new Wasm(mod);

	return wasm;
}
