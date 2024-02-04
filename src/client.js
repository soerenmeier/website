import App from './app.svelte';
import Router from 'fire-svelte/routing/router.js';
import SsrCache from 'fire-svelte/ssr/cache.js';
import * as routes from './pages/routes.js';
import { handleRoute } from './main.js';

async function main() {
	const cache = new SsrCache();
	const router = new Router();

	const context = new Map();
	context.set('router', router);

	routes.register(router);

	let app;

	router.onRoute(async (req, route, routing) => {
		const { props } = await handleRoute(route);

		if (await routing.dataReady()) return;

		if (!app) {
			app = new App({
				target: document.body,
				props,
				hydrate: true,
				context,
			});
		} else {
			app.$set(props);
		}

		routing.domReady();
	});

	router.initClient();
}
main();
