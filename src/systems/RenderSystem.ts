import { Entity, Query, System, EntitySnapshot } from 'tick-knock';
import { ObjectComponent } from '../components/ObjectComponent';

export class RenderSystem extends System {
	query = new Query((entity: Entity) => entity.hasAll(ObjectComponent));

	constructor() {
		super();

		this.query.onEntityAdded.connect(({ current }: EntitySnapshot) => {
			console.log('object added');
		});

		this.query.onEntityRemoved.connect(({ current }: EntitySnapshot) => {
			console.log('object removed');
		});
	}

	onAddedToEngine() {
		this.engine.addQuery(this.query);
	}

	public update(dt: number) {
		this.query.entities.forEach((entity) => {
			const component = entity.get(ObjectComponent);
			if (component) {
				const container = component.container;
				container.x = component.x;
				container.y = component.y;
				container.width = component.width;
				container.height = component.height;
				container.scale.set(component.scale);
			}
		});
	}
}
