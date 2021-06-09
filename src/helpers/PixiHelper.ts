import * as PIXI from 'pixi.js';

export const createMaskedContainer = (
	x: number,
	y: number,
	width: number,
	height: number
): PIXI.Container => {
	const container = new PIXI.Container();
	container.x = x;
	container.y = y;
	container.width = width;
	container.height = height;
	container.mask = new PIXI.Graphics().beginFill(0xffffff).drawRect(x, y, width, height).endFill();
	// container.addChild(
	// 	new PIXI.Graphics().beginFill(0xffffff).drawRect(0, 0, width, height).endFill()
	// );
	return container;
};
