import { Engine, Entity } from 'tick-knock';

export const createEntity = (engine: Engine, components: unknown[] = []): Entity => {
	const entity = new Entity();
	for (const component of components) {
		entity.addComponent(component);
	}
	engine.addEntity(entity);
	return entity;
};
