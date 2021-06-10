import { Engine, Entity, Query, System, EntitySnapshot } from 'tick-knock';
import * as PIXI from 'pixi.js';
import { getRandomValue } from './helpers/Util';
import { SpineParser } from 'pixi-spine';

import { Game } from './Game';

import { SpinnerSystem } from './systems/SpinnerSystem';
import { SpriteSystem } from './systems/SpriteSystem';
import { SpineSystem } from './systems/SpineSystem';
import { ButtonSystem } from './systems/ButtonSystem';
import { TweenSystem } from './systems/TweenSystem';
import { RenderSystem } from './systems/RenderSystem';

import { SymbolComponent } from './components/SymbolComponent';
import { ObjectComponent } from './components/ObjectComponent';
import { SpriteComponent } from './components/SpriteComponent';
import { SpineComponent } from './components/SpineComponent';
import { ButtonComponent } from './components/ButtonComponent';
import { TweenComponent } from './components/TweenComponent';

const engine = new Engine();

const app = new PIXI.Application({
	width: 1024,
	height: 673,
	backgroundColor: 0x4ec0ca,
});

const gameContainer = document.querySelector('.game-container') as HTMLElement;
gameContainer.appendChild(app.renderer.view);
const spinButton = document.querySelector('.button-spin') as HTMLElement;
spinButton.onpointerdown = () => (spinButton.style.opacity = '1');

spinButton.onpointerup = () => {
	spinButton.style.opacity = '0.5';
	Game.events.emit('spin', 15);
};

SpineParser.registerLoaderPlugin();

app.loader
	.add('pixie', 'assets/pixie.json')
	.add('symbols', 'assets/symbols.json')
	.load((loader, resources) => {
		Game.app = app;
		Game.resources = resources;

		app.stage.addChild(Game.backgroundContainer);
		app.stage.addChild(Game.spinnersContainer);
		app.stage.addChild(Game.uiContainer);

		const background = PIXI.Sprite.from('./assets/table.png');
		background.scale.set(0.6);
		background.x = 25;
		Game.backgroundContainer.addChild(background);

		const symbols = Object.keys(resources.symbols.textures);
		const getRandomTexture = (): PIXI.Texture => {
			const index = Math.floor(getRandomValue(0, symbols.length));
			const texture = resources.symbols.textures[symbols[index]];
			return texture;
		};

		for (let i = 0; i < 5 * 5; i++) {
			const animation = i % 4 ? 'running' : 'jump';
			const entity = new Entity();
			entity.addComponent(new ObjectComponent(0, 0, 128, 128, i % 2 ? 1 : 0.1));
			if (i % 2) entity.addComponent(new SpriteComponent(getRandomTexture()));
			else entity.addComponent(new SpineComponent(resources.pixie.spineData, animation));
			entity.addComponent(new SymbolComponent());
			engine.addEntity(entity);
		}

		const entity = new Entity();
		const obj = new ObjectComponent(50, 600, 128, 128);
		entity.addComponent(obj);
		entity.addComponent(new SpriteComponent(resources.symbols.textures['14.png']));
		entity.addComponent(new ButtonComponent('button_test_event'));
		engine.addEntity(entity);
		Game.uiContainer.addChild(obj.container);

		let sprite: Entity;
		Game.events.on('button_test_event_down', () => {
			sprite = new Entity();
			const obj = new ObjectComponent(900, 600 - 64, 128, 128);
			sprite.addComponent(obj);
			sprite.addComponent(new SpriteComponent(resources.symbols.textures['15.png']));
			engine.addEntity(sprite);
			Game.uiContainer.addChild(obj.container);
		});

		Game.events.on('button_test_event_up', () => {
			engine.removeEntity(sprite);
		});

		const query = new Query((entity: Entity) => entity.hasAll(ObjectComponent, SymbolComponent));
		engine.addQuery(query);

		Game.events.on('spinner_stop', () => {
			query.entities.forEach((entity) => {
				const tween = new TweenComponent([{ x: 310, y: 250, duration: 3, yoyo: true, repeat: 1 }]);
				entity.addComponent(tween);
			});
		});

		Game.events.on('tween_stop_26', () => {
			const tween = new TweenComponent([
				{ scale: 2, duration: 1, yoyo: true, repeat: 1 },
				{ x: 500, duration: 2, yoyo: true, repeat: 1 },
			]);
			entity.addComponent(tween);
		});

		engine.addSystem(new ButtonSystem());
		engine.addSystem(new SpineSystem());
		engine.addSystem(new SpinnerSystem(Game.spinnersContainer));
		engine.addSystem(new SpriteSystem());
		engine.addSystem(new TweenSystem());
		engine.addSystem(new RenderSystem());

		let lastTimestamp = 16;
		const run = (timestamp = 0) => {
			const dt = timestamp - lastTimestamp;
			lastTimestamp = timestamp;
			engine.update(dt);
			app.renderer.render(app.stage);
			requestAnimationFrame(run);
		};
		run();
	});
