<script>
	import IntroBg from './index/introbg.svelte';
</script>

<svelte:head>
	<title>Sören Meier</title>
</svelte:head>

<div class="intro">
	<div class="bg">
		<IntroBg />
	</div>

	<div class="top-placeholder"></div>

	<div class="ctn ctn-cont">
		<h1>Hi I'm Sören</h1>
		<span class="role">A Passionate Full-Stack Developer</span>
		<p>I enjoy building websites, web apps, and interconnected services especially when using Rust and Svelte.</p>

		<div class="cta">
			<a href="https://github.com/soerenmeier">Github</a>
			<a href="https://twitter.com/soeren_meier">X</a>
		</div>
	</div>
</div>

<div class="projects"></div>

<div class="blog"></div>


<style lang="scss">
	.intro {
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

		background-image: radial-gradient(circle at center top,
			#424291, var(--bg-dark-400)
		);
	}

	.top-placeholder {
		flex-grow: 1.7;
	}

	.ctn {
		position: relative;
		flex-grow: 1;
	}

	h1 {
		font-size: 5rem;
		line-height: 1.2;
		font-weight: 600;
	}

	.role {
		display: block;
		// margin-top: .2rem;
		font-weight: 500;
		font-size: 1.3rem;
		line-height: 1.2;
		opacity: .7;
	}

	.ctn {
		p {
			margin-top: 1.5rem;
			max-width: 600px;
			opacity: .5;
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
			padding: .4rem .5rem;
			border: 1px solid rgba(255, 255, 255, .5);
			transition: background-color .4s ease;

			&:hover {
				background-color: rgba(255, 255, 255, .1);
			}
		}
	}

	// .blog {
	// 	min-height: 100vh;
	// }
</style>