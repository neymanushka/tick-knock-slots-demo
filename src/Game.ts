import * as PIXI from 'pixi.js';
import { EventEmitter } from './EventEmitter';

export class Game {
	static app: PIXI.Application;
	static resources: { [name: string]: PIXI.ILoaderResource };
	static events: EventEmitter = new EventEmitter();

	static spinnersContainer: PIXI.Container = new PIXI.Container();
	static backgroundContainer: PIXI.Container = new PIXI.Container();
	static uiContainer: PIXI.Container = new PIXI.Container();
}
