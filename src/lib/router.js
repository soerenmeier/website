import fs from 'fs/promises';
import { pathToFileURL } from 'url';

const PAGES_PATH = '/src/pages/';

const ROUTES_PATH = '/src/gen/routes.js';

let globalLoadCounter = 0;


export default class Router {
	constructor(rootDir) {
		this.rootDir = rootDir;
		this.pages = [];
	}

	async load(inDebug) {
		globalLoadCounter += 1;

		await readPagesDir(
			this.rootDir + PAGES_PATH,
			this.pages,
			inDebug
		);
	}

	async generateRoutes() {
		// id of component
		const routes = {};
		// path to function() {}
		const pages = [];

		for (const page of this.pages) {
			const id = pages.length;
			pages.push(page);
			routes[page.uri] = id;

			if (page.slug === 'index')
				routes['/'] = id;
		}

		let file = '// This file get\'s automatically generated\n';
		file += 'export const pages = [\n';
		file += pages.map(page => {
			let comp = '\t{\n';
			comp += `\t\tslug: '${ page.slug }',\n`;
			comp += `\t\turi: '${ page.uri }',\n`;
			comp += `\t\tprops: ${ JSON.stringify(page.props) },\n`;
			comp += `\t\tload: async () => (await import('../..${
					page.path
				}')).default\n`;
			comp += '\t}';

			return comp;
		}).join(',\n');
		file += '\n];\n';

		file += 'export const routes = {\n';
		file += Object.entries(routes).map(([uri, comp]) => {
			return `\t'${ uri }': pages[${ comp }]`;
		}).join(',\n');
		file += '\n};\n';

		let currentFileContent = '';
		try {
			currentFileContent = await fs.readFile(
				this.rootDir + ROUTES_PATH,
				{ encoding: 'utf-8' }
			);
		} catch (e) {}

		if (file === currentFileContent)
			return;

		await fs.writeFile(this.rootDir + ROUTES_PATH, file);
	}

	route(uri) {
		if (uri === '/') {
			// detecting language will be done in user space
			const index = this.pages.find(p => p.slug === 'index');

		}
	}
}

export class Page {
	constructor(slug, props) {
		this.slug = slug;
		this.props = props;
	}

	get uri() {
		return `/${this.slug}.html`;
	}

	get path() {
		return `${PAGES_PATH}/${this.slug}/${this.slug}.svelte`;
	}
}



async function readPagesDir(dir, pages, inDebug) {
	const pagesEntries = await fs.readdir(dir);

	for (const entry of pagesEntries) {
		const page = await readPage(dir + entry + '/', entry, inDebug);
		if (page)
			pages.push(page);
	}
}

// dir should end with a slash
async function readPage(dir, slug, inDebug) {
	const file = pathToFileURL(dir + slug + '.js');
	const props = (await import(file + '?' + globalLoadCounter)).default;

	if (props.onlyInDebug && !inDebug)
		return null;

	return new Page(slug, props);
}