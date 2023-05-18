import App from './app.svelte';
import pages, { setCurrentPage, setPageContext } from './lib/pages.js';

async function main() {
	const ctx = window.PAGE_CONTEXT;
	setPageContext(ctx);

	const page = pages.bySlug(ctx.pageSlug);
	if (!page) {
		alert('404');
		return;
	}
	setCurrentPage(page);

	const svelteComp = await page.load();

	const props = {};

	const app = new App({
		target: document.body,
		hydrate: true,
		props: {
			page: { comp: svelteComp, props }
		}
	});
}
main();