type Numeric = number | string;

const infinity = /^(-)?(Inf)(?:inity)?$/i;
const cast = {
	numeric: (value: Numeric) =>
		infinity.test(String(value))
			? Number(String(value).replace(infinity, '$1Infinity'))
			: parseInt(String(value), 10),
	string: (value: Numeric) => String(value).replace(infinity, '$1INF'),
	json: (value: Numeric) =>
		infinity.test(String(value)) ? cast.string(value) : Number(value),
	hex: (value: string) =>
		infinity.test(value) ? cast.string(value) : parseInt(value, 16)
};

/**
 * Numeric range
 *
 * @class Range
 */
export class Range {
	public readonly min: number;
	public readonly max: number;
	public readonly size: number;

	/**
	 * Creates an instance of Range
	 *
	 * @param {...number} values
	 * @memberof Range
	 */
	constructor(...values: Array<Numeric>) {
		const mapped = values.length
			? values.map(cast.numeric)
			: [-Infinity, Infinity];
		const int = mapped.filter((value) => typeof value === 'number');

		this.min = Math.min(...int);
		this.max = Math.max(...int);
		this.size = this.max + 1 - this.min;
	}

	/**
	 * Determine whether the range includes the provided value(s)
	 *
	 * @param {...number} value
	 * @returns {boolean} contains
	 * @memberof Range
	 */
	contains(...values: Array<any>) {
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
					const [, minus, abs] = normal.match(numeric) as RegExpMatchArray;

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
	static fromString(input: string, separator = '..') {
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
	static fromHex(input: string, separator = '..') {
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
	static fromJSON(input: string) {
		const { min, max } = JSON.parse(input);

		return new this(min || max || -Infinity, max || min || Infinity);
	}
}
