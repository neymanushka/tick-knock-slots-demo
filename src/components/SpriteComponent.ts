import * as PIXI from 'pixi.js';

export class SpriteComponent {
	sprite: PIXI.Sprite;
	constructor(texture: PIXI.Texture, x = 0, y = 0) {
		this.sprite = new PIXI.Sprite(texture);
		this.sprite.x = x;
		this.sprite.y = y;
	}
}
