import baseCheck from './support/check';

function check(source: string, expected: string): void {
  baseCheck(source, expected, { options: { logicalAssignment: true } });
}

describe('with logical assignment enabled', () => {
  it('passes through logical AND', () => {
    check(`a &&= 1`, `a &&= 1;`);
  });

  it('passes through logical OR', () => {
    check(`a ||= 1`, `a ||= 1;`);
  });

  it('translates existence to nullish coalescing', () => {
    check(`a ?= 1`, `a ??= 1;`);
  });
});
