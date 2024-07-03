import cookie from './cookie';

describe('cookie', () => {
    const cookieSpy = jest.spyOn(document!, 'cookie', 'set');

    it('sets using defaults', () => {
        cookie.setKey('foo');
        expect(cookieSpy).toBeCalledWith(expect.stringMatching(/^foo=true;path=\/;expires/));
    });
    it('deleteKey', () => {
        cookie.deleteKey('foo');
        expect(cookieSpy).toBeCalledWith(expect.stringMatching(/^foo=true;path=\/;expires.*1970/));
    });
    it('is ok without document', () => {
        delete global.document;
        cookie.setKey('foo');
        cookie.deleteKey('foo');
        expect('foo' in cookie.hash).toBe(false);
    });
});