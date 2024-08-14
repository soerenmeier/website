use std::{
	convert::Infallible,
	sync::{Arc, RwLock},
};

use chuchi::{
	extractor::Extractor, extractor_extract, extractor_prepare,
	extractor_validate, Error,
};
use chuchi_postgres::{time::DateTime, UniqueId};
use serde::{Deserialize, Serialize};
use tokio::{
	sync::{broadcast, mpsc, oneshot},
	task::JoinHandle,
};

use duck_chess::{
	logic::ComputedBoard,
	types::{Board, Move, PieceMove, Square},
};

#[derive(Debug, Clone)]
pub enum Broadcast {
	NewMove { board: Board, history: HistoryMove },
}

#[derive(Debug)]
enum Request {
	MakeMove {
		id: UniqueId,
		name: String,
		move_number: u16,
		r#move: Move,
		resp: oneshot::Sender<MakeMoveResp>,
	},
}

#[derive(Debug, Clone)]
pub enum MakeMoveResp {
	Ok { board: Board, history: HistoryMove },
	AlreadyMoved,
	ToSlow { name: String },
	WrongMove,
}

#[derive(Debug)]
pub struct Chess {
	rx: broadcast::Receiver<Broadcast>,
	tx: mpsc::Sender<Request>,
	inner: SharedInner,
}

impl Chess {
	pub fn current_state(&self) -> State {
		self.inner.current_state()
	}

	pub async fn receive(&mut self) -> Option<Broadcast> {
		self.rx.recv().await.ok()
	}

	pub async fn make_move(
		&self,
		id: UniqueId,
		name: String,
		move_number: u16,
		mov: Move,
	) -> MakeMoveResp {
		let (resp_tx, resp_rx) = oneshot::channel();

		self.tx
			.send(Request::MakeMove {
				id,
				name,
				move_number,
				r#move: mov,
				resp: resp_tx,
			})
			.await
			.unwrap();

		resp_rx.await.unwrap()
	}
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct State {
	pub board: Board,
	pub history: History,
}

impl<'a, R> Extractor<'a, R> for Chess {
	type Error = Infallible;
	type Prepared = Self;

	extractor_validate!(|validate| {
		assert!(
			validate.resources.exists::<ChessSubscriber>(),
			"ChessSubscriber is not registered"
		);
	});

	extractor_prepare!(|prep| {
		let sub = prep.resources.get::<ChessSubscriber>().unwrap();

		Ok(sub.subscribe())
	});

	extractor_extract!(|ext| { Ok(ext.prepared) });
}

// the manager is responsible for
// storing the state of the game
// triggered events for interested parties if something changes
// keep the last few games?
#[derive(Debug, Clone)]
pub struct ChessSubscriber {
	sub: broadcast::Sender<Broadcast>,
	tx: mpsc::Sender<Request>,
	inner: SharedInner,
}

impl ChessSubscriber {
	pub fn new() -> (Self, JoinHandle<()>) {
		let inner = SharedInner::new();

		let (tx, rx) = mpsc::channel(5);
		let (sub, _) = broadcast::channel(5);

		let me = Self {
			sub: sub.clone(),
			tx,
			inner: inner.clone(),
		};

		(
			me,
			tokio::spawn(async move { bg_task(inner, rx, sub).await.unwrap() }),
		)
	}

	pub fn subscribe(&self) -> Chess {
		Chess {
			rx: self.sub.subscribe(),
			tx: self.tx.clone(),
			inner: self.inner.clone(),
		}
	}
}

#[derive(Debug, Clone)]
struct SharedInner {
	inner: Arc<RwLock<Inner>>,
}

impl SharedInner {
	pub fn new() -> Self {
		Self {
			inner: Arc::new(RwLock::new(Inner::new())),
		}
	}

	pub fn current_state(&self) -> State {
		let inner = self.inner.read().unwrap();
		State {
			board: inner.board.board().clone(),
			history: inner.history.clone(),
		}
	}
}

#[derive(Debug)]
struct Inner {
	board: ComputedBoard,
	history: History,
	piece_move_tmp: Vec<PieceMove>,
	duck_squares_tmp: Vec<Square>,
}

impl Inner {
	pub fn new() -> Self {
		let board = ComputedBoard::new();
		let history = History { moves: Vec::new() };

		Self {
			board,
			history,
			piece_move_tmp: vec![],
			duck_squares_tmp: vec![],
		}
	}

	pub fn make_move(
		&mut self,
		id: UniqueId,
		name: String,
		mov_num: u16,
		mov: Move,
	) -> MakeMoveResp {
		// let's first check if we both have the same history state
		// there still might be a discrepency if the move is already a new game
		// but well who will start a new game in an instant
		let last_move = self.history.moves.last().cloned();
		if self.history.moves.len() != mov_num as usize {
			return MakeMoveResp::ToSlow {
				name: last_move.map(|m| m.name).unwrap_or_else(String::new),
			};
		}

		if let Some(last_move) = last_move {
			if last_move.con_id == id {
				return MakeMoveResp::AlreadyMoved;
			}
		}

		self.piece_move_tmp.clear();
		self.board.available_piece_moves(&mut self.piece_move_tmp);

		if !self.piece_move_tmp.contains(&mov.piece) {
			return MakeMoveResp::WrongMove;
		}

		// we need to clone the board because
		// we can't be sure the duck move is valid
		let mut board = self.board.clone();
		board.apply_piece_move(mov.piece);

		self.duck_squares_tmp.clear();
		board.available_duck_squares(&mut self.duck_squares_tmp);

		if let Some(duck) = mov.duck {
			if !self.duck_squares_tmp.contains(&duck) {
				return MakeMoveResp::WrongMove;
			}

			board.apply_duck_move(duck);
		}

		self.board = board;

		let hist_move = HistoryMove {
			con_id: id,
			name,
			r#move: mov,
			time: DateTime::now(),
		};

		self.history.moves.push(hist_move.clone());

		MakeMoveResp::Ok {
			board: self.board.board().clone(),
			history: hist_move,
		}
	}
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct History {
	pub moves: Vec<HistoryMove>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HistoryMove {
	// the name of the person who made the move
	pub con_id: UniqueId,
	pub name: String,
	pub r#move: Move,
	pub time: DateTime,
}

async fn bg_task(
	inner: SharedInner,
	mut rx: mpsc::Receiver<Request>,
	tx: broadcast::Sender<Broadcast>,
) -> Result<(), Error> {
	loop {
		let req = rx.recv().await.unwrap();

		tracing::debug!("Received request {:?}", req);

		match req {
			Request::MakeMove {
				id,
				name,
				move_number,
				r#move: mov,
				resp: tx_resp,
			} => {
				// todo check if can do the move
				let mut inner = inner.inner.write().unwrap();
				let resp = inner.make_move(id, name, move_number, mov.clone());

				let broadcast = match &resp {
					MakeMoveResp::Ok { board, history } => {
						Some(Broadcast::NewMove {
							board: board.clone(),
							history: history.clone(),
						})
					}
					_ => None,
				};

				// we don't care if the receiver is still there
				let _ = tx_resp.send(resp);

				if let Some(broadcast) = broadcast {
					// we don't care if nobody is listening
					let _ = tx.send(broadcast);
				}
			}
		}
	}
}

#[cfg(test)]
mod tests {
	use super::*;

	use duck_chess::pgn::parse_moves;

	// this should not be used in prod because of a race cond
	macro_rules! make_move_pgn {
		($chess:ident, $id:expr, $name:expr, $move_count:expr, $move:expr) => {{
			let board = $chess.current_state().board;
			let comp = ComputedBoard::from_board(board);
			let mut moves =
				parse_moves(&format!("1. {} 0-0", $move)).expect("pgn wrong");
			$chess.make_move(
				$id,
				$name.into(),
				$move_count,
				comp.convert_pgn_move(moves.pop().unwrap())
					.expect("move unknown"),
			)
		}};
	}

	#[tokio::test]
	async fn play_chess() {
		let (sub, bg) = ChessSubscriber::new();
		let chess = sub.subscribe();

		let id1 = UniqueId::new();
		let id2 = UniqueId::new();

		// let's make the first move
		make_move_pgn!(chess, id1, "Sören", 0, "e4e6").await;
		make_move_pgn!(chess, id2, "Sören", 1, "Nc6e2").await;
	}
}
