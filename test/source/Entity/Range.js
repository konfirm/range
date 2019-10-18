/* global source, describe, it, each, expect */

const Range = source('Entity/Range');
const und = (() => {})();

describe('Range', () => {
	describe('instances', () => {
		it('creates instances', (next) => {
			const range = new Range(1000, 9999);

			expect(range).to.be.instanceOf(Range);

			next();
		});

		it('has defaults', (next) => {
			const range = new Range();

			expect(range).to.be.instanceOf(Range);
			expect(range.min).to.be.number();
			expect(range.max).to.be.number();
			expect(range.size).to.be.number();

			expect(range.min).to.equal(-Infinity);
			expect(range.max).to.equal(Infinity);
			expect(range.size).to.equal(Infinity);

			next();
		});
	});

	describe('properties', () => {
		each`
			inmin        | inmax       | min          | max         | size        | string
			-------------|-------------|--------------|-------------|-------------|--------
			${-1000}     | ${1000}     | ${-1000}     | ${1000}     | ${2001}     | -1000..1000
			${1000}      | ${-1000}    | ${-1000}     | ${1000}     | ${2001}     | -1000..1000
			${-1.4}      | ${1.4}      | ${-1}        | ${1}        | ${3}        | -1..1
			${-2.5}      | ${2.5}      | ${-2}        | ${2}        | ${5}        | -2..2
			${-3.9}      | ${3.9}      | ${-3}        | ${3}        | ${7}        | -3..3
			${4.4}       | ${-4.4}     | ${-4}        | ${4}        | ${9}        | -4..4
			${5.5}       | ${-5.5}     | ${-5}        | ${5}        | ${11}       | -5..5
			${7.9}       | ${-7.9}     | ${-7}        | ${7}        | ${15}       | -7..7
			${10}        | ${100}      | ${10}        | ${100}      | ${91}       | 10..100
			${-10}       | ${-100}     | ${-100}      | ${-10}      | ${91}       | -100..-10
			${0}         | ${Infinity} | ${0}         | ${Infinity} | ${Infinity} | 0..INF
			${-Infinity} | ${0}        | ${-Infinity} | ${0}        | ${Infinity} | -INF..0
		`(
			'input $inmin, max $inmax has min $min, max $max and size $size',
			({ inmin, inmax, min, max, size, string }, next) => {
				const range = new Range(inmin, inmax);

				expect(range.min).to.be.number();
				expect(range.max).to.be.number();
				expect(range.size).to.be.number();

				expect(range.min).to.equal(min);
				expect(range.max).to.equal(max);
				expect(range.size).to.equal(size);

				expect(String(range)).to.equal(string);

				next();
			}
		);
	});

	describe('methods', () => {
		describe('contains', () => {
			each`
				seek           | min     | max    | verdict
				---------------|---------|--------|---------
				${0}           | ${0}    | ${100} | true
				${10}          | ${0}    | ${100} | true
				${100}         | ${0}    | ${100} | true
				${1000}        | ${0}    | ${100} | false
				${-1000}       | ${0}    | ${100} | false
				${-101}        | ${-100} | ${100} | false
				${-100}        | ${-100} | ${100} | true
				${-10}         | ${-100} | ${100} | true
				${0}           | ${-100} | ${100} | true
				${10}          | ${-100} | ${100} | true
				${100}         | ${-100} | ${100} | true
				${101}         | ${-100} | ${100} | false
				${[-100, 100]} | ${-100} | ${100} | true
				${[-101, 100]} | ${-100} | ${100} | false
				${[-100, 101]} | ${-100} | ${100} | false
				${1.23}        | ${0}    | ${100} | false
			`(
				'$min..$max contains $seek is $verdict',
				({ min, max, seek, verdict }, next) => {
					const range = new Range(min, max);
					const contains = [].concat(seek);

					expect(range.contains(...contains)).to.equal(
						verdict === 'true'
					);
					next();
				}
			);
		});

		describe('toString', () => {
			it('output modifiers', (next) => {
				const range = new Range(-12345, 12345);

				expect(range.toString).to.be.function();
				expect(String(range)).to.equal('-12345..12345');
				expect(range.toString()).to.equal('-12345..12345');
				expect(range.toString('/')).to.equal('-12345/12345');

				const single = new Range(12345);

				expect(single.toString).to.be.function();
				expect(String(single)).to.equal('12345');
				expect(single.toString()).to.equal('12345');
				expect(single.toString('/')).to.equal('12345');

				next();
			});

			it('infinity', (next) => {
				const range = new Range();

				expect(range.toString).to.be.function();
				expect(String(range)).to.equal('-INF..INF');
				expect(range.toString('/')).to.equal('-INF/INF');

				expect(String(new Range(-Infinity, 1000))).to.equal(
					'-INF..1000'
				);
				expect(String(new Range(1000, Infinity))).to.equal('1000..INF');
				next();
			});
		});

		describe('toHex', () => {
			it('output modifiers', (next) => {
				const range = new Range(-12345, 12345);

				expect(range.toHex).to.be.function();
				expect(range.toHex()).to.equal('-3039..3039');
				expect(range.toHex(0)).to.equal('-3039..3039');
				expect(range.toHex(1)).to.equal('-3039..3039');
				expect(range.toHex(2)).to.equal('-3039..3039');
				expect(range.toHex(3)).to.equal('-3039..3039');
				expect(range.toHex(4)).to.equal('-3039..3039');
				expect(range.toHex(5)).to.equal('-03039..03039');
				expect(range.toHex(7)).to.equal('-0003039..0003039');

				expect(range.toHex(0, '/')).to.equal('-3039/3039');
				expect(range.toHex(1, '/')).to.equal('-3039/3039');
				expect(range.toHex(2, '/')).to.equal('-3039/3039');
				expect(range.toHex(3, '/')).to.equal('-3039/3039');
				expect(range.toHex(4, '/')).to.equal('-3039/3039');
				expect(range.toHex(5, '/')).to.equal('-03039/03039');
				expect(range.toHex(7, '/')).to.equal('-0003039/0003039');

				const single = new Range(12345);

				expect(single.toHex()).to.equal('3039');
				expect(single.toHex(0)).to.equal('3039');
				expect(single.toHex(1)).to.equal('3039');
				expect(single.toHex(2)).to.equal('3039');
				expect(single.toHex(3)).to.equal('3039');
				expect(single.toHex(4)).to.equal('3039');
				expect(single.toHex(5)).to.equal('03039');
				expect(single.toHex(7)).to.equal('0003039');

				expect(single.toHex(0, '/')).to.equal('3039');
				expect(single.toHex(1, '/')).to.equal('3039');
				expect(single.toHex(2, '/')).to.equal('3039');
				expect(single.toHex(3, '/')).to.equal('3039');
				expect(single.toHex(4, '/')).to.equal('3039');
				expect(single.toHex(5, '/')).to.equal('03039');
				expect(single.toHex(7, '/')).to.equal('0003039');

				next();
			});

			it('inifity', (next) => {
				const range = new Range();

				expect(range.toHex()).to.equal('-INF..INF');
				expect(range.toHex(0, '/')).to.equal('-INF/INF');

				expect(new Range(-Infinity, 1000).toHex(7)).to.equal(
					'-INF..00003e8'
				);
				expect(new Range(1000, Infinity).toHex(7)).to.equal(
					'00003e8..INF'
				);

				next();
			});
		});

		describe('toJSON', () => {
			it('numbers', (next) => {
				const range = new Range(-12345, 12345);

				expect(range.toJSON).to.be.function();
				expect(range.toJSON()).to.equal({ min: -12345, max: 12345 });
				expect(JSON.stringify(range)).to.equal(
					'{"min":-12345,"max":12345}'
				);

				const single = new Range(12345);

				expect(single.toJSON()).to.equal({ min: 12345 });
				expect(JSON.stringify(single)).to.equal('{"min":12345}');

				next();
			});

			it('infinity', (next) => {
				expect(new Range().toJSON()).to.equal({
					min: '-INF',
					max: 'INF'
				});
				expect(new Range(-Infinity, 1000).toJSON()).to.equal({
					min: '-INF',
					max: 1000
				});
				expect(new Range(1000, Infinity).toJSON()).to.equal({
					min: 1000,
					max: 'INF'
				});

				next();
			});
		});

		it('implements iterator', (next) => {
			const range = new Range(0, 5);
			const expectation = [0, 1, 2, 3, 4, 5];

			expect([...range]).to.equal(expectation);

			let index = 0;

			for (value of range) {
				expect(value).to.equal(expectation[index]);
				++index;
			}

			next();
		});
	});

	describe('static methods', () => {
		describe('fromString', () => {
			each`
				from       | min          | max         | size        | separator
				-----------|--------------|-------------|-------------|-----------
				1000..9999 | ${1000}      | ${9999}     | ${9000}     | ${und}
				1000/9999  | ${1000}      | ${9999}     | ${9000}     | ${'/'}
				-INF..INF  | ${-Infinity} | ${Infinity} | ${Infinity} | ${und}
				-INF*INF   | ${-Infinity} | ${Infinity} | ${Infinity} | ${'*'}
				-INF..100  | ${-Infinity} | ${100}      | ${Infinity} | ${und}
				-INF#100   | ${-Infinity} | ${100}      | ${Infinity} | ${'#'}
				100..INF   | ${100}       | ${Infinity} | ${Infinity} | ${und}
				100!INF    | ${100}       | ${Infinity} | ${Infinity} | ${'!'}
			`(
				'$from has min $min, max $max and size $size',
				({ from, min, max, size, separator }, next) => {
					const range = Range.fromString(from, separator);

					expect(range.min).to.equal(min);
					expect(range.max).to.equal(max);
					expect(range.size).to.equal(size);

					next();
				}
			);
		});

		describe('fromHex', () => {
			each`
				from      | min          | max         | size        | separator
				----------|--------------|-------------|-------------|-----------
				3e8..270f | ${1000}      | ${9999}     | ${9000}     | ${und}
				3e8/270f  | ${1000}      | ${9999}     | ${9000}     | ${'/'}
				-INF..INF | ${-Infinity} | ${Infinity} | ${Infinity} | ${und}
				-INF*INF  | ${-Infinity} | ${Infinity} | ${Infinity} | ${'*'}
				-INF..100 | ${-Infinity} | ${256}      | ${Infinity} | ${und}
				-INF#100  | ${-Infinity} | ${256}      | ${Infinity} | ${'#'}
				100..INF  | ${256}       | ${Infinity} | ${Infinity} | ${und}
				100!INF   | ${256}       | ${Infinity} | ${Infinity} | ${'!'}
			`(
				'$from has min $min, max $max and size $size',
				({ from, min, max, size, separator }, next) => {
					const range = Range.fromHex(from, separator);

					expect(range.min).to.equal(min);
					expect(range.max).to.equal(max);
					expect(range.size).to.equal(size);

					next();
				}
			);
		});

		describe('fromJSON', () => {
			each`
				from                         | min          | max         | size
				-----------------------------|--------------|-------------|------ 
				{"min":1000, "max":9999}     | ${1000}      | ${9999}     | ${9000}
				{"min":"-INF", "max": "INF"} | ${-Infinity} | ${Infinity} | ${Infinity}
				{"min": "-INF", "max": 100}  | ${-Infinity} | ${100}      | ${Infinity}
				{"min": 100, "max": "INF" }  | ${100}       | ${Infinity} | ${Infinity}
				{"min": 100 }                | ${100}       | ${100} | ${1}
				{"max": 100 }                | ${100}       | ${100} | ${1}
				{}                           | ${-Infinity} | ${Infinity} | ${Infinity}
			`(
				'$from has min $min, max $max and size $size',
				({ from, min, max, size }, next) => {
					const range = Range.fromJSON(from);

					expect(range.min).to.equal(min);
					expect(range.max).to.equal(max);
					expect(range.size).to.equal(size);

					next();
				}
			);
		});
	});
});
