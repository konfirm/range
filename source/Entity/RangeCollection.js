const Range = require('./Range.js');

const storage = new WeakMap();

/**
 * Collection of Range objects
 *
 * @class RangeCollection
 * @extends {Range}
 */
class RangeCollection extends Range {
	/**
	 * Creates an instance of RangeCollection
	 *
	 * @param {*} ranges
	 * @memberof RangeCollection
	 */
	constructor(...ranges) {
		super();

		const normal = this.constructor.normalize(
			ranges.length ? ranges : [new Range()]
		);

		storage.set(this, { normal });
	}

	/**
	 * The minimum value contained in all Range objects
	 *
	 * @readonly
	 * @memberof RangeCollection
	 */
	get min() {
		const { normal } = storage.get(this);

		return Math.min(...normal.map(({ min }) => min));
	}

	/**
	 * The maximum value contained in all Range objects
	 *
	 * @readonly
	 * @memberof RangeCollection
	 */
	get max() {
		const { normal } = storage.get(this);

		return Math.max(...normal.map(({ max }) => max));
	}

	/**
	 * The number of values within all Range objects
	 *
	 * @readonly
	 * @memberof RangeCollection
	 */
	get size() {
		const { normal } = storage.get(this);

		return normal.reduce((carry, range) => carry + range.size, 0);
	}

	/**
	 * Is the value contained by one or more of the Range objects
	 *
	 * @param {number} value
	 * @returns {boolean} contains
	 * @memberof RangeCollection
	 */
	contains(...values) {
		const { normal } = storage.get(this);
		const contains = values.filter(
			(value) =>
				normal.filter((range) => range.contains(value)).length > 0
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
		const { normal } = storage.get(this);

		return normal.map((range) => range.toString(separator)).join(join);
	}

	/**
	 * Represent the RangeCollection as hexadecimal string
	 *
	 * @returns {string} collection
	 * @memberof RangeCollection
	 */
	toHex(length = 0, separator = '..', join = ',') {
		const { normal } = storage.get(this);

		return normal.map((range) => range.toHex(length, separator)).join(join);
	}

	/**
	 * Represent the RangeCollection in a JSON-able format
	 *
	 * @returns {string} collection
	 * @memberof RangeCollection
	 */
	toJSON() {
		const { normal } = storage.get(this);

		return normal.map((range) => range.toJSON());
	}

	/**
	 * Implementation of the default iterator (Symbol.iterator) generating all
	 * numbers within the collection
	 *
	 * @yields {number} value
	 * @memberof RangeCollection
	 */
	*[Symbol.iterator]() {
		const { normal } = storage.get(this);
		const { length } = normal;

		for (let i = 0; i < length; ++i) {
			yield* normal[i];
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
	static from(...ranges) {
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
	static fromString(ranges, separator = '..', join = ',') {
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
	static fromHex(ranges, separator = '..', join = ',') {
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
	static fromJSON(json) {
		const parsed = JSON.parse(json).map(
			({ min, max }) => new Range(min, max || min)
		);

		return new this(...[parsed]);
	}

	/**
	 * Normalize multiple Range objects
	 *
	 * @static
	 * @param {[Range]} ranges
	 * @returns {[Range]} ranges
	 * @memberof RangeCollection
	 */
	static normalize(ranges) {
		return ranges
			.reduce((carry, range) => {
				const intersect = carry.filter(
					(r) =>
						r.contains(range.min) ||
						r.contains(range.max) ||
						(r.max === range.min - 1 || r.min === range.max + 1)
				);

				if (intersect.length) {
					const cross = intersect
						.concat(range)
						.reduce(
							(carry, { min, max }) => carry.concat(min, max),
							[]
						);

					return carry
						.filter((comp) => intersect.indexOf(comp) < 0)
						.concat(new Range(...cross));
				}

				return carry.concat(range);
			}, [])
			.sort((one, two) =>
				one.min < two.min ? -1 : +(one.min > two.min)
			);
	}
}

module.exports = RangeCollection;
