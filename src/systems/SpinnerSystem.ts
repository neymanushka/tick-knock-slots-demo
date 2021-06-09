import { Entity, Query, System, EntitySnapshot } from 'tick-knock';
import { SymbolComponent } from '../components/SymbolComponent';
import { lerp, easeInOutBack } from '../helpers/Util';

import { Game } from '../Game';

const SPIN_TIME_MAX = 500;

export class SpinnerSystem extends System {
	query = new Query((entity: Entity) => entity.has(SymbolComponent));
	isSpinning = false;

	constructor() {
		super();

		this.query.onEntityAdded.connect(({ current }: EntitySnapshot) => {
			const component = current.get(SymbolComponent);
			if (component) {
				component.container.addChild(component.sprite);
			}
		});

		// this.query.onEntityRemoved.connect(({ current }: EntitySnapshot) => {
		// 	const comp = current.get(Component) as Component;
		// 	container.removeChild(comp.sprite);
		// });

		Game.events.on('spin', (time: number) => {
			if (!this.isSpinning) {
				this.isSpinning = true;
				this.query.entities.forEach((entity) => {
					const component = entity.get(SymbolComponent);
					if (component) {
						component.source = component.sprite.y;
						component.destination = component.sprite.height * time;
						component.spinDelay = 0;
						component.spinTime = 0;
					}
				});
			}
		});
	}

	onAddedToEngine() {
		this.engine.addQuery(this.query);
	}

	public update(dt: number) {
		super.update(dt);
		if (this.isSpinning) {
			//console.log('-----');
			this.query.entities.forEach((entity) => {
				const component = entity.get(SymbolComponent);
				if (component) {
					this.isSpinning = false;
					if (component.spinDelay > component.spinDelayMax && component.spinTime < SPIN_TIME_MAX) {
						const norm = component.spinTime / SPIN_TIME_MAX;
						const ease = easeInOutBack(norm);
						const t = lerp(0, component.destination, ease);
						let pos = component.source + t;
						if (pos > 9 * component.sprite.height) {
							pos = -component.sprite.height + (pos % (9 * component.sprite.height));
						}
						component.sprite.y = pos;
						// if (!component.spinDelayMax)
						// 	console.log(component.sprite.height * 3, component.source + t, pos);
						component.spinTime += dt * 0.2;
					}
					if (component.spinTime < SPIN_TIME_MAX) this.isSpinning = true;
					component.spinDelay += dt;
				}
			});
		}
	}
}
