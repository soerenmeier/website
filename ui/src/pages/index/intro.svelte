<script>
	import { onMount } from 'svelte';
	import { timeline, stagger } from 'chnobli';
	import { quadOut, cubicOut } from 'chnobli/easing';
	import { from, words, chars } from 'chnobli/utils';
	import IntroBg from './introbg.svelte';

	let ctnCont;

	onMount(() => {
		const h1 = ctnCont.children[0];
		const role = ctnCont.children[1];
		const text = ctnCont.children[2];
		const cta = ctnCont.children[3];

		timeline()
			.add(
				document.querySelector('.bg'),
				{
					'--bg-color-transition': '#424291',
					ease: cubicOut,
					duration: 2000,
				},
				'+=200',
			)
			.add(
				h1.children[0],
				{
					opacity: 1,
					ease: cubicOut,
					duration: 2000,
				},
				500,
			)
			.nest(
				tl => {
					tl.set(h1.children[1], { opacity: 1 })
						.add(
							chars(h1.children[1]),
							{
								opacity: 1,
								duration: 800,
							},
							stagger(p => p * 110),
						)
						.add(
							chars(h1.children[1]),
							{
								y: from(-5),
								ease: quadOut,
								duration: 400,
							},
							stagger(p => p * 110),
						);
				},
				{},
				1000,
			)
			// role
			.set(role, { opacity: 1 }, '-=200')
			.add(
				chars(role),
				{
					opacity: 1,
					duration: 800,
				},
				stagger(p => '+=' + p * 20),
			)
			// text
			.nest(
				tl => {
					tl.set(text, { opacity: 1 })
						.add(
							words(text),
							{
								y: from(5),
								ease: quadOut,
								duration: 600,
							},
							stagger(p => p * 100),
						)
						.add(
							words(text),
							{
								opacity: 1,
								duration: 800,
							},
							stagger(p => p * 100),
						);
				},
				{},
				'-=200',
			)
			// buttons
			.add(
				cta.children,
				{
					opacity: 1,
				},
				stagger(p => '+=' + (p * 800 + 400)),
			)
			.play();
	});
</script>

<div class="intro">
	<div class="bg">
		<IntroBg />
	</div>

	<div class="top-placeholder"></div>

	<div class="ctn ctn-cont" bind:this={ctnCont}>
		<h1>
			<span class="hi">Hi</span>
			<span class="name">I'm Sören</span>
		</h1>
		<span class="role">A Passionate Full-Stack Developer</span>
		<p>
			I enjoy building websites, web apps, and interconnected services
			especially when using Rust and Svelte.
		</p>

		<div class="cta">
			<a href="https://github.com/soerenmeier">Github</a>
			<a href="https://twitter.com/soeren_meier">X</a>
		</div>
	</div>
</div>

<style lang="scss">
	.intro {
		position: relative;
		display: flex;
		min-height: 105vh;
		min-height: 105svh;
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

		--bg-color-transition: var(--bg-dark-400);

		background: radial-gradient(
			circle at center top,
			var(--bg-color-transition),
			var(--bg-dark-400)
		);

		&::after {
			content: '';
			position: absolute;
			left: 0;
			bottom: 0;
			width: 100%;
			height: 10vh;
			background: linear-gradient(transparent, var(--bg-dark-400));
		}
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

		:global(span) {
			opacity: 0;
		}
	}

	.role {
		display: block;
		// margin-top: .2rem;
		font-weight: 500;
		font-size: 1.3rem;
		line-height: 1.2;
		color: rgba(255, 255, 255, 0.7);
		opacity: 0;

		:global(span) {
			opacity: 0;
		}
	}

	.ctn {
		p {
			margin-top: 1.5rem;
			max-width: 600px;
			color: rgba(255, 255, 255, 0.5);
			opacity: 0;

			:global(span) {
				opacity: 0;
			}
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
			opacity: 0;

			&:hover {
				background-color: rgba(255, 255, 255, 0.1);
			}
		}
	}

	@media (max-width: 600px) {
		h1 {
			font-size: 3rem;
		}
	}

	@media (max-width: 500px) {
		.role {
			font-size: 1.2rem;
		}
	}
</style>
