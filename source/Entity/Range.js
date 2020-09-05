const storage = new WeakMap();
const infinity = /^(-)?(Inf)(?:inity)?$/i;
const cast = {
	numeric: (value) =>
		infinity.test(value)
			? Number(String(value).replace(infinity, '$1Infinity'))
			: parseInt(value, 10),
	string: (value) => String(value).replace(infinity, '$1INF'),
	json: (value) =>
		infinity.test(value) ? cast.string(value) : Number(value),
	hex: (value) =>
		infinity.test(value) ? cast.string(value) : parseInt(value, 16)
};

/**
 * Numeric range
 *
 * @class Range
 */
class Range {
	/**
	 * Creates an instance of Range
	 *
	 * @param {...number} values
	 * @memberof Range
	 */
	constructor(...values) {
		const mapped = values.length
			? values.map(cast.numeric)
			: [-Infinity, Infinity];
		const int = mapped.filter((value) => typeof value === 'number');

		storage.set(this, { min: Math.min(...int), max: Math.max(...int) });
	}

	/**
	 * The minimum value of the range
	 *
	 * @readonly
	 * @memberof Range
	 */
	get min() {
		const { min } = storage.get(this);

		return min;
	}

	/**
	 * The maximum value of the range
	 *
	 * @readonly
	 * @memberof Range
	 */
	get max() {
		const { max } = storage.get(this);

		return max;
	}

	/**
	 * The number of values within the Range
	 *
	 * @readonly
	 * @memberof Range
	 */
	get size() {
		const { min, max } = this;

		return max + 1 - min;
	}

	/**
	 * Determine whether the range includes the provided value(s)
	 *
	 * @param {...number} value
	 * @returns {boolean} contains
	 * @memberof Range
	 */
	contains(...values) {
		const { min, max } = this;

		return values.reduce(
			(carry, value) =>
				value === cast.numeric(value) &&
				carry &&
				min <= value &&
				value <= max,
			true
		);
	}

	/**
	 * Represent the Range as string
	 *
	 * @param {string} [separator='..']
	 * @returns {string} string representation
	 * @memberof Range
	 */
	toString(separator = '..') {
		const { min, max } = this;

		return [min, max]
			.filter((value, index, all) => all.indexOf(value) === index)
			.map((value) => cast.string(value))
			.join(separator);
	}

	/**
	 * Represent the Range as a hexadecimal string
	 *
	 * @param {number} [length=0]
	 * @param {string} [separator='..']
	 * @returns {string} hexadecimal representation
	 * @memberof Range
	 */
	toHex(length = 0, separator = '..') {
		const { min, max } = this;
		const padding = [...Array(length + 1)].join('0');

		return [min, max]
			.filter((value, index, all) => all.indexOf(value) === index)
			.map((value) => {
				const numeric = /^(-?)([0-9a-f]+)$/;
				const normal = cast.string(String(value.toString(16)));

				//  add padding (if needed) to true hexadecimal numbers,
				//  never for (-)Infinity
				if (numeric.test(normal)) {
					const [, minus, abs] = normal.match(numeric);

					return (
						minus +
						`${padding}${abs}`.slice(-Math.max(abs.length, length))
					);
				}

				return normal;
			})
			.join(separator);
	}

	/**
	 * Represent the range in a JSON-able format
	 *
	 * @returns {*} JSONAble
	 * @memberof Range
	 */
	toJSON() {
		const { min: vmin, max: vmax } = this;
		const min = cast.json(vmin);
		const max = cast.json(vmax);

		return min === max ? { min } : { min, max };
	}

	/**
	 * Implementation of the default iterator (Symbol.iterator) generating all
	 * numbers within the range
	 *
	 * @yields {number} value
	 * @memberof Range
	 */
	*[Symbol.iterator]() {
		const { min, max, size } = this;

		if (size >= Infinity) {
			throw new Error('Range is infinite');
		}

		for (let i = min; i <= max; ++i) {
			yield i;
		}
	}

	/**
	 * Obtain a Range from its string representation
	 *
	 * @static
	 * @param {string} input
	 * @param {string} [separator='..']
	 * @returns
	 * @memberof Range
	 */
	static fromString(input, separator = '..') {
		return new this(...input.split(separator));
	}

	/**
	 * Obtain a Range from its hexadecimal representation
	 *
	 * @static
	 * @param {string} input
	 * @param {string} [separator='..']
	 * @returns
	 * @memberof Range
	 */
	static fromHex(input, separator = '..') {
		return new this(...input.split(separator).map(cast.hex));
	}

	/**
	 * Obtain a Range from its JSON representation
	 *
	 * @static
	 * @param {string} input
	 * @returns
	 * @memberof Range
	 */
	static fromJSON(input) {
		const { min, max } = JSON.parse(input);

		return new this(min || max || -Infinity, max || min || Infinity);
	}
}

module.exports = Range;
