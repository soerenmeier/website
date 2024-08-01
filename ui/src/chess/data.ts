// import Data from 'fire/data/data.js';
// import { Option } from 'fire/data/parsetypes.js';
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
}

export class Piece {
	kind!: string;
	side!: string;

	constructor(d: any) {
		Object.assign(this, d);
	}
}

export class CanCastle {
	white!: [boolean, boolean];
	black!: [boolean, boolean];

	constructor(d: any) {
		Object.assign(this, d);
	}
}

const possiblePieceMoves = ['Piece', 'EnPassant', 'Castle'];

type PieceMoveData =
	| {
			piece: string;
			from: string;
			to: string;
			capture: string | null;
			promotion: string | null;
			kind: 'Piece';
	  }
	| {
			from: string;
			to: string;
			kind: 'EnPassant';
	  }
	| {
			fromKing: string;
			toKing: string;
			fromRook: string;
			toRook: string;
			kind: 'Castle';
	  };

export class PieceMove {
	inner!: PieceMoveData;

	constructor(d: any) {
		if (typeof d !== 'object') throw new Error('Expected Object');

		let kind = possiblePieceMoves.find(k => k in d);
		if (!kind) throw new Error('Piece Move not found');
		d = d[kind];

		Object.assign(this.inner, d);
		this.inner.kind = kind as any;
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
		const obj: Record<string, any> = {};
		obj[this.inner.kind] = {};
		Object.assign(obj[this.inner.kind], this.inner);
		return obj;
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
}

const SQUARES = [
	'A8',
	'B8',
	'C8',
	'D8',
	'E8',
	'F8',
	'G8',
	'H8',
	'A7',
	'B7',
	'C7',
	'D7',
	'E7',
	'F7',
	'G7',
	'H7',
	'A6',
	'B6',
	'C6',
	'D6',
	'E6',
	'F6',
	'G6',
	'H6',
	'A5',
	'B5',
	'C5',
	'D5',
	'E5',
	'F5',
	'G5',
	'H5',
	'A4',
	'B4',
	'C4',
	'D4',
	'E4',
	'F4',
	'G4',
	'H4',
	'A3',
	'B3',
	'C3',
	'D3',
	'E3',
	'F3',
	'G3',
	'H3',
	'A2',
	'B2',
	'C2',
	'D2',
	'E2',
	'F2',
	'G2',
	'H2',
	'A1',
	'B1',
	'C1',
	'D1',
	'E1',
	'F1',
	'G1',
	'H1',
];

export function squareToIndex(square: string): number {
	return SQUARES.indexOf(square);
}

export function indexToSquare(index: number): string {
	return SQUARES[index];
}

export function indexToXY(index: number): [number, number] {
	return [index % 8, Math.floor(index / 8)];
}

export function XYToIndex(x: number, y: number): number {
	return y * 8 + x;
}
