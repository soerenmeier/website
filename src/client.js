import App from './app.svelte';
import Router from 'fire-svelte/routing/router.js';
import SsrCache from 'fire-svelte/ssr/cache.js';
import * as routes from './pages/routes.js';
import { handleRoute } from './main.js';

async function main() {
	const cache = new SsrCache;
	const router = new Router;

	const context = new Map;
	context.set('router', router);

	routes.register(router);

	let app;

	router.onRequest(async req => {
		const route = router.route(req);

		const { props } = await handleRoute(route);

		if (!app) {
			app = new App({
				target: document.body,
				props,
				hydrate: true,
				context
			});
		} else {
			app.$set(props);
		}
	});

	router.initClient();
}
main();