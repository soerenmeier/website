import fs from 'fs/promises';
import command from 'node:child_process';
import util from 'node:util';
import path from 'path';
import { fileURLToPath } from 'url';
import Router from './src/lib/router.js';

const exec = util.promisify(command.exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

let pagesToExport, renderPage, getIndexPage;


async function createPage(index, page, path, depth) {
	const html = await renderPage(page, depth, index);

	await fs.writeFile(path, html);
}

async function main() {
	console.info('creating routes');
	// create routes
	const router = new Router(__dirname);
	await router.load(false);
	try {
		fs.mkdirSync(path.resolve(__dirname + '/src') + '/gen');
	} catch (e) {}
	await router.generateRoutes();

	// build client
	console.info('build client');
	await exec('npx vite build --outDir dist-client');

	// build server
	console.info('build server');
	await exec('npx vite build --outDir dist-server --ssr src/server.js');


	const server = await import('./dist-server/server.js');
	pagesToExport = server.pagesToExport;
	renderPage = server.renderPage;
	getIndexPage = server.indexPage;

	// create folders
	console.info('create pages');
	try {
		await fs.rm('dist-pages', { force: true, recursive: true });
	} catch (e) {}

	await fs.mkdir('dist-pages');

	const indexFile = await fs.readFile(
		'dist-client/src/index.html',
		{ encoding: 'utf8' }
	);

	const indexPage = getIndexPage();

	await createPage(
		indexFile,
		indexPage,
		'dist-pages/index.html',
		0
	);

	for (const page of pagesToExport()) {
		await createPage(
			indexFile,
			page,
			`dist-pages/${page.slug}.html`,
			0
		);
	}

	// create final package
	console.info('create package');
	try {
		await fs.rm('dist', { force: true, recursive: true });
	} catch (e) {}
	await fs.mkdir('dist');

	// copy all pages
	await fs.cp(
		'dist-pages',
		'dist',
		{ recursive: true }
	);

	// now copy assets
	await fs.cp(
		'dist-client/assets',
		'dist/assets',
		{ recursive: true }
	);

	console.info('cleanup');
	try {
		await fs.rm('dist-client', { force: true, recursive: true });
	} catch (e) {}
	try {
		await fs.rm('dist-pages', { force: true, recursive: true });
	} catch (e) {}
	try {
		await fs.rm('dist-server', { force: true, recursive: true });
	} catch (e) {}

	console.info('\n\nfind your files in `dist`');
}

main();