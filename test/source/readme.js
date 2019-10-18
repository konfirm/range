/* global source, describe, it, each, expect */

const main = source('main');
const Range = source('Entity/Range');
const RangeCollection = source('Entity/RangeCollection');

describe('README examples', () => {
	describe('Usage', () => {
		it('exports Range', (next) => {
			const { Range: Subject } = main;

			expect(Subject).to.equal(Range);

			next();
		});

		it('exports RangeCollection', (next) => {
			const { RangeCollection: Subject } = main;

			expect(Subject).to.equal(RangeCollection);

			next();
		});

		describe('Range', () => {
			describe('new Range', () => {
				it('new Range(0,10)', (next) => {
					const range = new Range(0, 10);

					expect(range.contains(0)).to.be.true();
					expect(range.contains(10)).to.be.true();
					expect(range.contains(11)).to.be.false();

					next();
				});

				it('new Range(0, 2, 3, 7, 8, 10)', (next) => {
					const range = new Range(0, 2, 3, 7, 8, 10);

					expect(range.contains(0)).to.be.true();
					expect(range.contains(10)).to.be.true();
					expect(range.contains(11)).to.be.false();

					next();
				});

				it('new Range(10)', (next) => {
					const range = new Range(10);

					expect(range.contains(9)).to.be.false();
					expect(range.contains(10)).to.be.true();
					expect(range.contains(11)).to.be.false();

					next();
				});

				it('new Range()', (next) => {
					const range = new Range();

					expect(range.contains(-Infinity)).to.be.true();
					expect(range.contains(Infinity)).to.be.true();

					next();
				});
			});

			describe('properties', () => {
				it('sample', (next) => {
					const range = new Range(100, 199);

					expect(range.min).to.equal(100);
					expect(range.max).to.equal(199);
					expect(range.size).to.equal(100);

					next();
				});
			});

			describe('contains', () => {
				it('sample', (next) => {
					const range = new Range(100, 199);

					expect(range.contains(100)).to.be.true();
					expect(range.contains(150)).to.be.true();
					expect(range.contains(200)).to.be.false();

					expect(range.contains(100, 150)).to.be.true();
					expect(range.contains(100, 200)).to.be.false();

					next();
				});
			});

			describe('toString', () => {
				it('default', (next) => {
					const range = new Range(100, 199);

					expect(range.toString()).to.equal('100..199');
					expect(String(range)).to.equal('100..199');
					expect('range:' + range).to.equal('range:100..199');
					expect(`range:${range}`).to.equal('range:100..199');

					next();
				});

				it('separator', (next) => {
					const range = new Range(100, 199);

					expect(range.toString('/')).to.equal('100/199');

					next();
				});
			});

			describe('toHex', () => {
				it('default', (next) => {
					const range = new Range(100, 199);

					expect(range.toHex()).to.equal('64..c7');

					next();
				});

				it('length', (next) => {
					const range = new Range(100, 199);

					expect(range.toHex(4)).to.equal('0064..00c7');
					expect(range.toHex(7)).to.equal('0000064..00000c7');

					next();
				});

				it('separator', (next) => {
					const range = new Range(100, 199);

					expect(range.toHex(0, '/')).to.equal('64/c7');
					expect(range.toHex(4, '/')).to.equal('0064/00c7');
					expect(range.toHex(7, '/')).to.equal('0000064/00000c7');

					next();
				});
			});

			describe('toJSON', () => {
				it('default', (next) => {
					const range = new Range(100, 199);

					expect(range.toJSON()).to.equal({ min: 100, max: 199 });
					expect(JSON.stringify(range)).to.equal(
						'{"min":100,"max":199}'
					);

					next();
				});

				it('equal min/max', (next) => {
					const range = new Range(100);

					expect(range.toJSON()).to.equal({ min: 100 });
					expect(JSON.stringify(range)).to.equal('{"min":100}');

					next();
				});
			});

			describe('iterator', () => {
				const range = new Range(0, 5);
				const expectation = [0, 1, 2, 3, 4, 5];

				it('for..of', (next) => {
					let index = 0;

					for (const value of range) {
						expect(value).to.equal(expectation[index]);
						++index;
					}

					next();
				});

				it('destructure', (next) => {
					expect([...range]).to.equal(expectation);

					next();
				});
			});

			describe('fromString', () => {
				it('sample "123..789"', (next) => {
					const range = Range.fromString('123..789');

					expect(range.min).to.equal(123);
					expect(range.max).to.equal(789);
					expect(range.size).to.equal(667);

					next();
				});

				it('sample "123/789"', (next) => {
					const range = Range.fromString('123/789', '/');

					expect(range.min).to.equal(123);
					expect(range.max).to.equal(789);
					expect(range.size).to.equal(667);

					next();
				});
			});

			describe('fromHex', () => {
				it('sample "7b..315"', (next) => {
					const range = Range.fromHex('7b..315');

					expect(range.min).to.equal(123);
					expect(range.max).to.equal(789);
					expect(range.size).to.equal(667);

					next();
				});

				it('sample "7b/315"', (next) => {
					const range = Range.fromHex('7b/315', '/');

					expect(range.min).to.equal(123);
					expect(range.max).to.equal(789);
					expect(range.size).to.equal(667);

					next();
				});
			});

			describe('fromJSON', () => {
				it('sample "{"min":123,"max":789}"', (next) => {
					const range = Range.fromJSON('{"min":123,"max":789}');

					expect(range.min).to.equal(123);
					expect(range.max).to.equal(789);
					expect(range.size).to.equal(667);

					next();
				});
			});
		});

		describe('RangeCollection', () => {
			describe('new RangeCollection', () => {
				it('sample', (next) => {
					const collection = new RangeCollection(
						new Range(0, 3),
						new Range(7, 10)
					);

					expect(collection.contains(0)).to.be.true();
					expect(collection.contains(3)).to.be.true();
					expect(collection.contains(4)).to.be.false();
					expect(collection.contains(7)).to.be.true();
					expect(collection.contains(10)).to.be.true();
					expect(collection.contains(11)).to.be.false();

					next();
				});
			});

			describe('properties', () => {
				it('sample', (next) => {
					const collection = new RangeCollection(
						new Range(100, 110),
						new Range(200, 210)
					);

					expect(collection.min).to.equal(100);
					expect(collection.max).to.equal(210);
					expect(collection.size).to.equal(22);

					next();
				});
			});

			describe('contains', () => {
				it('sample', (next) => {
					const collection = new RangeCollection(
						new Range(100, 110),
						new Range(200, 210)
					);

					expect(collection.contains(100)).to.be.true();
					expect(collection.contains(150)).to.be.false();
					expect(collection.contains(200)).to.be.true();

					expect(collection.contains(100, 150)).to.be.false();
					expect(collection.contains(100, 200)).to.be.true();

					next();
				});
			});

			describe('toString', () => {
				const collection = new RangeCollection(
					new Range(100, 110),
					new Range(200, 210)
				);

				it('basic', (next) => {
					expect(collection.toString()).to.equal('100..110,200..210');
					expect(String(collection)).to.equal('100..110,200..210');

					next();
				});

				it('separator', (next) => {
					expect(collection.toString('/')).to.equal(
						'100/110,200/210'
					);

					next();
				});

				it('join', (next) => {
					expect(collection.toString('..', '/')).to.equal(
						'100..110/200..210'
					);
					expect(collection.toString(':', '/')).to.equal(
						'100:110/200:210'
					);

					next();
				});
			});

			describe('toHex', () => {
				const collection = new RangeCollection(
					new Range(100, 110),
					new Range(200, 210)
				);

				it('basic', (next) => {
					expect(collection.toHex()).to.equal('64..6e,c8..d2');

					next();
				});

				it('length', (next) => {
					expect(collection.toHex(4)).to.equal(
						'0064..006e,00c8..00d2'
					);

					next();
				});

				it('separator', (next) => {
					expect(collection.toHex(0, ':')).to.equal('64:6e,c8:d2');
					expect(collection.toHex(4, ':')).to.equal(
						'0064:006e,00c8:00d2'
					);

					next();
				});

				it('join', (next) => {
					expect(collection.toHex(0, ':', '/')).to.equal(
						'64:6e/c8:d2'
					);
					expect(collection.toHex(4, ':', '/')).to.equal(
						'0064:006e/00c8:00d2'
					);

					next();
				});
			});

			describe('toJSON', () => {
				it('basic', (next) => {
					const collection = new RangeCollection(
						new Range(100, 110),
						new Range(200, 210)
					);

					expect(collection.toJSON()).to.equal([
						{ min: 100, max: 110 },
						{ min: 200, max: 210 }
					]);
					expect(JSON.stringify(collection)).to.equal(
						'[{"min":100,"max":110},{"min":200,"max":210}]'
					);

					next();
				});
			});

			describe('iterator', () => {
				const collection = new RangeCollection(
					new Range(0, 3),
					new Range(7, 10)
				);
				const expectation = [0, 1, 2, 3, 7, 8, 9, 10];

				it('for..of', (next) => {
					let index = 0;

					for (const value of collection) {
						expect(value).to.equal(expectation[index]);
						++index;
					}

					next();
				});

				it('destructure', (next) => {
					expect([...collection]).to.equal(expectation);

					next();
				});
			});

			describe('from', () => {
				it('basic', (next) => {
					const collection = RangeCollection.from(
						new Range(123, 345),
						400,
						500,
						new Range(789, 890)
					);

					expect(collection.min).to.equal(123);
					expect(collection.max).to.equal(890);
					expect(collection.size).to.equal(327);

					next();
				});
			});

			describe('fromString', () => {
				it('basic', (next) => {
					const collection = RangeCollection.fromString(
						'123..345,400,500,789..890'
					);

					expect(collection.min).to.equal(123);
					expect(collection.max).to.equal(890);
					expect(collection.size).to.equal(327);

					next();
				});

				it('separator', (next) => {
					const collection = RangeCollection.fromString(
						'123:345,400,500,789:890',
						':'
					);

					expect(collection.min).to.equal(123);
					expect(collection.max).to.equal(890);
					expect(collection.size).to.equal(327);

					next();
				});

				it('join', (next) => {
					const collection = RangeCollection.fromString(
						'123:345/400/500/789:890',
						':',
						'/'
					);

					expect(collection.min).to.equal(123);
					expect(collection.max).to.equal(890);
					expect(collection.size).to.equal(327);

					next();
				});
			});

			describe('fromHex', () => {
				it('basic', (next) => {
					const collection = RangeCollection.fromHex(
						'7b..159,190,1f4,315..37a'
					);

					expect(collection.min).to.equal(123);
					expect(collection.max).to.equal(890);
					expect(collection.size).to.equal(327);

					next();
				});

				it('separator', (next) => {
					const collection = RangeCollection.fromHex(
						'7b:159,190,1f4,315:37a',
						':'
					);

					expect(collection.min).to.equal(123);
					expect(collection.max).to.equal(890);
					expect(collection.size).to.equal(327);

					next();
				});

				it('join', (next) => {
					const collection = RangeCollection.fromHex(
						'7b:159/190/1f4/315:37a',
						':',
						'/'
					);

					expect(collection.min).to.equal(123);
					expect(collection.max).to.equal(890);
					expect(collection.size).to.equal(327);

					next();
				});
			});

			describe('fromJSON', () => {
				it('basic', (next) => {
					const collection = RangeCollection.fromJSON(
						'[{"min":123,"max":345},{"min":400},{"min":500},{"min":789,"max":890}]'
					);

					expect(collection.min).to.equal(123);
					expect(collection.max).to.equal(890);
					expect(collection.size).to.equal(327);

					next();
				});
			});
		});
	});
});
