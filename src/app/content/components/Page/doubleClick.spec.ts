import isDoubleClick from './doubleClick';

describe('isDoubleClick', () => {
    it('recognizes double click', () => {
        expect(isDoubleClick('one')).toBe(undefined);
        expect(isDoubleClick('one')).toBe(true);
        expect(isDoubleClick('two')).toBe(false);
    });
});