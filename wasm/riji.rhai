
fn help() {
	print([
		"- install",
		"- build"
	]);
}

fn install() {
	// first add wasm to rustup
	let rustup = cmd([
		"rustup", "target", "add", "wasm32-unknown-unknown"
	]);
	rustup.execute();

	// install wasm-bindgen
	let cargo = cmd(["cargo", "install", "wasm-bindgen-cli"]);
	cargo.execute();
}

fn build() {
	// let
	let cargo = cmd([
		"cargo", "build", "--profile", "release-lto", "--target", "wasm32-unknown-unknown"
	]);
	cargo.execute();
	fs::create_dir("./js");
	fs::copy(
		"../target/wasm32-unknown-unknown/release-lto/wasm.wasm",
		"./js/wasm.wasm"
	);

	let bindgen = cmd([
		"wasm-bindgen",
		"--target", "web",
		"--out-dir", "./js",
		"./js/wasm.wasm"
	]);
	bindgen.execute();
}
