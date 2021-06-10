import * as PIXI from 'pixi.js';

export class ObjectComponent {
	container: PIXI.Container;
	x: number;
	y: number;
	width: number;
	height: number;
	constructor(x: number, y: number, width: number, height: number) {
		this.container = new PIXI.Container();
		this.container.width = this.width = width;
		this.container.height = this.height = height;
		this.container.x = this.x = x;
		this.container.y = this.y = y;
	}
}
