import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import fetch from 'node-fetch';
import Router from './src/lib/router.js';

globalThis.fetch = fetch;

const IN_DEBUG = true;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createServer() {
	const app = express();

	// Create Vite server in middleware mode and configure the app type as
	// 'custom', disabling Vite's own HTML serving logic so parent server
	// can take control
	const vite = await createViteServer({
		server: { middlewareMode: true },
		appType: 'custom'
	});

	// use vite's connect instance as middleware
	// if you use your own express router (express.Router()), you should use router.use
	app.use(vite.middlewares);

	app.use('*', async (req, res, next) => {
		const url = req.originalUrl;

		if (url !== '/' && !url.endsWith('.html')) {
			res.status(404).end('');
			return;
		}

		const router = new Router(__dirname);
		await router.load(IN_DEBUG);
		try {
			fs.mkdirSync(path.resolve(__dirname + '/src') + '/gen');
		} catch (e) {}
		await router.generateRoutes();

		try {
			// 1. Read index.html
			let template = fs.readFileSync(
				path.resolve(__dirname, 'src/index.html'),
				'utf-8'
			);

			// 2. Apply Vite HTML transforms. This injects the Vite HMR client, and
			//    also applies HTML transforms from Vite plugins, e.g. global preambles
			//    from @vitejs/plugin-react
			template = await vite.transformIndexHtml(url, template);

			// 3. Load the server entry. vite.ssrLoadModule automatically transforms
			//    your ESM source code to be usable in Node.js! There is no bundling
			//    required, and provides efficient invalidation similar to HMR.
			const { render } = await vite.ssrLoadModule('./src/server.js');

			// 4. render the app HTML
			const { status, html } = await render(url, template);

			// 6. Send the rendered HTML back.
			res.status(status).set({ 'Content-Type': 'text/html' }).end(html);
		} catch (e) {
			// If an error is caught, let Vite fix the stack trace so it maps back to
			// your actual source code.
			vite.ssrFixStacktrace(e);
			next(e);
		}
	});

	app.listen(5173);
	console.log('listening on http://localhost:5173/');
}

createServer();