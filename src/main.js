import * as routes from './pages/routes.js';

// should return { status, props }
export async function handleRoute(route) {
	if (route) {
		let comp, pageProps;
		try {
			comp = await route.load();

			if (typeof comp.loadProps === 'function')
				pageProps = await comp.loadProps(route.props);
			else
				pageProps = {};

		} catch (e) {
			console.log('error', e);
			return {
				status: 500,
				props: {
					component: routes.NotFound,
					props: {}
				}
			};
		}

		return {
			status: 200,
			props: {
				component: comp.default,
				props: pageProps
			}
		};
	}

	return {
		status: 404,
		props: {
			component: routes.NotFound,
			props: {}
		}
	};
}