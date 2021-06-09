import * as PIXI from 'pixi.js';
import { Game } from '../Game';

export class SymbolComponent {
	sprite: PIXI.Sprite;
	container: PIXI.Container;
	destination = 0;
	source = 0;
	spinDelayMax: number;
	spinDelay = 0;
	spinTime = 500;
	constructor(texture: PIXI.Texture, container: PIXI.Container, position: number, delay: number) {
		this.sprite = new PIXI.Sprite(texture);
		this.sprite.y = position;
		this.container = container;
		this.spinDelayMax = delay;
	}
}
