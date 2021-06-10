import { gsap } from 'gsap';

export class TweenComponent {
	gsapVars: gsap.TweenVars[];
	constructor(gsapVars: gsap.TweenVars[]) {
		this.gsapVars = gsapVars;
	}
}
