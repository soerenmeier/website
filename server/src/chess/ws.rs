use chuchi::{
	error::ClientErrorKind,
	ws,
	ws::{JsonError, WebSocket},
	Error,
};
use chuchi_postgres::UniqueId;
use serde::{Deserialize, Serialize};

use crate::chess::chess::{Broadcast, Chess, MakeMoveResp};

use super::chess::{History, HistoryMove};
use duck_chess::types::{Board, Move};

/// The data which the client can receive from the server
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "kind")]
enum Receive {
	Init {
		id: UniqueId,
		board: Board,
		history: History,
	},
	Update {
		board: Board,
		history: HistoryMove,
	},
	/// Get's returned if you moved in the previous turn
	AlreadyMoved,
	// if you try to make a move, but somebody else already did one
	// this will be sent
	// don't worry about the board state, we will send an update
	ToSlow {
		name: String,
	},
	WrongMove,
}

/// The data which the client can send to the server
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all_fields = "camelCase")]
enum Send {
	MakeMove {
		name: String,
		move_number: u16,
		r#move: Move,
	},
	Init,
}

#[ws("/api/chess")]
pub async fn ws_chess(
	mut ws: WebSocket,
	mut chess: Chess,
) -> Result<(), Error> {
	let uid = UniqueId::new();

	{
		// the first step is to send the board and current standings
		let state = chess.current_state();

		ws.serialize(&Receive::Init {
			id: uid,
			board: state.board,
			history: state.history,
		})
		.await
		.map_err(json_err_serv)?;
	}

	let mut wait_on_init = false;

	// the client is now up to date with the server
	// we already subscribed to the board before sending the state
	// so we are never gonna miss a move

	loop {
		tokio::select! {
			msg = ws.deserialize::<Send>() => {
				let Some(msg) = msg.map_err(json_err_client)? else {
					break Ok(())
				};

				match msg {
					Send::MakeMove { name, move_number, r#move: mov} => {
						let resp = chess.make_move(uid, name, move_number, mov).await;
						// now
						let recv = match resp {
							// the state etc will be sent to the client
							// in a separated broadcast
							MakeMoveResp::Ok { .. } => None,
							MakeMoveResp::AlreadyMoved => {
								Some(Receive::AlreadyMoved)
							}
							MakeMoveResp::ToSlow { name } => {
								Some(Receive::ToSlow { name })
							}
							MakeMoveResp::WrongMove => {
								Some(Receive::WrongMove)
							}
						};

						if let Some(recv) = recv {
							ws.serialize(&recv).await.map_err(json_err_serv)?;
						}
					},
					Send::Init => {
						wait_on_init = false;
						// the first step is to send the board and current standings
						let state = chess.current_state();

						ws.serialize(&Receive::Init {
							id: uid,
							board: state.board,
							history: state.history,
						})
						.await
						.map_err(json_err_serv)?;
					}
				}
			},
			broadcast = chess.receive() => {
				if wait_on_init {
					continue;
				}

				let broadcast = broadcast.unwrap();
				match broadcast {
					Broadcast::NewMove { board, history } => {
						ws.serialize(&Receive::Update { board, history })
							.await
							.map_err(json_err_serv)?;
					}
					Broadcast::GameWon { .. } => {
						wait_on_init = true;
						// now let's wait until the user is ready to play again
					}
				}
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
