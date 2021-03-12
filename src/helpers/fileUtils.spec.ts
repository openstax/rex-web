import * as fs from 'fs';
import * as fileUtils from './fileUtils';

jest.mock('fs');

beforeEach(() => {
  jest.resetAllMocks();
});

describe('writeFile', () => {
  it('creates parent directory', () => {
    const mkdirSpy = jest.spyOn(fs, 'mkdirSync');
    const accessSpy = jest.spyOn(fs, 'accessSync');
    const statSpy = jest.spyOn(fs, 'lstatSync');

    accessSpy.mockImplementationOnce(() => { throw new Error('asd'); });
    statSpy.mockReturnValue({isDirectory: () => true} as any);

    fileUtils.writeFile('foobar/somefile.txt', 'asdf');

    expect(mkdirSpy).toHaveBeenCalledWith('foobar');

  });

  it('writes contents', () => {
    const spy = jest.spyOn(fs, 'writeFileSync');
    const statSpy = jest.spyOn(fs, 'lstatSync');

    statSpy.mockReturnValue({isDirectory: () => true} as any);

    fileUtils.writeFile('somefile.txt', 'asdf');

    expect(spy).toHaveBeenCalledWith('somefile.txt', 'asdf');
  });
});

describe('touchFile', () => {
  it('writes an empty file', () => {
    const accessSpy = jest.spyOn(fs, 'accessSync');
    const spy = jest.spyOn(fs, 'writeFileSync');
    const statSpy = jest.spyOn(fs, 'lstatSync');

    statSpy.mockReturnValue({isDirectory: () => true} as any);

    accessSpy.mockImplementationOnce(() => { throw new Error('asd'); });

    fileUtils.touchFile('somefile.txt');

    expect(spy).toHaveBeenCalledWith('somefile.txt', '');
  });
  it('noops', () => {
    const spy = jest.spyOn(fs, 'writeFileSync');

    fileUtils.touchFile('somefile.txt');

    expect(spy).not.toHaveBeenCalled();
  });
});

describe('readFile', () => {
  it('does it', () => {
    const readSpy = jest.spyOn(fs, 'readFileSync');

    readSpy.mockReturnValue('contents');

    const contents = fileUtils.readFile('somefile');

    expect(readSpy).toHaveBeenCalledWith('somefile', 'utf8');
    expect(contents).toEqual('contents');
  });
});

describe('deleteFile', () => {
  it('does it', () => {
    const unlinkSpy = jest.spyOn(fs, 'unlinkSync');
    fileUtils.deleteFile('somefile');
    expect(unlinkSpy).toHaveBeenCalledWith('somefile');
  });
});
