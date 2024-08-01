import type { Route, Request } from 'chuchi';
import * as routes from './pages/routes';
import type { SsrCache } from 'chuchi/ssr';

// should return { status, props }
export async function handleRoute(
	req: Request,
	route: Route | null,
	cache: SsrCache,
) {
	if (route) {
		let comp, pageProps;
		try {
			comp = await route.load(req);

			if (typeof comp.loadProps === 'function')
				pageProps = await comp.loadProps(route.toProps(req), cache);
			else pageProps = {};
		} catch (e) {
			console.log('error', e);
			return {
				status: 500,
				page: {
					component: routes.NotFound,
					props: {},
					// hideFooter: true,
				},
			};
		}

		return {
			status: 200,
			page: {
				component: comp.default,
				props: pageProps,
			},
		};
	}

	return {
		status: 404,
		page: {
			component: routes.NotFound,
			props: {},
			hideFooter: true,
		},
	};
}
