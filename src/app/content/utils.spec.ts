import { getContentPageReferences, stripIdVersion } from './utils';

describe('stripIdVersion', () => {
  it('strips ids', () => {
    expect(stripIdVersion('asdf@qwer')).toEqual('asdf');
  });

  it('doesn\'t break with no id', () => {
    expect(stripIdVersion('asdf')).toEqual('asdf');
  });
});

describe('getContentPageReferences', () => {
  it('works with no references in the content', () => {
    expect(getContentPageReferences('some cool content')).toEqual([]);
  });

  it('works with empty content', () => {
    expect(getContentPageReferences('')).toEqual([]);
  });

  it('picks up basic content reference', () => {
    expect(getContentPageReferences('asdfasdfasf /contents/as8s8xu9sdnjsd9 asdfadf')).toEqual([{
      bookUid: undefined,
      bookVersion: undefined,
      match: '/contents/as8s8xu9sdnjsd9',
      pageUid: 'as8s8xu9sdnjsd9',
    }]);
  });

  it('picks up book content reference', () => {
    expect(getContentPageReferences('asdfasdfasf /contents/as8s8xu:9sdnjsd9 asdfadf')).toEqual([{
      bookUid: 'as8s8xu',
      bookVersion: undefined,
      match: '/contents/as8s8xu:9sdnjsd9',
      pageUid: '9sdnjsd9',
    }]);
  });

  it('picks up versioned book content reference', () => {
    expect(getContentPageReferences('asdfasdfasf /contents/as8s8xu@1.2:9sdnjsd9 asdfadf')).toEqual([{
      bookUid: 'as8s8xu',
      bookVersion: '1.2',
      match: '/contents/as8s8xu@1.2:9sdnjsd9',
      pageUid: '9sdnjsd9',
    }]);
  });

  it('picks up multiple references', () => {
    expect(getContentPageReferences(`
      asdfa /contents/as8s8xu9sdnjsd9 sdf
      /contents/as8s8xu:9sdnjsd9
      asf /contents/as8s8xu@1.2:9sdnjsd9 asdfadf
    `)).toEqual([
      {
        bookUid: undefined,
        bookVersion: undefined,
        match: '/contents/as8s8xu9sdnjsd9',
        pageUid: 'as8s8xu9sdnjsd9',
      },
      {
        bookUid: 'as8s8xu',
        bookVersion: undefined,
        match: '/contents/as8s8xu:9sdnjsd9',
        pageUid: '9sdnjsd9',
      },
      {
        bookUid: 'as8s8xu',
        bookVersion: '1.2',
        match: '/contents/as8s8xu@1.2:9sdnjsd9',
        pageUid: '9sdnjsd9',
      },
    ]);
  });
});
