import { RangeInterface } from '../Contract/RangeInterface';
import { Range } from './Range';

/**
 * Collection of Range objects
 *
 * @export
 * @class RangeCollection
 * @implements {RangeInterface}
 */
export class RangeCollection implements RangeInterface {
	private readonly ranges: ReadonlyArray<Range>;

	public readonly min: number;
	public readonly max: number;
	public readonly size: number;

	/**
	 * Creates an instance of RangeCollection
	 *
	 * @param {*} ranges
	 * @memberof RangeCollection
	 */
	constructor(...ranges: Array<Range | number>) {
		const { constructor: { normalize } } = Object.getPrototypeOf(this);

		this.ranges = normalize(ranges.length ? ranges : [new Range()]);

		this.min = Math.min(...this.ranges.map(({ min }) => min));
		this.max = Math.max(...this.ranges.map(({ max }) => max));
		this.size = this.ranges.reduce((carry, range) => carry + range.size, 0);
	}

	/**
	 * Is the value contained by one or more of the Range objects
	 *
	 * @param {number} value
	 * @returns {boolean} contains
	 * @memberof RangeCollection
	 */
	contains(...values: Array<number>) {
		const contains = values.filter(
			(value) =>
				this.ranges.filter((range) => range.contains(value)).length > 0
		);

		return contains.length === values.length;
	}

	/**
	 * Represent the RangeCollection as string
	 *
	 * @returns {string} collection
	 * @memberof RangeCollection
	 */
	toString(separator = '..', join = ',') {

		return this.ranges.map((range) => range.toString(separator)).join(join);
	}

	/**
	 * Represent the RangeCollection as hexadecimal string
	 *
	 * @returns {string} collection
	 * @memberof RangeCollection
	 */
	toHex(length = 0, separator = '..', join = ',') {

		return this.ranges.map((range) => range.toHex(length, separator)).join(join);
	}

	/**
	 * Represent the RangeCollection in a JSON-able format
	 *
	 * @returns {string} collection
	 * @memberof RangeCollection
	 */
	toJSON(): any {

		return this.ranges.map((range) => range.toJSON());
	}

	/**
	 * Implementation of the default iterator (Symbol.iterator) generating all
	 * numbers within the collection
	 *
	 * @yields {number} value
	 * @memberof RangeCollection
	 */
	*[Symbol.iterator]() {
		const { length } = this.ranges;
		const infinite = this.ranges.some(({ size }) => size >= Infinity);

		if (infinite) {
			throw new Error('RangeCollection is infinite');
		}

		for (let i = 0; i < length; ++i) {
			yield* this.ranges[i];
		}
	}

	/**
	 * Create a new RangeCollection from multiple Range objects or numbers
	 *
	 * @static
	 * @param {...Range|number} ranges
	 * @returns {RangeCollection} collection
	 * @memberof RangeCollection
	 */
	static from(...ranges: Array<Range | number>) {
		return new this(
			...ranges.map((range) =>
				range instanceof Range ? range : new Range(Number(range))
			)
		);
	}

	/**
	 * Create a new RangeCollection from a string representation
	 *
	 * @static
	 * @param {string} ranges
	 * @param {string} [join=',']
	 * @param {string} [separator='..']
	 * @returns {RangeCollection} collection
	 * @memberof RangeCollection
	 */
	static fromString(ranges: string, separator = '..', join = ',') {
		return new this(
			...ranges
				.split(join)
				.map((range) => Range.fromString(range, separator))
		);
	}

	/**
	 * Create a new RangeCollection from hexadecimal representation
	 *
	 * @static
	 * @param {string} ranges
	 * @param {string} [join=',']
	 * @param {string} [separator='..']
	 * @returns {RangeCollection} collection
	 * @memberof RangeCollection
	 */
	static fromHex(ranges: string, separator = '..', join = ',') {
		return new this(
			...ranges
				.split(join)
				.map((range) => Range.fromHex(range, separator))
		);
	}

	/**
	 * Create a new RangeCollection from a JSON string representation
	 *
	 * @static
	 * @param {string} json
	 * @returns {RangeCollection} collection
	 * @memberof RangeCollection
	 */
	static fromJSON(json: string) {
		const parsed: Array<Range> = (JSON.parse(json) as Array<{ min: number, max?: number }>).map(
			({ min, max }) => new Range(min, max || min)
		);

		return new this(...parsed);
	}

	/**
	 * Normalize multiple Range objects
	 *
	 * @static
	 * @param {[Range]} ranges
	 * @returns {[Range]} ranges
	 * @memberof RangeCollection
	 */
	static normalize(ranges: Array<Range>): Array<Range> {
		return ranges
			.reduce((carry, range) => {
				const intersect: Array<Range> = carry.filter(
					(r: Range) =>
						r.contains(range.min) ||
						r.contains(range.max) ||
						(r.max === range.min - 1 || r.min === range.max + 1)
				);

				if (intersect.length) {
					const cross = intersect
						.concat(range)
						.reduce(
							(carry, { min, max }) => carry.concat(min, max),
							[] as Array<number>
						);

					return carry
						.filter((comp) => intersect.indexOf(comp) < 0)
						.concat(new Range(...cross));
				}

				return carry.concat(range);
			}, [] as Array<Range>)
			.sort((one: Range, two: Range) =>
				one.min < two.min ? -1 : +(one.min > two.min)
			);
	}
}
