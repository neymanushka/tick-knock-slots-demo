export const getRandomValue = (min: number, max: number): number =>
	Math.random() * (max - min) + min;

export const lerp = (start: number, end: number, t: number) => {
	return start * (1 - t) + end * t;
};

export const easeInOutBack = (x: number): number => {
	const c1 = 0.90158;
	const c2 = c1 * 1.525;

	return x < 0.5
		? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
		: (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
};
