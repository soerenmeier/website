<script>
	import Intro from './index/intro.svelte';

	const blogs = [
		{
			title: 'Setting Up SSH on a VPS',
			desc: 'A step-by-step guide on configuring SSH for secure access to your VPS.',
			href: '/blog/setup-ssh'
		},
		{
			title: 'Setting Up Postfix on a VPS',
			desc: 'A step-by-step guide on configuring postfix to send emails.',
			href: '/blog/setup-postfix'
		},
		{
			title: 'Setting Up Postgres on a VPS',
			desc: 'A step-by-step guide to configure postgres.',
			href: '/blog/setup-postgres'
		},
		// {
		// 	title: 'Setup Docker on a VPS',
		// 	desc: 'In this guide a setup a vps',
		// 	href: '/blog/docker'
		// },
		// {
		// 	title: 'Setup Nginx on a VPS',
		// 	desc: 'In this guide a setup a vps',
		// 	href: '/blog/nginx'
		// }
	];
</script>

<svelte:head>
	<title>Sören Meier</title>
	<meta name="description" content="I enjoy building websites, web apps, and interconnected services.">
</svelte:head>

<Intro />

<!-- <div class="projects">
	<div class="ctn-cont">
		<h2>Projekte</h2>
	</div>
</div> -->

<div class="blog">
	<div class="ctn-cont">
		<h2>Blog / Guides</h2>

		<div class="list">
			{#each blogs as blog}
				<article>
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
	.projects {
		background-color: var(--bg-dark-400);
		color: white;

		h2 {
			font-size: 4rem;
			line-height: 1.2;
			font-weight: 600;
		}
	}

	.blog {
		padding: 10rem 0;
		background-color: var(--bg-dark-400);
		color: white;

		h2 {
			font-size: 4rem;
			line-height: 1.2;
			font-weight: 600;
			margin-bottom: 4rem;
		}

		.list {
			max-width: 600px;
		}

		article {
			margin-bottom: 1rem;
			border-bottom: 1px solid rgba(255, 255, 255, .4);

			&:last-child {
				margin-bottom: 0;
			}

			a {
				display: block;
				padding-bottom: .5rem;
				color: inherit;
				text-decoration: none;
				transition: opacity .3s ease;

				&:hover {
					opacity: .7;
				}
			}

			h3 {
				font-size: 1.5rem;
				line-height: 1.2;
				font-weight: 600;
				color: #c5c5c5;
			}

			p {
				color: #818181;
			}
		}
	}

	@media (max-width: 600px) {
		.blog {
			h2 {
				font-size: 2.5rem;
				margin-bottom: 3rem;
			}

			article h3 {
				font-size: 1.4rem;
			}
		}
	}
</style>