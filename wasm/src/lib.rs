use duck_chess::{
    logic::ComputedBoard,
    types::{Board, Move, PieceMove, Square},
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

// #[wasm_bindgen]
// pub fn move_pgn(board: JsValue, mov: JsValue) -> String {
//     let board: Board = from_value(board).unwrap();
//     let mov: Move = from_value(mov).unwrap();

//     let computed = ComputedBoard::from_board(board);

//     let pgn = computed.convert_move_to_pgn(mov);

//     format!("{pgn}")
// }

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryMove {
    pub board: Board,
    pub r#move: Move,
    pub pgn: String,
}

#[wasm_bindgen]
pub fn extended_history(history: JsValue) -> JsValue {
    let history: Vec<Move> = from_value(history).unwrap();

    let mut board = ComputedBoard::new();

    let moves = history
        .into_iter()
        .map(|mov| {
            let pgn = board.convert_move_to_pgn(mov);

            board.apply_piece_move(mov.piece);
            board.apply_duck_move(mov.duck);

            HistoryMove {
                board: board.board().clone(),
                r#move: mov,
                pgn: pgn.to_string(),
            }
        })
        .collect::<Vec<_>>();

    to_value(&moves).unwrap()
}
