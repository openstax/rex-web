import createIntl from './createIntl';

describe('locale not found', () => {

  it('loads english messages', async() => {
    const intl = await createIntl('foo');
    expect(intl.locale).toBe('en');
  });

});
