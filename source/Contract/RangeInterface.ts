export interface RangeInterface {
	min: number;
	max: number;
	size: number;

	contains(...args: Array<number>): boolean;
}
