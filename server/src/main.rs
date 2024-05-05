mod api;
mod cors;
mod dist_routes;

use std::{fs, path::Path};

use clap::Parser;
use fire::Resource;
use serde::Deserialize;
use tracing::{info, warn};

#[derive(Debug, Parser)]
#[command(version)]
struct Args {
	#[arg(long, default_value = "server=info,fire_http=info,error")]
	tracing: String,
	#[arg(long, default_value = "../ui/dist")]
	dist_dir: String,
	#[arg(long, default_value = "./config.toml")]
	config: String,
}

#[derive(Debug, Clone, Deserialize, Resource)]
#[serde(rename_all = "kebab-case")]
struct Config {
	server_id: String,
}

#[tokio::main]
async fn main() {
	let args = Args::parse();

	tracing_subscriber::fmt()
		.with_env_filter(args.tracing)
		.init();

	let cfg_string =
		fs::read_to_string(args.config).expect("failed to read config.toml");
	let cfg: Config =
		toml::from_str(&cfg_string).expect("failed to read config.toml");

	let mut server = fire::build("0.0.0.0:4986")
		.await
		.expect("Address could not be parsed");

	server.add_data(cfg);

	api::routes(&mut server);
	let js_server = if Path::new(&args.dist_dir).is_dir() {
		info!("using dist dir {}", args.dist_dir);
		Some(dist_routes::routes(args.dist_dir.clone(), &mut server))
	} else {
		warn!("no dist folder found");

		None
	};

	if cfg!(debug_assertions) {
		server.add_catcher(cors::CorsHeaders);
	}

	let server = server.build().await.unwrap();
	if let Some(js_server) = js_server {
		js_server.route_internally(server.pit()).await;
	}
	server.ignite().await.unwrap();
}
