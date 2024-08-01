use chuchi::{ws, ws::WebSocket, Error};

#[ws("/api/chess")]
async fn ws_chess(mut ws: WebSocket) -> Result<(), Error> {
	// todo!()
}
