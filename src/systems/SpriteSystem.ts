import { Entity, Query, System, EntitySnapshot } from 'tick-knock';
import { ObjectComponent } from '../components/ObjectComponent';
import { SpriteComponent } from '../components/SpriteComponent';

export class SpriteSystem extends System {
	query = new Query((entity: Entity) => entity.hasAll(ObjectComponent, SpriteComponent));

	constructor() {
		super();

		this.query.onEntityAdded.connect(({ current }: EntitySnapshot) => {
			console.log('sprite added');
			const spriteComponent = current.get(SpriteComponent);
			const objectComponent = current.get(ObjectComponent);
			if (spriteComponent && objectComponent) {
				objectComponent.container.addChild(spriteComponent.sprite);
			}
		});

		this.query.onEntityRemoved.connect(({ current }: EntitySnapshot) => {
			console.log('sprite removed');
			const spriteComponent = current.get(SpriteComponent);
			const objectComponent = current.get(ObjectComponent);
			if (spriteComponent && objectComponent) {
				objectComponent.container.removeChild(spriteComponent.sprite);
			}
		});
	}

	onAddedToEngine() {
		this.engine.addQuery(this.query);
	}
}
