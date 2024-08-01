use tokio::sync::broadcast;

use super::types::Board;

// the manager is responsible for
// storing the state of the game
// triggered events for interested parties if something changes
// keep the last few games?
//
pub struct Chess {
	sub: broadcast::Sender<Broadcast>,
	tx: mpsc::Sender,
}

struct Inner {
	board: Board,
}

impl Inner {
	pub fn new() -> Self {
		let mut board = Board::new();
		// todo implement storage
		board.set_start_position();

		Self { board }
	}
}
