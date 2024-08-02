use chuchi::Chuchi;

#[macro_use]
mod macros;
// pub mod api;
pub mod chess;
pub mod engine;
pub mod logic;
mod lookup;
pub mod pgn;
pub mod types;
mod ws;

pub fn routes(server: &mut Chuchi) {
	server.add_raw_route(ws::ws_chess);
}
