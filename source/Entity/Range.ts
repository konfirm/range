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

function first<T = unknown>(...values: Array<T>): T {
	const und = Symbol('und');
	const [first] = values.filter((value: unknown = und) => value !== und);

	return first as T;
}

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
			? values.map(cast.numeric).filter((value) => typeof value === 'number')
			: [-Infinity, Infinity];

		this.min = Math.min(...mapped);
		this.max = Math.max(...mapped);
		this.size = Number.isFinite(this.min) && Number.isFinite(this.max)
			? this.max + 1 - this.min
			: Infinity;
	}

	/**
	 * Determine whether the range includes the provided value(s)
	 *
	 * @param {...number} value
	 * @returns {boolean} contains
	 * @memberof Range
	 */
	contains(...values: Array<number>): boolean {
		const { min, max } = this;

		return values.every((value) => cast.numeric(value) === value && value >= min && value <= max);
	}

	/**
	 * Represent the Range as string
	 *
	 * @param {string} [separator='..']
	 * @returns {string} string representation
	 * @memberof Range
	 */
	toString(separator: string = '..'): string {
		const { min, max } = this;

		return [...new Set([min, max])].map(cast.string).join(separator);
	}

	/**
	 * Represent the Range as a hexadecimal string
	 *
	 * @param {number} [length=0]
	 * @param {string} [separator='..']
	 * @returns {string} hexadecimal representation
	 * @memberof Range
	 */
	toHex(length: number = 0, separator: string = '..'): string {
		const { min, max } = this;
		const padding = Array.from({ length }, () => '0').join('')
		const hex = (value: number) => value.toString(16)
			.replace(/^(-)?([\da-f]+)$/, (_, m = '', h) =>
				m + `${padding}${h}`.slice(-Math.max(length, h.length))
			)
			.replace(/^(-)?Infinity$/, '$1INF');

		return [...new Set([min, max])].map(hex).join(separator);
	}

	/**
	 * Represent the range in a JSON-able format
	 *
	 * @returns {*} JSONAble
	 * @memberof Range
	 */
	toJSON(): { min: Numeric, max?: Numeric } {
		const min = cast.json(this.min);
		const max = cast.json(this.max);

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
	static fromString(input: string, separator = '..'): Range {
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
	static fromHex(input: string, separator = '..'): Range {
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
	static fromJSON(input: string): Range {
		const { min, max } = JSON.parse(input);

		return new this(
			first<Numeric>(min, max, -Infinity),
			first<Numeric>(max, min, Infinity),
		);
	}
}
