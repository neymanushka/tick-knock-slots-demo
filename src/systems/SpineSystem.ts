import { Entity, Query, System, EntitySnapshot } from 'tick-knock';
import { ObjectComponent } from '../components/ObjectComponent';
import { SpineComponent } from '../components/SpineComponent';

export class SpineSystem extends System {
	query = new Query((entity: Entity) => entity.hasAll(ObjectComponent, SpineComponent));

	constructor() {
		super();

		this.query.onEntityAdded.connect(({ current }: EntitySnapshot) => {
			console.log('spine added');
			const spineComponent = current.get(SpineComponent);
			const objectComponent = current.get(ObjectComponent);
			if (spineComponent && objectComponent) {
				objectComponent.container.addChild(spineComponent.spine);
				spineComponent.spine.state.setAnimation(0, spineComponent.animation, true);
			}
		});

		this.query.onEntityRemoved.connect(({ current }: EntitySnapshot) => {
			console.log('spine removed');
			const spineComponent = current.get(SpineComponent);
			const objectComponent = current.get(ObjectComponent);
			if (spineComponent && objectComponent) {
				objectComponent.container.removeChild(spineComponent.spine);
			}
		});
	}

	onAddedToEngine() {
		this.engine.addQuery(this.query);
	}
}
