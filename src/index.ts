import { Engine, Entity, Query, System, EntitySnapshot } from 'tick-knock';
import * as PIXI from 'pixi.js';
import { createMaskedContainer } from './helpers/PixiHelper';
import { getRandomValue } from './helpers/Util';
import { Game } from './Game';

import { SpinnerSystem } from './systems/SpinnerSystem';
import { SymbolComponent } from './components/SymbolComponent';

const engine = new Engine();

const app = new PIXI.Application({
	width: 1024,
	height: 573,
	backgroundColor: 0x4ec0ca,
});

const gameContainer = document.querySelector('.game-container') as HTMLElement;
gameContainer.appendChild(app.renderer.view);
const spinButton = document.querySelector('.button-spin') as HTMLElement;
spinButton.onpointerdown = () => {
	spinButton.style.opacity = '1';
};

spinButton.onpointerup = () => {
	console.log('click');
	spinButton.style.opacity = '0.5';
	Game.events.emit('spin', 9);
};

app.loader.add('symbols', 'assets/symbols.json').load((loader, resources) => {
	Game.app = app;
	Game.resources = resources;

	app.stage.addChild(Game.backgroundContainer);
	app.stage.addChild(Game.spinnersContainer);

	const background = PIXI.Sprite.from('./assets/table.png');
	background.scale.set(0.6);
	background.x = 25;
	Game.backgroundContainer.addChild(background);

	const container0 = createMaskedContainer(130, 115, 130, 350);
	Game.spinnersContainer.addChild(container0);
	const container1 = createMaskedContainer(280, 115, 130, 350);
	Game.spinnersContainer.addChild(container1);
	const container2 = createMaskedContainer(435, 115, 130, 350);
	Game.spinnersContainer.addChild(container2);
	const container3 = createMaskedContainer(590, 115, 130, 350);
	Game.spinnersContainer.addChild(container3);
	const container4 = createMaskedContainer(745, 115, 130, 350);
	Game.spinnersContainer.addChild(container4);

	const symbols = Object.keys(resources.symbols.textures);

	const getTexture = (): PIXI.Texture => {
		const index = Math.floor(getRandomValue(0, symbols.length));
		const texture = resources.symbols.textures[symbols[index]];
		return texture;
	};

	const populate = (container: PIXI.Container, delay: number) => {
		for (let i = 0; i < 10; i++) {
			const entity = new Entity();
			const texture = getTexture();
			entity.addComponent(
				new SymbolComponent(texture, container, -texture.height + i * texture.height, delay)
			);
			engine.addEntity(entity);
		}
	};

	populate(container0, 0);
	populate(container1, 100);
	populate(container2, 200);
	populate(container3, 300);
	populate(container4, 400);

	engine.addSystem(new SpinnerSystem());

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
