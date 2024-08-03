use chuchi::Chuchi;

pub mod chess;
mod ws;

pub fn routes(server: &mut Chuchi) {
	server.add_raw_route(ws::ws_chess);
}
