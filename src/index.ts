import { Engine, Entity, Query, System, EntitySnapshot } from 'tick-knock';
import { createEntity } from './helpers/EcsHelpers';
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

		const background = PIXI.Sprite.from('./assets/table.webp');
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
			const symbolContainer = createEntity(engine, [
				new ObjectComponent({ width: 128, height: 128 }),
				new SymbolComponent(),
			]);
			if (i % 2) {
				createEntity(engine, [
					new ObjectComponent({ width: 128, height: 128, parent: symbolContainer }),
					new SpriteComponent(getRandomTexture()),
				]);
			} else {
				const animation = i % 4 ? 'running' : 'jump';
				createEntity(engine, [
					new ObjectComponent({ width: 128, height: 128, scale: 0.1, parent: symbolContainer }),
					new SpineComponent(resources.pixie.spineData, animation),
				]);
			}
		}

		const uiLayerEntity = createEntity(engine, [
			new ObjectComponent({ container: Game.uiContainer }),
		]);

		const entity = createEntity(engine, [
			new ObjectComponent({
				x: 50,
				y: 600,
				width: 128,
				height: 128,
				parent: uiLayerEntity,
			}),
			new SpriteComponent(resources.symbols.textures['14.png']),
			new ButtonComponent('button_test_event'),
		]);

		Game.events.on('button_test_event_down', () => {
			const sprite = createEntity(engine, [
				new ObjectComponent({
					x: 900,
					y: 600 - 64,
					width: 128,
					height: 128,
					parent: uiLayerEntity,
				}),
				new SpriteComponent(resources.symbols.textures['15.png']),
			]);

			Game.events.on('button_test_event_up', () => {
				engine.removeEntity(sprite);
			});
		});

		const query = new Query((entity: Entity) => entity.hasAll(ObjectComponent, SymbolComponent));
		engine.addQuery(query);

		const ramki: Entity[] = [];
		Game.events.on('spinner_stop', () => {
			query.entities
				.filter((entity) => entity.get(ObjectComponent)?.y === 256)
				.forEach((entity) => {
					const ramka = createEntity(engine, [
						new ObjectComponent({
							x: 0,
							y: 0,
							width: 128,
							height: 128,
							parent: entity,
						}),
						new SpriteComponent(PIXI.Texture.from('./assets/ramka.webp')),
					]);
					ramki.push(ramka);
				});
			query.entities.forEach((entity) => {
				const tween = new TweenComponent([{ x: 310, y: 250, duration: 3, yoyo: true, repeat: 1 }]);
				entity.addComponent(tween);
			});
		});

		Game.events.on('spinner_run', () => {
			ramki.forEach((entity) => engine.removeEntity(entity));
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
