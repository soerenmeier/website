import App from './app.svelte';
import pages, {
	setCurrentPage, setPageContext, pagesToExport, publicUrl
} from './lib/pages.js';

// { addr, method, uri }
export async function render(url, template) {
	const page = pages.byUri(url);
	if (!page) {
		return {
			status: 404,
			html: ''
		};
	}
	
	const html = await renderPage(page, url.split('/').length - 2, template);

	return {
		status: 200,
		html
	};
}

// page should be from pages
/// ## Do not call this concurrently
export async function renderPage(page, depth, template) {
	setCurrentPage(page);

	const ctx = {
		pageSlug: page.slug,
		depth
	};
	setPageContext(ctx);

	const svelteComp = await page.load();

	const props = {};

	const app = App.render({
		page: { comp: svelteComp, props }
	});

	let head = app.head;
	head += `<script>window.PAGE_CONTEXT = ${
		JSON.stringify(ctx)
	};</script>\n`;
	head += `<link rel="canonical" href="${ page.uri }" />`;

	return template
		.replace('<!--page-title-->', page.prop('title') ?? '')
		.replace('<!--page-description-->', page.prop('description') ?? '')
		.replaceAll('../assets/', publicUrl('assets/'))
		.replace('<!--ssr-head-->', head)
		.replace('<!--ssr-body-->', app.html);
}

export function indexPage() {
	return pages.bySlug('index');
}

export { pagesToExport };