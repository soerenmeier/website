// import Data from 'fire/data/data.js';
// import { Option } from 'fire/data/parsetypes.js';
import { tryGlobal } from '@/lib/wasm';
import DateTime from 'chuchi-legacy/time/DateTime';
import { range } from 'chuchi-utils';

export class Board {
	board: (Piece | null)[];
	canCastle: CanCastle;
	enPassant!: string | null;
	nextMove!: 'White' | 'Black';
	movedPiece!: boolean;

	constructor(d: any) {
		Object.assign(this, d);
		this.board = d.board.map((p: any) => (p ? new Piece(p) : null));
		this.canCastle = new CanCastle(d.canCastle);
	}

	static empty() {
		return new Board({
			board: range(0, 64).map(() => null),
			canCastle: { white: [true, true], black: [true, true] },
			enPassant: null,
			nextMove: 'White',
			movedPiece: false,
		});
	}

	getPiece(i: number) {
		return this.board[i];
	}

	// returns the index or -1
	duckPosition(): number {
		return this.board.findIndex(p => p?.kind === 'Duck');
	}

	eq(b: Board): boolean {
		return (
			this.board.every((p, i) => {
				const bp = b.board[i];
				if (!p || !bp) return p === bp;

				return p.eq(bp);
			}) &&
			this.canCastle.eq(b.canCastle) &&
			this.enPassant === b.enPassant &&
			this.nextMove === b.nextMove &&
			this.movedPiece === b.movedPiece
		);
	}
}

export class Piece {
	kind!: string;
	side!: 'White' | 'Black';

	constructor(d: any) {
		Object.assign(this, d);
	}

	eq(b: Piece): boolean {
		return this.kind === b.kind && this.side === b.side;
	}
}

export class CanCastle {
	white!: [boolean, boolean];
	black!: [boolean, boolean];

	constructor(d: any) {
		Object.assign(this, d);
	}

	eq(b: CanCastle): boolean {
		return (
			this.white[0] === b.white[0] &&
			this.white[1] === b.white[1] &&
			this.black[0] === b.black[0] &&
			this.black[1] === b.black[1]
		);
	}
}

const possiblePieceMoves = ['Piece', 'EnPassant', 'Castle'];

type PieceMoveData =
	| {
			kind: 'Piece';
			piece: string;
			from: string;
			to: string;
			capture: string | null;
			promotion: string | null;
	  }
	| {
			kind: 'EnPassant';
			from: string;
			to: string;
	  }
	| {
			kind: 'Castle';
			fromKing: string;
			toKing: string;
			fromRook: string;
			toRook: string;
	  };

export class PieceMove {
	inner!: PieceMoveData;

	constructor(d: any) {
		this.inner = {} as any;
		Object.assign(this.inner, d);
	}

	// on castling returns the king
	fromSquare() {
		switch (this.inner.kind) {
			case 'Piece':
			case 'EnPassant':
				return this.inner.from;
			case 'Castle':
				return this.inner.fromKing;
		}
	}

	toSquare() {
		switch (this.inner.kind) {
			case 'Piece':
			case 'EnPassant':
				return this.inner.to;
			case 'Castle':
				return this.inner.toKing;
		}
	}

	toJSON() {
		return this.inner;
	}
}

export class Move {
	piece: PieceMove;
	duck: string;
	side: string;

	constructor(d: any) {
		this.piece = new PieceMove(d.piece);
		this.duck = d.duck;
		this.side = d.side;
	}

	static new(piece: PieceMove, duck: string, side: string): Move {
		const move = Object.create(this.prototype);
		move.piece = piece;
		move.duck = duck;
		move.side = side;

		return move;
	}

	toJSON() {
		return {
			piece: this.piece.toJSON(),
			duck: this.duck,
			side: this.side,
		};
	}
}

// prettier-ignore
const SQUARES = [
  'A8', 'B8', 'C8', 'D8', 'E8', 'F8', 'G8', 'H8',
  'A7', 'B7', 'C7', 'D7', 'E7', 'F7', 'G7', 'H7',
  'A6', 'B6', 'C6', 'D6', 'E6', 'F6', 'G6', 'H6',
  'A5', 'B5', 'C5', 'D5', 'E5', 'F5', 'G5', 'H5',
  'A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4',
  'A3', 'B3', 'C3', 'D3', 'E3', 'F3', 'G3', 'H3',
  'A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2', 'H2',
  'A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1',
];

export function squareToIndex(square: string): number {
	return SQUARES.indexOf(square);
}

export function indexToSquare(index: number): string {
	return SQUARES[index];
}

// flipps the board, does it inplace
export function flip(obj: [number, number]): [number, number] {
	obj[0] = 7 - obj[0];
	obj[1] = 7 - obj[1];
	return obj as any;
}

export function indexToXY(
	index: number,
	flipped: boolean = false,
): [number, number] {
	const obj: [number, number] = [index % 8, Math.floor(index / 8)];
	if (flipped) flip(obj);

	return obj;
}

export function XYToIndex(
	x: number,
	y: number,
	flipped: boolean = false,
): number {
	if (flipped) {
		[x, y] = flip([x, y]);
	}
	return y * 8 + x;
}

export class History {
	moves: HistoryMove[];

	constructor(d: any) {
		this.moves = d.moves.map((m: any) => new HistoryMove(m));
	}

	didConPlay(conId: string): boolean {
		return this.moves.some(m => m.conId === conId);
	}

	cloneAdd(move: HistoryMove): History {
		const moves = [...this.moves, move];

		const hist = Object.create(History.prototype);
		hist.moves = moves;

		return hist;
	}
}

export class HistoryMove {
	conId!: string;
	name!: string;
	move: Move;
	time: DateTime;

	constructor(d: any) {
		Object.assign(this, d);
		this.move = new Move(d.move);
		this.time = new DateTime(d.time);
	}
}
