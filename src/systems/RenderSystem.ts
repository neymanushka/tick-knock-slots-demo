import { Entity, Query, System, EntitySnapshot } from 'tick-knock';
import { ObjectComponent } from '../components/ObjectComponent';

export class RenderSystem extends System {
	query = new Query((entity: Entity) => entity.hasAll(ObjectComponent));

	constructor() {
		super();

		this.query.onEntityAdded.connect(({ current }: EntitySnapshot) => {
			console.log('object added');
			const child = current.get(ObjectComponent);
			if (child && child.parent) {
				const parent = child.parent.get(ObjectComponent);
				if (parent) {
					parent.container.addChild(child.container);
					parent.children.add(current);
				}
			}
		});

		this.query.onEntityRemoved.connect(({ current }: EntitySnapshot) => {
			console.log('object removed');
			const objectComponent = current.get(ObjectComponent);
			if (objectComponent) {
				for (const child of objectComponent.children.values()) {
					this.engine.removeEntity(child);
					objectComponent.children.delete(child);
				}
				if (objectComponent.parent) {
					const parent = objectComponent.parent.get(ObjectComponent);
					parent?.children.delete(current);
				}
			}
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
				container.angle = component.angle;
			}
		});
	}
}
