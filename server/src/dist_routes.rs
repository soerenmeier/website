use std::fs;

use fire::fs::{StaticFileOwned, StaticFilesOwned};
use fire::{get, Error, FireBuilder, Request, Response};
use fire_ssr::JsServer;

use serde::{Deserialize, Serialize};

const FILES: &[&str] = &["robots.txt"];
const DIRS: &[&str] = &["assets", "fonts"];

#[get("/")]
async fn index_route(
	req: &mut Request,
	ssr: &JsServer,
) -> Result<Response, Error> {
	ssr.request(req).await.map_err(Error::from_server_error)
}

#[get("/{*remaining}")]
async fn all(req: &mut Request, ssr: &JsServer) -> Result<Response, Error> {
	ssr.request(req).await.map_err(Error::from_server_error)
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Options {
	ssr_manifest: serde_json::Value,
}

pub fn routes(dist_dir: String, server: &mut FireBuilder) -> JsServer {
	// add static files

	for file in FILES {
		server.add_route(StaticFileOwned::new(
			format!("/{file}"),
			format!("{dist_dir}/public/{file}"),
		));
	}

	for dir in DIRS {
		server.add_route(StaticFilesOwned::new(
			format!("/{dir}"),
			format!("{dist_dir}/public/{dir}"),
		));
	}

	// add ssr
	let index = fs::read_to_string(format!("{dist_dir}/index.html")).unwrap();
	let manifest =
		fs::read_to_string(format!("{dist_dir}/ssr-manifest.json")).unwrap();
	// since we only have two cores it doesn't make sense to run more threads than
	// that
	let js_server = JsServer::new(
		dist_dir,
		index,
		Options {
			ssr_manifest: serde_json::from_str(&manifest).unwrap(),
		},
		2,
	);
	server.add_data(js_server.clone());
	server.add_route(index_route);
	server.add_route(all);

	js_server
}
