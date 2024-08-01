<script>
	import Intro from './index/intro.svelte';

	const blogs = [
		{
			title: 'Setting Up SSH on a VPS',
			desc: 'A step-by-step guide on configuring SSH for secure access to your VPS.',
			href: '/blog/setup-ssh',
		},
		{
			title: 'Setting Up Postfix on a VPS',
			desc: 'A step-by-step guide on configuring postfix to send emails.',
			href: '/blog/setup-postfix',
		},
		{
			title: 'Setting Up Postgres on a VPS',
			desc: 'A step-by-step guide to configure postgres.',
			href: '/blog/setup-postgres',
		},
		{
			title: 'Setting Up Docker on a VPS',
			desc: 'A step-by-step guide on setting up docker to run containers.',
			href: '/blog/setup-docker',
		},
		{
			title: 'Setting Up Nginx on a VPS',
			desc: 'A step-by-step guide on setting up nginx as a reverse proxy.',
			href: '/blog/setup-nginx',
		},
		{
			title: 'Setting Up Gitlab on a VPS',
			desc: 'A step-by-step guide on setting up gitlab.',
			href: '/blog/setup-gitlab',
		},
		{
			title: 'Setting Up Kellnr on a VPS',
			desc: 'A step-by-step guide on setting up kellnr.',
			href: '/blog/setup-kellnr',
		},
	];

	const projects = [
		{
			title: 'Chuchi',
			desc: 'Libraries for http or encrypted tcp communication in rust and routing and other utilities in javascript.',
			href: 'http://chuchi.dev',
		},
		{
			title: 'Chnobli - the best animation library :P (WIP)',
			desc: "Chnobli is garlic in swiss german. It's my attempt at an animation library.",
			href: 'https://chnobli.com',
		},
		{
			title: 'Livgood',
			desc: 'Connecting building administrators and renters via a touchscreen panel at the building entrance or an app.',
			href: 'https://livgood.ch',
		},
		{
			title: 'Webtoolbelt',
			desc: 'An easy tool to lookup dns records or base64 encode a string.',
			href: 'http://webtoolbelt.dev',
		},
		{
			title: 'Iron OS',
			desc: 'Buildroot based GNU/Linux running chromium in kiosk mode, used at livgood.',
			href: 'http://iron-os.com',
		},
		{
			title: 'Alpenwind',
			desc: 'My home server application allowing to stream movies and store password.',
			href: 'https://github.com/soerenmeier/alpenwind',
		},
	];
</script>

<svelte:head>
	<title>Sören Meier</title>
	<meta
		name="description"
		content="I enjoy building websites, web apps, and interconnected services."
	/>
</svelte:head>

<Intro />

<div class="box">
	<h2>Projects</h2>

	<div class="projects">
		{#each projects as projects}
			<article class="project">
				<a href={projects.href}>
					<h3>{projects.title}</h3>
					<p>{projects.desc}</p>
				</a>
			</article>
		{/each}
	</div>
</div>

<div class="box my-section">
	<div class="ctn-cont">
		<h2>Blog / Guides</h2>

		<div class="blogs">
			{#each blogs as blog}
				<article class="blog">
					<a href={blog.href}>
						<h3>{blog.title}</h3>
						<p>{blog.desc}</p>

						<!-- <p>Created on <datetime /> -->
					</a>
				</article>
			{/each}
		</div>
	</div>
</div>

<style lang="scss">
	h2 {
		text-align: center;
		font-weight: 700;
		font-size: 1.5rem;
		margin-bottom: 2rem;
	}

	.projects {
		display: grid;
		gap: 2rem;
	}

	.project {
		a {
			display: block;
			text-decoration: none;
			color: inherit;
			padding: 1rem;
			height: 100%;
			border: 1px solid var(--white-40);
			/* border-bottom: 1px solid var(--white-60); */
			box-shadow: 2px 2px 0 var(--white-40);

			&:hover {
				transform: translate(-1px, -1px);
				box-shadow: 3px 3px 0 var(--white-40);
			}
		}

		h3 {
			font-weight: 700;
			/* color: var(--white-60); */
			letter-spacing: 0.02rem;
		}

		p {
			color: var(--white-60);
		}
	}

	.blogs {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.blog {
		a {
			display: block;
			text-decoration: none;
			color: inherit;
			// border-bottom: 1px solid var(--white-40);

			&:hover {
				transform: translateX(2px);
			}
		}

		h3 {
			font-weight: 700;
			letter-spacing: 0.02rem;
			text-decoration: underline;
			text-underline-offset: 0.2rem;
		}
	}

	@media (min-width: 740px) {
		.projects {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
