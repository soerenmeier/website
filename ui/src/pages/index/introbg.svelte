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
	// let camera: Camera;
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

	async function render(t: number = 0) {
		requestAnimationFrame(render);

		// program.uniforms.uTime.value = t * 0.001;
		// program.uniforms.UResolution.value = [
		// 	window.innerWidth,
		// 	window.innerHeight,
		// ];
		// program.uniforms.uMouse.value = [
		// 	mouse.x / window.innerWidth,
		// 	1 - mouse.y / window.innerHeight,
		// 	0,
		// ];

		lines.forEach(line => {
			// Update polyline input points
			for (let i = line.points.length - 1; i >= 0; i--) {
				if (!i) {
					// For the first point, spring ease it to the mouse position
					const start = mouse
						.clone()
						.add(line.mouseOffset)
						.sub(line.points[i])
						.multiply(line.spring);
					line.mouseVelocity.add(start).multiply(line.friction);
					line.points[i].add(line.mouseVelocity);
				} else {
					// The rest of the points ease to the point in front of them, making a line
					line.points[i].lerp(line.points[i - 1], 0.9);
				}
			}
			line.polyline.updateGeometry();
		});

		renderer.render({ scene });
	}

	function onResize() {
		renderer.setSize(window.innerWidth, window.innerHeight);
		// camera.perspective({
		// 	aspect: window.innerWidth / window.innerHeight,
		// });

		lines.forEach(line => line.polyline.resize());
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

	// Just a helper function to make the code neater
	function random(a: number, b: number) {
		const alpha = Math.random();
		return a * (1.0 - alpha) + b * alpha;
	}

	const COLORS = ['#e09f7d', '#ef5d60', '#ec4067', '#a01a7d', '#311847'];

	function initLines() {
		COLORS.forEach((color, i) => {
			// Store a few values for each lines' spring movement
			const line: Line = {
				spring: random(0.02, 0.1),
				friction: random(0.7, 0.95),
				mouseVelocity: new Vec3(),
				mouseOffset: new Vec3(random(-1, 1) * 0.02),
				points: [],
				polyline: null!,
			};

			// Create an array of Vec3s (eg [[0, 0, 0], ...])
			// Note: Only pass in one for each point on the line - the class will handle
			// the doubling of vertices for the polyline effect.
			const count = 25;
			for (let i = 0; i < count; i++) {
				line.points.push(new Vec3());
			}

			// Pass in the points, and any custom elements - for example here we've made
			// custom shaders, and accompanying uniforms.
			line.polyline = new Polyline(gl, {
				points: line.points,
				vertex,
				uniforms: {
					uColor: { value: new Color(color) },
					uThickness: { value: random(20, 50) },
				},
			});

			line.polyline.mesh.setParent(scene);

			lines.push(line);
		});
	}

	onMount(() => {
		renderer = new Renderer();
		gl = renderer.gl;
		cont.appendChild(gl.canvas);
		gl.clearColor(0.9, 0.9, 0.9, 1);

		// camera = new Camera(gl);
		// camera.position.z = 5;

		scene = new Transform();

		initLines();

		onResize();

		// geometry = new Geometry(gl, {
		// 	position: {
		// 		size: 2,
		// 		data: new Float32Array([-1, -1, 3, -1, -1, 3]),
		// 	},
		// 	uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
		// });

		// program = new Program(gl, {
		// 	vertex,
		// 	fragment,
		// 	uniforms: {
		// 		uTime: { value: 0 },
		// 		UResolution: { value: [window.innerWidth, window.innerHeight] },
		// 		uMouse: { value: [0, 0, 0] },
		// 	},
		// });

		// mesh = new Mesh(gl, { geometry, program });
		// mesh.setParent(scene);

		render();
	});
</script>

<svelte:window on:resize={onResize} on:mousemove={onMouseMove} />

<div bind:this={cont}></div>

<style lang="scss">
	canvas {
		width: 100%;
		height: 100%;
		opacity: 0.05;
	}
</style>
