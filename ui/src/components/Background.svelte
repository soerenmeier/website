<script lang="ts">
	import { onMount } from 'svelte';
	import { sineIn, quintIn, quintOut } from 'chnobli/easing';
	import {
		Box,
		Camera,
		Color,
		Geometry,
		Mesh,
		Polyline,
		Program,
		Renderer,
		Transform,
		Triangle,
		Vec3,
		type OGLRenderingContext,
	} from 'ogl';
	// import Context2d from 'fire/dom/Context2d';
	// @ts-ignore
	import fragment from './shaders/fragment.glsl?raw';
	// @ts-ignore
	import vertex from './shaders/vertex.glsl?raw';

	let cont: HTMLElement;
	let renderer: Renderer;
	let gl: OGLRenderingContext;
	let scene: Transform;
	let geometry: Geometry;
	let program: Program;
	let mesh: Mesh;

	type Line = {
		spring: number;
		friction: number;
		mouseVelocity: Vec3;
		mouseOffset: Vec3;
		points: Vec3[];
		polyline: Polyline;
	};

	let lines: Line[] = [];

	let mouse = new Vec3();

	let failedRender = false;
	async function render(t: number = 0) {
		if (failedRender) return;
		requestAnimationFrame(render);

		program.uniforms.uTime.value = t * 0.001;

		renderer.render({ scene: mesh });
	}

	function getSize(): [number, number] {
		return [window.innerWidth, window.innerHeight];

		// use the container size
		// return [cont.clientWidth, cont.clientHeight];
	}

	function onResize() {
		renderer.setSize(...getSize());

		if (program) {
			program.uniforms.uResolution.value = [
				window.innerWidth,
				window.innerHeight,
			];
		}
	}

	function onMouseMove(e: any) {
		// mouse = {
		// 	x: e.pageX,
		// 	y: Math.min(e.pageY, window.innerHeight),
		// };

		mouse.set(
			(e.pageX / gl.renderer.width) * 2 - 1,
			(e.pageY / gl.renderer.height) * -2 + 1,
			0,
		);
	}

	onMount(() => {
		renderer = new Renderer();
		gl = renderer.gl;
		cont.appendChild(gl.canvas);
		gl.clearColor(1, 1, 1, 1);

		onResize();

		// Rather than using a plane (two triangles) to cover the viewport here is a
		// triangle that includes -1 to 1 range for 'position', and 0 to 1 range for 'uv'.
		// Excess will be out of the viewport.

		//         position                uv
		//      (-1, 3)                  (0, 2)
		//         |\                      |\
		//         |__\(1, 1)              |__\(1, 1)
		//         |__|_\                  |__|_\
		//   (-1, -1)   (3, -1)        (0, 0)   (2, 0)

		geometry = new Triangle(gl);

		program = new Program(gl, {
			vertex,
			fragment,
			uniforms: {
				uTime: { value: 0 },

				uResolution: { value: getSize() },
				uDirection: { value: [0, 0] },
				intensity: { value: 0.5 },
			},
		});

		mesh = new Mesh(gl, { geometry, program });

		render();
	});
</script>

<svelte:window on:resize={onResize} on:mousemove={onMouseMove} />

<div bind:this={cont}></div>

<style lang="scss">
	div {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: -1;
		background-color: black;
	}
</style>
