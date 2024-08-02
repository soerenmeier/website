use chuchi::{
	error::ClientErrorKind,
	ws,
	ws::{JsonError, WebSocket},
	Error,
};
use serde::{Deserialize, Serialize};

use crate::chess::chess::Chess;

use super::types::Board;

/// The data which the client can receive from the server
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Receive {
	Board(Board),
}

/// The data which the client can send to the server
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Send {}

#[ws("/api/chess")]
pub async fn ws_chess(
	mut ws: WebSocket,
	mut chess: Chess,
) -> Result<(), Error> {
	// the first step is to send the board and current standings
	let board = chess.current_board();

	ws.serialize(&Receive::Board(board))
		.await
		.map_err(json_err_serv)?;

	loop {
		tokio::select! {
			msg = ws.deserialize::<Send>() => {
				let msg = msg.map_err(json_err_client)?;
				todo!("{msg:?} deser")
			}
			broadcast = chess.receive() => {
				todo!("{broadcast:?} receive")
			}
		}
	}
}

fn json_err_serv(e: JsonError) -> Error {
	Error::from_server_error(e)
}

fn json_err_client(e: JsonError) -> Error {
	Error::new(ClientErrorKind::BadRequest, e)
}
