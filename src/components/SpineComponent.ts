import { ISkeletonData, Spine } from 'pixi-spine';

export class SpineComponent {
	spine: Spine;
	animation: string;
	constructor(data: ISkeletonData, animation: string) {
		this.spine = new Spine(data);
		this.animation = animation;
		this.spine.scale.set(0.1);
		this.spine.x = this.spine.width / 2;
		this.spine.y = this.spine.height + this.spine.height / 2;
	}
}
