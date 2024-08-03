use duck_chess::{
    logic::ComputedBoard,
    types::{Board, PieceMove, Square},
};
use serde::{Deserialize, Serialize};
use serde_wasm_bindgen::{from_value, to_value};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

macro_rules! log {
	($s:expr) => (log($s));
	($s:expr, $($tt:expr),*) => (log(&format!( $s, $($tt),* )))
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "kind")]
pub enum AvailableMoves {
    Piece { moves: Vec<PieceMove> },
    Duck { squares: Vec<Square> },
}

#[wasm_bindgen]
pub fn available_moves(board: JsValue) -> JsValue {
    let board: Board = from_value(board).unwrap();

    let computed = ComputedBoard::from_board(board);

    let av = if !computed.moved_piece() {
        let mut v = vec![];
        computed.available_piece_moves(&mut v);

        AvailableMoves::Piece { moves: v }
    } else {
        let mut v = vec![];
        computed.available_duck_squares(&mut v);

        AvailableMoves::Duck { squares: v }
    };

    to_value(&av).unwrap()
}

#[wasm_bindgen]
pub fn move_piece(board: JsValue, piece: JsValue) -> JsValue {
    let board: Board = from_value(board).unwrap();
    let piece: PieceMove = from_value(piece).unwrap();

    let mut computed = ComputedBoard::from_board(board);

    computed.apply_piece_move(piece);

    to_value(computed.board()).unwrap()
}
