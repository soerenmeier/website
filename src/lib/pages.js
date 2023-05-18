import { routes, pages } from '../gen/routes.js';
import { range } from 'fire/util.js';

function setGlobal(key, val) {
	if (typeof window !== 'undefined')
		window['__global__' + key] = val;
	else
		global['__global__' + key] = val;
}

function getGlobal(key) {
	if (typeof window !== 'undefined')
		return window['__global__' + key];
	return global['__global__' + key];
}

// ctx
export function setPageContext(ctx) {
	setGlobal('pageContext', ctx);
}

function pageContext() {
	return getGlobal('pageContext');
}

// currentPage
export function setCurrentPage(comp) {
	setGlobal('currentPage', comp);
}

export function currentPage() {
	return getGlobal('currentPage');
}

// methods

export function byUri(uri) {
	return routes[uri] ? new Page(routes[uri]) : null;
}

export function bySlug(slug) {
	const page = pages.find(c => c.slug === slug);
	return page ? new Page(page) : null;
}

export function publicUrl(add = '') {
	if (add.startsWith('/'))
		add = add.substr(1);

	const goBack = range(0, pageContext().depth).map(() => '../').join('');

	return goBack + add;
}

/// points to the assets folder
export function assetsUrl(add = '') {
	if (add.startsWith('/'))
		add = add.substr(1);
	return publicUrl('assets/' + add);
}

// component
export class Page {
	constructor(inner) {
		this.inner = inner;
	}

	async load() {
		return await this.inner.load();
	}

	get slug() {
		return this.inner.slug;
	}

	get uri() {
		// todo: need to make it relative
		return this.inner.uri;
	}

	relativeUrl() {
		return publicUrl(this.uri);
	}

	props() {
		return this.inner.props;
	}

	has(key) {
		return key in (this.langs()[lang] ?? {});
	}

	prop(key) {
		return this.props()[key] ?? null;
	}
}

export function pagesToExport() {
	return pages.map(p => new Page(p));
}

// export methods
export default { byUri, bySlug, currentPage };