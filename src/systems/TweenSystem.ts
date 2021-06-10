import { Entity, Query, System, EntitySnapshot } from 'tick-knock';
import { ObjectComponent } from '../components/ObjectComponent';
import { TweenComponent } from '../components/TweenComponent';
import { gsap } from 'gsap';

import { Game } from '../Game';

export class TweenSystem extends System {
	query = new Query((entity: Entity) => entity.hasAll(ObjectComponent, TweenComponent));

	constructor() {
		super();

		const onCompleteCallback = (id: number, entity: Entity) => {
			const objectComponent = entity.get(ObjectComponent);
			if (objectComponent) {
				const message = `tween_stop_${id}`;
				gsap.killTweensOf(objectComponent);
				entity.removeComponent(TweenComponent);
				console.log(message);
				Game.events.emit(message);
			}
		};

		this.query.onEntityAdded.connect(({ current }: EntitySnapshot) => {
			console.log('tween object added');
			Game.isTweening = true;
			const tweenComponent = current.get(TweenComponent);
			const objectComponent = current.get(ObjectComponent);
			if (tweenComponent && objectComponent) {
				const count = tweenComponent.gsapVars.length - 1;
				for (const [index, tween] of tweenComponent.gsapVars.entries()) {
					const onComplete = () => onCompleteCallback(current.id, current);
					const props = index !== count ? tween : { ...tween, onComplete };
					gsap.to(objectComponent, props);
				}
			}
			//current.removeComponent(TweenComponent);
		});

		this.query.onEntityRemoved.connect(({ current }: EntitySnapshot) => {
			console.log('tween object removed');
			if (!this.query.entities.length) Game.isTweening = false;
		});
	}

	onAddedToEngine() {
		this.engine.addQuery(this.query);
	}
}
