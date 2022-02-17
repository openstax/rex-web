import { downloadFile } from './downloadFile';

describe('downloadFile', () => {
  it('works', () => {
    expect(() => downloadFile('file.txt', 'content')).not.toThrow();
  });
});
