/* global source, describe, it, each, expect */

const Range = source('Entity/Range');
const RangeCollection = source('Entity/RangeCollection');
const und = (() => {})();

describe('RangeCollection', () => {
	describe('instances', () => {
		it('creates instances', (next) => {
			const collection = new RangeCollection(
				new Range(0, 10),
				new Range(20, 30)
			);

			expect(collection).to.be.instanceOf(RangeCollection);

			next();
		});

		it('has defaults', (next) => {
			const collection = new RangeCollection();

			expect(collection).to.be.instanceOf(RangeCollection);
			expect(collection.min).to.equal(-Infinity);
			expect(collection.max).to.equal(Infinity);
			expect(collection.size).to.equal(Infinity);

			next();
		});
	});

	describe('properties', () => {
		const one = new RangeCollection(new Range(0, 100), new Range(200, 300));
		const two = new RangeCollection(
			new Range(-100, -50),
			new Range(50, 100)
		);

		it('has min', (next) => {
			expect(one.min).to.equal(0);
			expect(two.min).to.equal(-100);

			next();
		});

		it('has max', (next) => {
			expect(one.max).to.equal(300);
			expect(two.max).to.equal(100);

			next();
		});

		it('has size', (next) => {
			expect(one.size).to.equal(202);
			expect(two.size).to.equal(102);

			next();
		});
	});

	describe('methods', () => {
		const one = new RangeCollection(new Range(0, 100), new Range(200, 300));
		const two = new RangeCollection(
			new Range(-100, -50),
			new Range(50, 100)
		);

		describe('contains', () => {
			each`
			collection | seek            | verdict
			-----------|-----------------|---------
			${one}     | ${-200}         | false
			${two}     | ${-200}         | false
			${one}     | ${-150}         | false
			${two}     | ${-150}         | false
			${one}     | ${-105}         | false
			${two}     | ${-105}         | false
			${one}     | ${-100}         | false
			${two}     | ${-100}         | true
			${one}     | ${-50}          | false
			${two}     | ${-50}          | true
			${one}     | ${-5}           | false
			${two}     | ${-5}           | false
			${one}     | ${0}            | true
			${two}     | ${0}            | false
			${one}     | ${5}            | true
			${two}     | ${5}            | false
			${one}     | ${50}           | true
			${two}     | ${50}           | true
			${one}     | ${100}          | true
			${two}     | ${100}          | true
			${one}     | ${105}          | false
			${two}     | ${105}          | false
			${one}     | ${150}          | false
			${two}     | ${150}          | false
			${one}     | ${200}          | true
			${two}     | ${200}          | false
			${one}     | ${205}          | true
			${two}     | ${205}          | false
			${one}     | ${250}          | true
			${two}     | ${250}          | false
			${one}     | ${300}          | true
			${two}     | ${300}          | false
			${one}     | ${305}          | false
			${two}     | ${305}          | false
			${one}     | ${350}          | false
			${two}     | ${350}          | false
			${one}     | ${[0, 50]}      | true
			${two}     | ${[0, 50]}      | false
			${one}     | ${[0, 50, 150]} | false
			${two}     | ${[0, 50, 150]} | false
			${one}     | ${[-50, 50]}    | false
			${two}     | ${[-50, 50]}    | true
		`(
				'$collection contains $seek is $verdict',
				({ collection, seek, verdict }, next) => {
					const contains = [].concat(seek);

					expect(collection.contains(...contains)).to.equal(
						verdict === 'true'
					);

					next();
				}
			);
		});

		describe('toString', () => {
			const collection = new RangeCollection(
				new Range(-54321, -20000),
				new Range(-12345, 12345),
				new Range(20000, 54321)
			);

			each`
				join    | separator | string
				--------|-----------|--------
				${und}  | ${und}    | -54321..-20000,-12345..12345,20000..54321
				${'#'}  | ${und}    | -54321..-20000#-12345..12345#20000..54321
				${und}  | ${'/'}    | -54321/-20000,-12345/12345,20000/54321
				${'#'}  | ${'/'}    | -54321/-20000#-12345/12345#20000/54321
				${'..'} | ${','}    | -54321,-20000..-12345,12345..20000,54321
			`(
				'join $join, separator $separator gives $string',
				({ separator, join, string }, next) => {
					expect(collection.toString(separator, join)).to.equal(
						string
					);

					next();
				}
			);
		});

		describe('toHex', () => {
			const collection = new RangeCollection(
				new Range(-54321, -20000),
				new Range(-12345, 12345),
				new Range(20000, 54321)
			);

			each`
				length | join    | separator | hex
				-------|---------|-----------|--------
				${und} | ${und}  | ${und}    | -d431..-4e20,-3039..3039,4e20..d431
				${und} | ${'#'}  | ${und}    | -d431..-4e20#-3039..3039#4e20..d431
				${und} | ${und}  | ${'/'}    | -d431/-4e20,-3039/3039,4e20/d431
				${und} | ${'#'}  | ${'/'}    | -d431/-4e20#-3039/3039#4e20/d431
				${und} | ${'..'} | ${','}    | -d431,-4e20..-3039,3039..4e20,d431
				${0}   | ${und}  | ${und}    | -d431..-4e20,-3039..3039,4e20..d431
				${0}   | ${'#'}  | ${und}    | -d431..-4e20#-3039..3039#4e20..d431
				${0}   | ${und}  | ${'/'}    | -d431/-4e20,-3039/3039,4e20/d431
				${0}   | ${'#'}  | ${'/'}    | -d431/-4e20#-3039/3039#4e20/d431
				${0}   | ${'..'} | ${','}    | -d431,-4e20..-3039,3039..4e20,d431
				${4}   | ${und}  | ${und}    | -d431..-4e20,-3039..3039,4e20..d431
				${4}   | ${'#'}  | ${und}    | -d431..-4e20#-3039..3039#4e20..d431
				${4}   | ${und}  | ${'/'}    | -d431/-4e20,-3039/3039,4e20/d431
				${4}   | ${'#'}  | ${'/'}    | -d431/-4e20#-3039/3039#4e20/d431
				${4}   | ${'..'} | ${','}    | -d431,-4e20..-3039,3039..4e20,d431
				${5}   | ${und}  | ${und}    | -0d431..-04e20,-03039..03039,04e20..0d431
				${5}   | ${'#'}  | ${und}    | -0d431..-04e20#-03039..03039#04e20..0d431
				${5}   | ${und}  | ${'/'}    | -0d431/-04e20,-03039/03039,04e20/0d431
				${5}   | ${'#'}  | ${'/'}    | -0d431/-04e20#-03039/03039#04e20/0d431
				${5}   | ${'..'} | ${','}    | -0d431,-04e20..-03039,03039..04e20,0d431
				${7}   | ${und}  | ${und}    | -000d431..-0004e20,-0003039..0003039,0004e20..000d431
				${7}   | ${'#'}  | ${und}    | -000d431..-0004e20#-0003039..0003039#0004e20..000d431
				${7}   | ${und}  | ${'/'}    | -000d431/-0004e20,-0003039/0003039,0004e20/000d431
				${7}   | ${'#'}  | ${'/'}    | -000d431/-0004e20#-0003039/0003039#0004e20/000d431
				${7}   | ${'..'} | ${','}    | -000d431,-0004e20..-0003039,0003039..0004e20,000d431
			`(
				'length $length, join $join, separator $separator gives $hex',
				({ length, separator, join, hex }, next) => {
					expect(collection.toHex(length, separator, join)).to.equal(
						hex
					);

					next();
				}
			);

			describe('toJSON', () => {
				const collection = new RangeCollection(
					new Range(-54321, -20000),
					new Range(-12345, 12345),
					new Range(20000, 54321)
				);

				it('stringifies', (next) => {
					expect(JSON.stringify(collection)).to.equal(
						'[{"min":-54321,"max":-20000},{"min":-12345,"max":12345},{"min":20000,"max":54321}]'
					);

					next();
				});
			});
		});

		it('implements iterator', (next) => {
			const collection = new RangeCollection(
				new Range(0, 5),
				new Range(10, 15)
			);
			const expectation = [0, 1, 2, 3, 4, 5, 10, 11, 12, 13, 14, 15];

			expect([...collection]).to.equal(expectation);

			let index = 0;

			for (value of collection) {
				expect(value).to.equal(expectation[index]);
				++index;
			}

			next();
		});
	});

	describe('static methods', () => {
		const first = [0, 1, 2, 3, 4, 5];
		const last = [20, 21, 22, 23, 24, 25];
		const expectation = first.concat(10, 15, last);

		it('implements from', (next) => {
			const collection = RangeCollection.from(
				new Range(0, 5),
				10,
				Range.fromHex('f'),
				Range.fromString('20..25')
			);

			expect(collection).to.be.instanceOf(RangeCollection);
			expect(collection.min).to.equal(0);
			expect(collection.max).to.equal(25);
			expect(collection.size).to.equal(14);

			expect([...collection]).to.equal(expectation);

			expectation.forEach((value) =>
				expect(collection.contains(value)).to.be.true()
			);

			next();
		});

		describe('fromString', () => {
			each`
			input             | join   | separator
			------------------|--------|-----------
			0..5,10,15,20..25 | ${und} | ${und}
			0..5$10$15$20..25 | $      | ${und}
			0/5$10$15$20/25   | $      | /
		`(
				'fromString $input, using join $join, separator $separator',
				({ input, join, separator }, next) => {
					const collection = RangeCollection.fromString(
						input,
						separator,
						join
					);

					expect(collection).to.be.instanceOf(RangeCollection);
					expect(collection.min).to.equal(0);
					expect(collection.max).to.equal(25);
					expect(collection.size).to.equal(14);

					expect([...collection]).to.equal(expectation);

					expectation.forEach((value) =>
						expect(collection.contains(value)).to.be.true()
					);

					next();
				}
			);
		});

		describe('fromHex', () => {
			each`
			input           | join   | separator
			----------------|--------|-----------
			0..5,a,f,14..19 | ${und} | ${und}
			0..5$a$f$14..19 | $      | ${und}
			0/5$a$f$14/19   | $      | /
		`(
				'fromHex $input, using join $join, separator $separator',
				({ input, join, separator }, next) => {
					const collection = RangeCollection.fromHex(
						input,
						separator,
						join
					);

					expect(collection).to.be.instanceOf(RangeCollection);
					expect(collection.min).to.equal(0);
					expect(collection.max).to.equal(25);
					expect(collection.size).to.equal(14);

					expect([...collection]).to.equal(expectation);

					expectation.forEach((value) =>
						expect(collection.contains(value)).to.be.true()
					);

					next();
				}
			);
		});

		describe('fromJSON', () => {
			const input =
				'[{"min":0,"max":5},{"min":10},{"min":15},{"min":20,"max":25}]';
			it(`from ${input}`, (next) => {
				const collection = RangeCollection.fromJSON(input);

				console.log(String(collection));

				expect(collection).to.be.instanceOf(RangeCollection);
				expect(collection.min).to.equal(0);
				expect(collection.max).to.equal(25);
				expect(collection.size).to.equal(14);

				expect([...collection]).to.equal(expectation);

				expectation.forEach((value) =>
					expect(collection.contains(value)).to.be.true()
				);

				next();
			});
		});

		describe('normalize', () => {
			each`
			count | ranges 
			------|--------
			1     | ${[new Range(0, 10), new Range(20, 30), new Range(10, 20)]}
			2     | ${[new Range(0, 10), new Range(25, 30), new Range(10, 20)]}
			3     | ${[new Range(20, 25), new Range(0, 5), new Range(10, 15)]}
			1     | ${[new Range(0, 10), new Range(21, 30), new Range(11, 20)]}
			3     | ${[new Range(0, 10), new Range(22, 30), new Range(12, 20)]}
		`('normalizes $ranges into $count', ({ ranges, count }, next) => {
				const normal = RangeCollection.normalize(ranges);

				expect(normal).to.be.length(Number(count));

				next();
			});
		});
	});
});
