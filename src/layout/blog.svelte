<script>
	import { onMount } from 'svelte';

	import hljs from 'highlight.js/lib/core';
	import javascript from 'highlight.js/lib/languages/javascript';
	import rust from 'highlight.js/lib/languages/rust';
	import bash from 'highlight.js/lib/languages/bash';
	import 'highlight.js/styles/hybrid.css';
	import highlightCopy from '@/lib/highlightcopy.js';

	hljs.registerLanguage('javascript', javascript);
	hljs.registerLanguage('rust', rust);
	hljs.registerLanguage('bash', bash);
	// if (!import.meta.env.SSR)
	hljs.addPlugin(highlightCopy());

	export let title;
	export let desc;

	onMount(() => {
		hljs.highlightAll();
	});
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={desc}>
</svelte:head>

<div id="blog">
	<div class="intro">
		<div class="ctn-cont">
			<h1>{title}</h1>
		</div>
	</div>

	<div class="ctn">
		<div class="ctn-cont">
			<slot />
		</div>
	</div>
</div>

<style lang="scss">
	#blog {
		min-height: 100vh;
		min-height: 100svh;
		background-color: var(--bg-dark-400);
		color: white;
	}

	.intro {
		position: relative;
		// min-height: 20vh;
		padding: 10rem 0 8rem;

		background: radial-gradient(circle at center top,
			#424291, var(--bg-dark-400)
		);

		&::after {
			content: "";
			position: absolute;
			left: 0;
			bottom: 0;
			width: 100%;
			height: 5rem;
			background: linear-gradient(transparent, var(--bg-dark-400));
		}
	}

	h1 {
		font-size: 3rem;
		line-height: 1.2;
		font-weight: 600;
	}

	.ctn :global {
		padding-top: 5rem;

		h2 {
			font-size: 2rem;
			line-height: 1.2;
			font-weight: 600;
			margin-bottom: 4rem;
		}

		h3 {
			font-size: 1.5rem;
			line-height: 1.2;
			font-weight: 600;
			color: #c5c5c5;
		}

		code:not(.hljs) {
			// font-style: italic;
			padding: 0.2em 0.3em;
			background-color: #1d1f21;
		}

		pre {
			position: relative;
		}

		.highlight-js-copy {
			position: absolute;
			top: 1rem;
			right: .8rem;
			appearance: none;
			border: none;
			border-radius: 0;
			background-color: transparent;
			cursor: pointer;
			transition: opacity .4s ease;

			&:hover {
				opacity: 0.5;
			}

			path {
				fill: #cccccd;
			}
		}

		.highlight-js-noti {
			position: absolute;
			top: 1rem;
			right: 3rem;
		}
	}
</style>