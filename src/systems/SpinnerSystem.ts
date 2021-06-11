import { Entity, Query, System, EntitySnapshot } from 'tick-knock';
import * as PIXI from 'pixi.js';
import { createMaskedContainer } from '../helpers/PixiHelper';

import { ObjectComponent } from '../components/ObjectComponent';
import { SymbolComponent } from '../components/SymbolComponent';

import { lerp, easeInOutBack } from '../helpers/Util';

import { Game } from '../Game';

const SPIN_TIME_MAX = 500;
const SPIN_DELAY = 20;
const COUNT = 5;
const PADDING = 20;
const SPINNER_WIDTH = 134;
const SYMBOL_HEIGHT = 128;

export class SpinnerSystem extends System {
	symbols = new Query((entity: Entity) => entity.hasAll(ObjectComponent, SymbolComponent));
	container: PIXI.Container;
	spinners: {
		components: ObjectComponent[];
		delay: number;
		time: number;
		target: number;
		position: number;
	}[] = [];

	isSpinning = false;

	constructor(parentContainer: PIXI.Container) {
		super();

		const width = (PADDING + SPINNER_WIDTH) * COUNT;
		this.container = createMaskedContainer(130, 110 - 128, width, 360, 128);
		parentContainer.addChild(this.container);

		for (let i = 0; i < COUNT; i++) {
			this.spinners.push({
				delay: 20,
				time: 0,
				target: 0,
				position: 0,
				components: [],
			});
		}

		this.symbols.onEntityAdded.connect(({ current }: EntitySnapshot) => {
			const symbolComponent = current.get(SymbolComponent);
			const objectComponent = current.get(ObjectComponent);
			if (symbolComponent && objectComponent) {
				for (const [i, spinner] of this.spinners.entries()) {
					const childrenCount = spinner.components.length;
					if (childrenCount < 5) {
						objectComponent.y = childrenCount * objectComponent.height;
						objectComponent.x = i * (SPINNER_WIDTH + PADDING);
						this.container.addChild(objectComponent.container);
						spinner.components.push(objectComponent);
						return;
					}
				}
			}
		});

		Game.events.on('spin', (symbols: number) => {
			if (!this.isSpinning && !Game.isTweening) {
				Game.events.emit('spinner_run');
				this.isSpinning = true;
				for (const [i, spinner] of this.spinners.entries()) {
					if (spinner.components.length) {
						spinner.delay = i * SPIN_DELAY;
						spinner.time = 0;
						spinner.target = symbols * SYMBOL_HEIGHT;
						spinner.position = spinner.components[0].y;
					}
				}
			}
		});

		// this.query.onEntityRemoved.connect(({ current }: EntitySnapshot) => {
		// 	const comp = current.get(Component) as Component;
		// 	container.removeChild(comp.sprite);
		// });
	}

	onAddedToEngine() {
		this.engine.addQuery(this.symbols);
	}

	public update(dt: number) {
		if (this.isSpinning) {
			this.isSpinning = false;
			for (const spinner of this.spinners) {
				if (spinner.delay <= 0 && spinner.time < SPIN_TIME_MAX) {
					this.isSpinning = true;
					const ease = easeInOutBack(spinner.time / SPIN_TIME_MAX);
					const t = lerp(0, spinner.target, ease);
					const count = spinner.components.length;
					for (const [i, component] of spinner.components.entries()) {
						const y = (spinner.position + i * SYMBOL_HEIGHT + t) % (count * SYMBOL_HEIGHT);
						component.y = Math.floor(y);
					}
					spinner.time += dt * 0.2;
				}
				spinner.delay -= dt;
			}
			if (!this.isSpinning) Game.events.emit('spinner_stop');
		}
	}
}
