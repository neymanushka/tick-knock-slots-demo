import { Entity, Query, System, EntitySnapshot } from 'tick-knock';
import { ButtonComponent } from '../components/ButtonComponent';
import { SpriteComponent } from '../components/SpriteComponent';
import { ObjectComponent } from '../components/ObjectComponent';
import { Game } from '../Game';

export class ButtonSystem extends System {
	query = new Query((entity: Entity) =>
		entity.hasAll(ObjectComponent, SpriteComponent, ButtonComponent)
	);

	constructor() {
		super();

		this.query.onEntityAdded.connect(({ current }: EntitySnapshot) => {
			console.log('button added');
			const buttonComponent = current.get(ButtonComponent);
			const spriteComponent = current.get(SpriteComponent);
			const objectComponent = current.get(ObjectComponent);
			if (buttonComponent && spriteComponent && objectComponent) {
				spriteComponent.sprite.anchor.set(0.5);
				spriteComponent.sprite.buttonMode = true;
				spriteComponent.sprite.interactive = true;

				spriteComponent.sprite.on('pointerdown', () => {
					console.log('button down');
					Game.events.emit(buttonComponent.eventName + '_down');
					objectComponent.scale = 1.1;
				});

				spriteComponent.sprite.on('pointerup', () => {
					console.log('button up');
					Game.events.emit(buttonComponent.eventName + '_up');
					objectComponent.scale = 1;
				});
			}
		});

		this.query.onEntityRemoved.connect(({ current }: EntitySnapshot) => {
			console.log('button removed');
		});
	}

	onAddedToEngine() {
		this.engine.addQuery(this.query);
	}
}
