use fire::{get_json, FireBuilder};

use crate::Config;

#[get_json("/api/server-id")]
fn server_id(cfg: &Config) -> String {
	cfg.server_id.clone()
}

pub fn routes(server: &mut FireBuilder) {
	server.add_route(server_id);
}
