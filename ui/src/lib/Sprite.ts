export default class Sprite {
	img: HTMLImageElement; // the image
	w: number; // w, h of the square
	h: number;

	// w, h of the square
	constructor(img: string, w: number, h: number) {
		this.img = new Image();
		this.img.src = img;
		this.w = w;
		this.h = h;
	}

	draw(
		x: number,
		y: number,
		ctx: any,
		dX: number,
		dY: number,
		dW: number,
		dH: number,
	) {
		ctx.drawImage(
			this.img,
			x * this.w,
			y * this.h,
			this.w,
			this.h,
			dX,
			dY,
			dW,
			dH,
		);
	}
}
