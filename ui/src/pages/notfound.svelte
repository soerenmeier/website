<script>
	import IntroBg from './index/introbg.svelte';
</script>

<svelte:head>
	<title>Page not found</title>
</svelte:head>

<div class="intro">
	<div class="bg">
		<IntroBg />
	</div>

	<div class="top-placeholder"></div>

	<div class="ctn ctn-cont">
		<div class="inner">
			<h1>The page could not be found</h1>
			<p>
				I enjoy building websites, web apps, and interconnected services
				especially when using Rust and Svelte.
			</p>

			<div class="cta">
				<a href="/">To the homepage</a>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.intro {
		position: relative;
		display: flex;
		min-height: 100vh;
		min-height: 100svh;
		flex-direction: column;
		background-color: var(--bg-dark-400);
		color: #fff;
	}

	.bg {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
		background: radial-gradient(
			circle at center top,
			#424291,
			var(--bg-dark-400)
		);
	}

	.top-placeholder {
		flex-grow: 1.7;
	}

	.ctn {
		position: relative;
		flex-grow: 1;
	}

	.inner {
		max-width: 600px;
	}

	h1 {
		font-size: 3rem;
		line-height: 1.2;
		font-weight: 600;
	}

	p {
		margin-top: 1rem;
		color: rgba(255, 255, 255, 0.7);
	}

	.cta {
		display: flex;
		margin-top: 2.5rem;
		gap: 1rem;
	}

	a {
		display: block;
		color: white;
		text-decoration: none;
		padding: 0.4rem 0.88rem;
		border: 1px solid rgba(255, 255, 255, 0.5);
		transition: background-color 0.4s ease;

		&:hover {
			background-color: rgba(255, 255, 255, 0.1);
		}
	}
</style>
