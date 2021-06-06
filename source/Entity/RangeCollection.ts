import { RangeInterface } from '../Contract/RangeInterface';
import { Range } from './Range';

function cross(...ranges: Array<Range>): Range {
	const values: Array<number> = ranges
		.reduce((carry, { min, max }) => carry.concat(min, max), [] as Array<number>);

	return new Range(...values);
}

function mergeable(one: Range, two: Range): boolean {
	return one.contains(two.min)
		|| one.contains(two.max)
		|| one.min === two.max + 1
		|| one.max === two.min - 1;
}

function optimize(...ranges: Array<Range>): Array<Range> {
	return ranges
		.reduce((carry, range) => {
			const intersect = carry.filter((r) => mergeable(range, r));

			if (intersect.length) {
				return carry
					.filter((range) => !intersect.includes(range))
					.concat(cross(range, ...intersect));
			}

			return carry.concat(range);
		}, [] as Array<Range>)
		.sort(({ min: one }, { min: two }) => one < two ? -1 : Number(one > two));
}

function normalize(ranges: Array<Range | number>, allowEmpty: boolean = true): Array<Range> {
	return ranges.length || allowEmpty
		? optimize(...ranges.map((range) => range instanceof Range ? range : new Range(range)))
		: [new Range()];
}

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
		this.ranges = normalize(ranges, false);

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
	contains(...values: Array<number>): boolean {
		return values.every((value) => this.ranges.some((range) => range.contains(value)));
	}

	/**
	 * Represent the RangeCollection as string
	 *
	 * @returns {string} collection
	 * @memberof RangeCollection
	 */
	toString(separator: string = '..', join: string = ',') {
		return this.ranges.map((range) => range.toString(separator)).join(join);
	}

	/**
	 * Represent the RangeCollection as hexadecimal string
	 *
	 * @returns {string} collection
	 * @memberof RangeCollection
	 */
	toHex(length: number = 0, separator: string = '..', join: string = ',') {
		return this.ranges.map((range) => range.toHex(length, separator)).join(join);
	}

	/**
	 * Represent the RangeCollection in a JSON-able format
	 *
	 * @returns {string} collection
	 * @memberof RangeCollection
	 */
	toJSON(): Array<ReturnType<Range['toJSON']>> {
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
		const infinite = this.ranges.some(({ size }) => !Number.isFinite(size));

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
	static from(...ranges: Array<Range | number>): RangeCollection {
		return new this(...ranges.map((range) => range instanceof Range ? range : new Range(range)));
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
	static fromString(ranges: string, separator: string = '..', join: string = ','): RangeCollection {
		return new this(...ranges.split(join).map((range) => Range.fromString(range, separator)));
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
	static fromHex(ranges: string, separator: string = '..', join: string = ','): RangeCollection {
		return new this(...ranges.split(join).map((range) => Range.fromHex(range, separator)));
	}

	/**
	 * Create a new RangeCollection from a JSON string representation
	 *
	 * @static
	 * @param {string} json
	 * @returns {RangeCollection} collection
	 * @memberof RangeCollection
	 */
	static fromJSON(json: string): RangeCollection {
		const parsed: Array<Range> = (JSON.parse(json) as Array<unknown>)
			.map((options) => Range.fromJSON(JSON.stringify(options)));

		return new this(...parsed);
	}

	/**
	 * Normalize multiple Range objects
	 *
	 * @static
	 * @param {Array<Range>} ranges
	 * @returns {Array<Range>}
	 * @memberof RangeCollection
	 */
	static normalize(ranges: Array<Range>): Array<Range> {
		return normalize(ranges);
	}
}
