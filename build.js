import fs from 'fs/promises';
import command from 'node:child_process';
import util from 'node:util';
import Router from 'fire-svelte/routing/router.js';
// import * as routes from './src/routes/routes.js';

const exec = util.promisify(command.exec);

async function main() {
	console.info('build client');
	await exec('npx vite build --outDir dist-client --ssrManifest');

	console.info('build server');
	await exec('npx vite build --outDir dist-server --ssr src/server.js');

	console.info('create dist');
	try {
		await fs.rm('dist', { force: true, recursive: true });
	} catch (e) {}

	await fs.cp('dist-client/', 'dist/', { recursive: true });
	await fs.rm('dist/index.html');
	try {
		await fs.rm('dist/.vite', { force: true, recursive: true });
	} catch (e) {}

	const indexHtml = await fs.readFile('dist-client/index.html', {
		encoding: 'utf8',
	});
	const ssrManifest = JSON.parse(
		await fs.readFile('dist-client/.vite/ssr-manifest.json', {
			encoding: 'utf8',
		})
	);

	const server = await import('./dist-server/server.js');

	const router = new Router();
	server.routes.register(router);

	for (const route of router.routes) {
		const dir = route.uri;
		if (typeof dir !== 'string')
			throw new Error("only string uri's are supported");

		const { status, fields } = await server.render({
			method: 'GET',
			uri: route.uri,
			ssrManifest,
			headers: {
				host: 'localhost',
			},
		});

		if (status != '200')
			throw new Error('expected 200 status on ' + route.uri);

		try {
			await fs.mkdir('dist' + dir, { recursive: true });
		} catch (e) {
			console.log('could not create dir', 'dist' + dir);
		}

		let html = indexHtml;
		for (const field in fields) {
			html = html.replace(`<!--ssr-${field}-->`, fields[field]);
		}

		const path = 'dist' + dir + '/index.html';
		console.log('create file', path);
		await fs.writeFile(path, html);
	}

	try {
		await fs.rm('dist-client', { force: true, recursive: true });
	} catch (e) {}
	try {
		await fs.rm('dist-server', { force: true, recursive: true });
	} catch (e) {}

	console.log('ready in dist');
}
main();
