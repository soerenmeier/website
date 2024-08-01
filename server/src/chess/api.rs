use chuchi::api::stream::message::{Message, MessageData, MessageKind};
use chuchi::api::stream::{Stream, StreamKind, StreamServer, Streamer};
use chuchi::body::BodyHttp;
use chuchi::ws::{CloseCode, WebSocket};
use chuchi::{api_stream, Body};

use chuchi::api::error::{self, Error as ApiError, StatusCode};

use tokio::time::sleep;

use std::time::Duration;
use std::{fmt, io};

use serde::{Deserialize, Serialize};

// #[derive(Debug, thiserror::Error, Serialize, Deserialize)]
// pub enum Error {
// 	Internal(String),
// 	Request(String),
// }

// impl error::ApiError for Error {
// 	fn from_error(e: ApiError) -> Self {
// 		match e {
// 			ApiError::HeadersMissing(_) | ApiError::Deserialize(_) => {
// 				Self::Request(e.to_string())
// 			}
// 			e => Self::Internal(e.to_string()),
// 		}
// 	}

// 	fn status_code(&self) -> StatusCode {
// 		match self {
// 			Self::Internal(_) => StatusCode::INTERNAL_SERVER_ERROR,
// 			Self::Request(_) => StatusCode::BAD_REQUEST,
// 		}
// 	}
// }

pub enum Request {
	MakeMove,
}

pub enum Response {
	MoveMade,
	// GoalReached,
}

// #[ws("/{id}")]
// async fn websocket_route(
// 	mut ws: WebSocket,
// 	id: PathParam<usize>,
// 	_: &SomeData,
// 	_: &SomeData,
// ) -> Result<(), Error> {
// 	let mut c = 0;

// 	while let Some(msg) = ws.receive().await? {
// 		// read
// 		assert_eq!(msg.to_text().unwrap(), format!("Hey {}", c));
// 		c += 1;
// 		// send them
// 		ws.send(format!("Hi {id}")).await?;
// 	}

// 	println!("connection closed");

// 	Ok(())
// }

// #[api_stream(PingReq)]
// async fn ping_ping(
// 	req: PingReq,
// 	mut streamer: Streamer<Pong>,
// ) -> Result<(), Error> {
// 	for _ in 0..req.repeat {
// 		streamer
// 			.send(Pong {
// 				name: req.name.clone(),
// 			})
// 			.await
// 			.map_err(|e| Error::Internal(e.to_string()))?;

// 		sleep(Duration::from_millis(100)).await;
// 	}

// 	Ok(())
// }

// #[tokio::test]
// #[traced_test]
// async fn test_ping() {
// 	// builder server
// 	let addr = spawn_server!(|builder| {
// 		let mut stream_server = StreamServer::new("/ws");
// 		stream_server.insert(ping_ping);

// 		builder.add_raw_route(stream_server);
// 	});

// 	// close the connection properly
// 	tokio::time::sleep(std::time::Duration::from_secs(1)).await;
// }
