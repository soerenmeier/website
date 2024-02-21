<script>
	import { onMount, getContext } from 'svelte';

	import hljs from 'highlight.js/lib/core';
	import javascript from 'highlight.js/lib/languages/javascript';
	import rust from 'highlight.js/lib/languages/rust';
	import bash from 'highlight.js/lib/languages/bash';
	import yaml from 'highlight.js/lib/languages/yaml';
	import 'highlight.js/styles/hybrid.css';
	import highlightCopy from '@/lib/highlightcopy.js';

	const router = getContext('router');
	const currentRequest = router.currentRequest;

	hljs.registerLanguage('javascript', javascript);
	hljs.registerLanguage('rust', rust);
	hljs.registerLanguage('bash', bash);
	hljs.registerLanguage('yaml', yaml);
	hljs.addPlugin(highlightCopy());

	export let title;
	export let desc;

	function onBack() {
		router.back();
	}

	onMount(() => {
		hljs.highlightAll();
	});
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={desc} />
</svelte:head>

<div id="blog">
	<div class="back">
		<div class="ctn-cont">
			{#if router.canGoBack($currentRequest)}
				<button on:click={onBack}>Back</button>
			{:else}
				<a href="/">Go Home</a>
			{/if}
		</div>
	</div>

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

	.back {
		position: absolute;
		top: 1rem;
		z-index: 1;

		button,
		a {
			appearance: none;
			border: none;
			border-radius: 0;
			background-color: transparent;
			color: inherit;
			cursor: pointer;
			padding: 1rem 2rem 1rem 0;
			transition: opacity 0.2s ease;
			text-decoration: none;

			&:hover {
				opacity: 0.5;
			}
		}
	}

	.intro {
		position: relative;
		// min-height: 20vh;
		padding: 10rem 0 8rem;

		background: radial-gradient(
			circle at center top,
			#424291,
			var(--bg-dark-400)
		);

		&::after {
			content: '';
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
		padding-bottom: 2rem;

		h2,
		h3,
		p {
			max-width: 50rem;
		}

		h2 {
			font-size: 1.8rem;
			line-height: 1.2;
			font-weight: 600;
			margin-top: 2.5rem;
			margin-bottom: 1rem;
		}

		h3 {
			font-size: 1.3rem;
			line-height: 1.2;
			font-weight: 600;
			color: #c5c5c5;
			margin-top: 2.5rem;
			margin-bottom: 1rem;
		}

		p {
			margin-bottom: 1rem;
		}

		a {
			color: inherit;
		}

		code:not(.hljs) {
			// font-style: italic;
			padding: 0.2em 0.3em;
			background-color: #1d1f21;
		}

		code.hljs {
			margin-bottom: 1rem;
		}

		pre {
			position: relative;
		}

		.highlight-js-copy {
			position: absolute;
			top: 1rem;
			right: 0.8rem;
			appearance: none;
			border: none;
			border-radius: 0;
			background-color: transparent;
			cursor: pointer;
			transition: opacity 0.4s ease;

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
