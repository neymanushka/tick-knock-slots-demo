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
const CONTAINERS_PADDING = 155;
const SYMBOL_HEIGHT = 128;

export class SpinnerSystem extends System {
	symbols = new Query((entity: Entity) => entity.hasAll(ObjectComponent, SymbolComponent));
	containers: {
		container: PIXI.Container;
		delay: number;
		time: number;
		target: number;
		position: number;
	}[] = [];

	isSpinning = false;

	constructor(parentContainer: PIXI.Container) {
		super();

		for (let i = 0; i < COUNT; i++) {
			const container = createMaskedContainer(
				130 + CONTAINERS_PADDING * i,
				110 - 128,
				130,
				360,
				128
			);
			this.containers.push({ container, delay: 20, time: 0, target: 0, position: 0 });
			parentContainer.addChild(container);
		}

		this.symbols.onEntityAdded.connect(({ current }: EntitySnapshot) => {
			const symbolComponent = current.get(SymbolComponent);
			const objectComponent = current.get(ObjectComponent);
			if (symbolComponent && objectComponent) {
				for (const item of this.containers) {
					const childrenCount = item.container.children.length;
					if (childrenCount < 5) {
						objectComponent.container.y = childrenCount * objectComponent.height;
						item.container.addChild(objectComponent.container);
						return;
					}
				}
			}
		});

		Game.events.on('spin', (symbols: number) => {
			if (!this.isSpinning) {
				this.isSpinning = true;
				for (let i = 0; i < this.containers.length; i++) {
					if (this.containers[i].container.children.length) {
						this.containers[i].delay = i * SPIN_DELAY;
						this.containers[i].time = 0;
						this.containers[i].target = symbols * SYMBOL_HEIGHT;
						this.containers[i].position = this.containers[i].container.children[0].y;
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
			for (const spinner of this.containers) {
				if (spinner.delay <= 0 && spinner.time < SPIN_TIME_MAX) {
					this.isSpinning = true;
					const ease = easeInOutBack(spinner.time / SPIN_TIME_MAX);
					const t = lerp(0, spinner.target, ease);
					const count = spinner.container.children.length;
					for (let i = 0; i < count; i++) {
						const y = (spinner.position + i * SYMBOL_HEIGHT + t) % (count * SYMBOL_HEIGHT);
						spinner.container.children[i].y = Math.floor(y);
					}
					spinner.time += dt * 0.2;
				}
				spinner.delay -= dt;
			}
		}
	}
}
