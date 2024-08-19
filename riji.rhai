fn docker_build() {
	let docker = cmd([
		"docker", "build", "-t", "registry.dihei.co/builds/web/soerenmeier-ch",
		".", "--pull"
	]);
	docker.execute();
}

fn docker_push() {
	let docker = cmd([
		"docker", "push", "registry.dihei.co/builds/web/soerenmeier-ch"
	]);
	docker.execute();
}
