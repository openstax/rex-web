import * as jwt from 'jsonwebtoken';
import { pullToken, decodeToken } from './launchToken';
import { assertWindow } from '../utils/browser-assertions';

describe('launchToken', () => {

  it('decodes token', () => {
    const token = jwt.sign({
      sub: JSON.stringify({stuff: 'things'}),
    }, 'secret');

    const replaceStateSpy = jest.fn();
    Object.defineProperty(assertWindow().history, 'replaceState', {
      writable: true,
      value: replaceStateSpy,
    });

    Object.defineProperty(assertWindow(), 'location', {
      writable: true,
      value: {
        ...assertWindow().location,
        search: `t=${token}&other=thing`,
      },
    });

    const result = pullToken(assertWindow());

    expect(result?.tokenString).toEqual(token);
    expect(result?.tokenData).toEqual(expect.objectContaining({stuff: 'things'}));

    expect(replaceStateSpy).toHaveBeenCalledWith(expect.anything(), expect.anything(),
      assertWindow().location.pathname + '?other=thing'
    );
  });

  it('works without token', () => {
    const replaceStateSpy = jest.fn();
    Object.defineProperty(assertWindow().history, 'replaceState', {
      value: replaceStateSpy,
    });

    Object.defineProperty(assertWindow(), 'location', {
      writable: true,
      value: {
        ...assertWindow().location,
        search: `other=thing`,
      },
    });

    const result = pullToken(assertWindow());

    expect(result).toBe(undefined);

    expect(replaceStateSpy).not.toHaveBeenCalled();
  });

  it('works with invalid token', () => {
    const token = 'asdf';

    const replaceStateSpy = jest.fn();
    Object.defineProperty(assertWindow().history, 'replaceState', {
      writable: true,
      value: replaceStateSpy,
    });

    Object.defineProperty(assertWindow(), 'location', {
      writable: true,
      value: {
        ...assertWindow().location,
        search: `t=${token}`,
      },
    });

    const result = pullToken(assertWindow());

    expect(result).toBe(undefined);

    expect(replaceStateSpy).toHaveBeenCalledWith(expect.anything(), expect.anything(),
      assertWindow().location.pathname
    );
  });

  describe('outside browser', () => {
    const windowBackup = window;
    const documentBackup = document;

    beforeEach(() => {
      delete (global as any).window;
      delete (global as any).document;
    });

    afterEach(() => {
      (global as any).window = windowBackup;
      (global as any).document = documentBackup;
    });

    it('works', () => {
      expect(() => decodeToken('asdf')).not.toThrow();
    });
  });
});
