import Sprite from '@/lib/Sprite';
import {
	Board,
	Move,
	PieceMove,
	XYToIndex,
	flip,
	indexToSquare,
	indexToXY,
	squareToIndex,
} from './types';
// import { availableMoves } from './api/api.js';
import { range } from 'chuchi-utils';
import Listeners from 'chuchi-utils/sync/Listeners';

import pieceSpriteSvg from '/assets/piece_sprite.svg';
import type Context2d from 'chuchi-legacy/dom/Context2d';
import type { AvailableMoves, Wasm } from '@/lib/wasm';

const pieceSprite = new Sprite(pieceSpriteSvg, 45, 45);

const pieceSpriteLookup: Record<string, [number, number]> = {
	WhiteKing: [0, 0],
	WhiteQueen: [1, 0],
	WhiteBishop: [2, 0],
	WhiteKnight: [3, 0],
	WhiteRook: [4, 0],
	WhitePawn: [5, 0],
	WhiteDuck: [6, 0],
	BlackKing: [0, 1],
	BlackQueen: [1, 1],
	BlackBishop: [2, 1],
	BlackKnight: [3, 1],
	BlackRook: [4, 1],
	BlackPawn: [5, 1],
	BlackDuck: [6, 0],
};

export default class BoardView {
	ctx: Context2d;
	board: Board;
	wasm: Wasm;
	availableMoves: AvailableMoves;
	squareWidth: number;
	activeMove: {
		board: Board | null;
		piece: PieceMove | null;
		duck: string | null;
	};

	holdingPiece: number | null;
	holdingPieceRealXY: [number, number] | null;

	selectedPiece: number | null;
	moveToHint: boolean[];

	drawWidth: number;
	drawPadding: number;
	playingSide: 'White' | 'Black';

	moveListeners: Listeners<[Move]>;
	setBoard: (board: Board) => void;

	constructor(ctx: Context2d, wasm: Wasm) {
		this.ctx = ctx;
		this.board = null as any;
		this.wasm = wasm;
		this.availableMoves = null as any;
		this.squareWidth = ctx.width / 8;
		this.activeMove = { board: null, piece: null, duck: null };

		// contains the index of the piece that is holded
		this.holdingPiece = null;
		this.holdingPieceRealXY = null;

		// index on the board or -1 which means the duck isn't placed
		this.selectedPiece = null;
		this.moveToHint = range(0, 64).map(() => false);

		// piece drawing
		this.drawWidth = this.squareWidth * 0.85;
		this.drawPadding = (this.squareWidth - this.drawWidth) / 2;
		this.playingSide = 'White';

		this.moveListeners = new Listeners();
		this.setBoard = () => {};
	}

	// fn(x, y, i)
	loopSquare(fn: (x: number, y: number, i: number) => void) {
		for (let y = 0; y < 8; y++) {
			for (let x = 0; x < 8; x++) {
				fn(x, y, XYToIndex(x, y));
			}
		}
	}

	get flipped(): boolean {
		return this.playingSide === 'Black';
	}

	async updateBoard(board: Board) {
		this.board = board;
		this.availableMoves = this.wasm.availableMoves(board);
		// we need to reset the active move if the activeMove.board is not eq to board
		if (!this.activeMove.board?.eq(board)) {
			this.activeMove = { board, piece: null, duck: null };
		}
		this.holdingPiece = null;
		this.holdingPieceRealXY = null;
		this.selectedPiece = null;
		this.moveToHint = range(0, 64).map(() => false);

		console.assert(
			board.movedPiece === (this.availableMoves.kind === 'Duck'),
			'board and avaiableMoves are not on the same page',
		);
		if (board.movedPiece && this.availableMoves.kind === 'Duck') {
			const foundDuck = board.duckPosition();
			if (foundDuck === -1) {
				this.selectedPiece = -1;
				this.availableMoves.squares.forEach(s => {
					const idx = squareToIndex(s);
					this.moveToHint[idx] = true;
				});
			}
		}
	}

	onMove(fn: (move: Move) => void) {
		return this.moveListeners.add(fn);
	}

	drawPieceReal(
		piece: string,
		side: 'White' | 'Black',
		x: number,
		y: number,
	) {
		const [sX, sY] = pieceSpriteLookup[side + piece];
		pieceSprite.draw(
			sX,
			sY,
			this.ctx,
			x + this.drawPadding,
			y + this.drawPadding,
			this.drawWidth,
			this.drawWidth,
		);
	}

	// piece Rook | , side: white
	drawPiece(piece: string, side: 'White' | 'Black', x: number, y: number) {
		if (this.flipped) {
			[x, y] = flip([x, y]);
		}
		this.drawPieceReal(
			piece,
			side,
			x * this.squareWidth,
			y * this.squareWidth,
		);
	}

	draw() {
		this.ctx.fillStyle = '#eeeed2';
		this.ctx.fillRect(0, 0, this.ctx.width, this.ctx.height);

		this.ctx.fillStyle = '#769656';
		this.loopSquare((x, y, i) => {
			if ((x + (y % 2)) % 2 !== 0) {
				this.ctx.fillRect(
					x * this.squareWidth,
					y * this.squareWidth,
					this.squareWidth,
					this.squareWidth,
				);
			}
		});

		this.loopSquare((x, y, i) => {
			const piece = this.board.getPiece(i);
			if (piece && this.holdingPiece !== i)
				this.drawPiece(piece.kind, piece.side, x, y);
		});

		if (this.selectedPiece !== null) {
			this.ctx.fillStyle = 'rgba(0, 0, 0, .2)';
			this.moveToHint.forEach((showHint, i) => {
				if (showHint) {
					const [x, y] = indexToXY(i, this.flipped);
					this.ctx.fillCircle(
						x * this.squareWidth + this.squareWidth / 2,
						y * this.squareWidth + this.squareWidth / 2,
						this.squareWidth / 5,
					);
				}
			});
		}

		if (this.holdingPiece !== null) {
			// draw the holding piece
			const piece = this.board.getPiece(this.holdingPiece);

			let [x, y] = this.holdingPieceRealXY;
			x -= this.squareWidth / 2;
			y -= this.squareWidth / 2;

			this.drawPieceReal(piece.kind, piece.side, x, y);
		}
	}

	mouseDown(rX, rY) {
		let x = Math.floor(rX / this.squareWidth);
		let y = Math.floor(rY / this.squareWidth);

		const index = XYToIndex(x, y, this.flipped);

		// mouse above hint so don't do anything until mouse up
		if (this.selectedPiece !== null && this.moveToHint[index]) {
			return;
		}

		// if (this.selectedPiece == index) {
		// 	// just unselect
		// 	this.moveToHint = range(0, 64).map(() => false);
		// }

		this.selectedPiece = null;
		this.moveToHint = range(0, 64).map(() => false);

		if (this.playingSide !== this.board.nextMove) {
			return;
		}

		let pieceFound = false;

		// calc hints
		switch (this.availableMoves.kind) {
			case 'Piece':
				this.availableMoves.moves.forEach(m => {
					const from = squareToIndex(m.fromSquare());
					if (from == index) {
						const toIndex = squareToIndex(m.toSquare());
						this.moveToHint[toIndex] = true;
						pieceFound = true;
					}
				});
				break;
			case 'Duck':
				const duckIndex = this.board.duckPosition();
				const showHint = duckIndex === -1 || duckIndex === index;

				if (showHint) {
					this.availableMoves.squares.forEach(s => {
						const idx = squareToIndex(s);
						this.moveToHint[idx] = true;
					});

					// now if no duck is available we can't drag and drop so
					// just show the hint again
					if (duckIndex === -1) {
						this.selectedPiece = -1;
						return;
					} else {
						pieceFound = true;
					}
				}
				break;
		}

		if (!pieceFound) return;

		this.selectedPiece = index;

		this.holdingPiece = index;
		this.holdingPieceRealXY = [rX, rY];

		// this.holdingPiece =
		// check if the move exists
		// and then show hints for that piece
	}

	mouseUp(rX, rY) {
		const startSquare = this.holdingPiece ?? this.selectedPiece;

		this.holdingPiece = null;
		this.holdingPieceRealXY = null;

		let x = Math.floor(rX / this.squareWidth);
		let y = Math.floor(rY / this.squareWidth);

		const index = XYToIndex(x, y, this.flipped);

		if (!this.moveToHint[index]) return;

		switch (this.availableMoves.kind) {
			case 'Piece':
				const move = this.availableMoves.moves.find(m => {
					return (
						squareToIndex(m.fromSquare()) == startSquare &&
						squareToIndex(m.toSquare()) == index
					);
				});

				if (move) {
					// a piece move means we do the calculation locally
					const newBoard = this.wasm.movePiece(this.board, move);
					this.activeMove.board = newBoard;
					this.activeMove.piece = move;
					this.setBoard(newBoard);
				}
				break;
			case 'Duck':
				this.activeMove.duck = indexToSquare(index);
				const mov = Move.new(
					this.activeMove.piece!,
					this.activeMove.duck,
					this.board.nextMove,
				);

				this.moveListeners.trigger(mov);
				break;
		}
	}

	mouseMove(x, y) {
		if (this.holdingPiece !== null) this.holdingPieceRealXY = [x, y];
	}
}
