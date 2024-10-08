mod api;
mod chess;
mod cors;
mod ui;

use std::{fs, path::Path};

use chess::chess::ChessSubscriber;
use chuchi::Resource;
use clap::Parser;
use serde::Deserialize;
use tracing::info;

#[derive(Debug, Parser)]
#[command(version)]
struct Args {
	#[arg(long, default_value = "server=info,chuchi=info,error")]
	tracing: String,
	// #[arg(long, default_value = "./config.toml")]
	// config: String,
}

// #[derive(Debug, Clone, Deserialize, Resource)]
// #[serde(rename_all = "kebab-case")]
// struct Config {
// 	server_id: String,
// }

#[cfg(debug_assertions)]
const UI_DIR: &str = "../ui/dist";
#[cfg(not(debug_assertions))]
const UI_DIR: &str = "./ui";

#[tokio::main]
async fn main() {
	let args = Args::parse();

	tracing_subscriber::fmt()
		.with_env_filter(args.tracing)
		.init();

	// let cfg_string =
	// 	fs::read_to_string(args.config).expect("failed to read config.toml");
	// let cfg: Config =
	// 	toml::from_str(&cfg_string).expect("failed to read config.toml");

	let mut server = chuchi::build("0.0.0.0:4986")
		.await
		.expect("Address could not be parsed");

	// server.add_resource(cfg);
	let (chess, chess_task) = ChessSubscriber::new();
	server.add_resource(chess);

	api::routes(&mut server);
	chess::routes(&mut server);
	let js_server = if Path::new(UI_DIR).exists() {
		info!("using ui dir {UI_DIR}");
		Some(ui::routes(UI_DIR.to_string(), &mut server))
	} else {
		None
	};

	if cfg!(debug_assertions) {
		info!("adding cors headers catcher");
		server.add_catcher(cors::CorsHeaders);
	}

	let server = server.build().await.unwrap();
	if let Some(js_server) = js_server {
		js_server.route_internally(server.shared()).await;
	}
	tokio::try_join!(
		tokio::spawn(async move { server.run().await.unwrap() }),
		chess_task
	)
	.unwrap();
}
