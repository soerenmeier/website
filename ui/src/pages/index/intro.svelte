<div class="intro">
	<div class="center">
		<h1>Hi I'm Sören</h1>
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
		display: flex;
		height: calc(100vh - 2rem);
		padding-top: 2rem;
		text-align: center;
		justify-content: center;
		align-items: center;
	}

	.center {
		width: 100%;
		max-width: 540px;
		/* margin-top: 1rem; */
	}

	h1 {
		font-size: 3rem;
		font-weight: 700;
		line-height: 1.5;
	}

	.role {
		display: block;
		font-size: 1.25rem;
		font-weight: 500;
		margin-bottom: 1.25rem;
		color: var(--white-60);
	}

	p {
		color: var(--white-60);
	}

	.cta {
		display: flex;
		justify-content: center;
		margin-top: 2rem;
		gap: 2rem;

		a {
			display: block;
			padding: 0.5rem 1rem;
			text-decoration: none;
			color: var(--white-60);
			font-weight: 700;
			border: 1px solid currentColor;
			box-shadow: 2px 2px 0 var(--white-60);

			&:hover,
			&:focus {
				transform: translate(-1px, -1px);
				box-shadow: 3px 3px 0;
				outline: none;
			}

			&:active {
				transform: translate(1px, 1px);
				box-shadow: 1px 1px 0;
			}
		}
	}
</style>
