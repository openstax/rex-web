import {
  addTargetBlankToLinks,
  rebaseRelativeContentLinks,
  resolveRelativeResources,
} from '../utils/contentManipulation';

describe('addTargetBlankToLinks', () => {
  it('adds target _blank to all <a> tags' , () => {
    const input = '<div class="test">'
    + '<a href="some/link">First link</a>'
    + '<a href="some/link">Second link</a>'
    + '</div>';

    const output = '<div class="test">'
    + '<a href="some/link" target="_blank">First link</a>'
    + '<a href="some/link" target="_blank">Second link</a>'
    + '</div>';

    expect(addTargetBlankToLinks(input)).toEqual(output);
  });

  it('overrides target attribute - set it to _blank on all <a> tags' , () => {
    const input = '<div class="test">'
    + '<a href="some/link" target="_parent">First link</a>'
    + '<a href="some/link" target="_self">Second link</a>'
    + '<a href="some/link" target="_top">Third link</a>'
    + '<a href="some/link" target="_blank">Forth link</a>'
    + '</div>';

    const output = '<div class="test">'
    + '<a href="some/link" target="_blank">First link</a>'
    + '<a href="some/link" target="_blank">Second link</a>'
    + '<a href="some/link" target="_blank">Third link</a>'
    + '<a href="some/link" target="_blank">Forth link</a>'
    + '</div>';

    expect(addTargetBlankToLinks(input)).toEqual(output);
  });

  it('noop if there are no <a> tags in the document', () => {
    const input = '<div class="test">'
      + '<span>123</span>'
      + '</div>';

    expect(addTargetBlankToLinks(input)).toEqual(input);
  });

  it('do not throw if passed string does not contian html elements', () => {
    const input = '123 asdas d';

    expect(addTargetBlankToLinks(input)).toEqual(input);
  });
});

describe('rebaseRelativeContentLinks', () => {
  it('does modifies relative paths', () => {
    const input = '<div class="test">'
      + '<a href="../some/link" target="_blank">First link</a>'
      + '</div>';

    const output = '<div class="test">'
      + '<a href="/some/link" target="_blank">First link</a>'
      + '</div>';
    expect(rebaseRelativeContentLinks(input, '/something')).toEqual(output);
  });

  it('does not modify absolute paths', () => {
    const input = '<div class="test">'
      + '<a href="/some/link" target="_blank">First link</a>'
      + '</div>';

    expect(rebaseRelativeContentLinks(input, '')).toEqual(input);
  });
});

describe('resolveRelativeResources', () => {
  it('modifies resource elements', () => {
    const input = '<div class="test">'
      + '<img src="../some/link">'
      + '</div>'
      + '<iframe src="./url" title="description"></iframe>';

    const output = '<div class="test">'
      + '<img src="/some/link">'
      + '</div>'
      + '<iframe src="/url" title="description"></iframe>';

    expect(resolveRelativeResources(input, '/content')).toEqual(output);
  });

  it('doesnt modify img elements when not relative', () => {
    const input = '<div class="test">'
      + '<img src="/some/link">'
      + '</div>'
      + '<iframe src="/url" title="description"></iframe>';

    const output = '<div class="test">'
      + '<img src="/some/link">'
      + '</div>'
      + '<iframe src="/url" title="description"></iframe>';

    expect(resolveRelativeResources(input, '/content')).toEqual(output);
  });

  it('doesnt modify absolute url sources', () => {
    const input = '<div class="test">'
      + '<img src="https://openstax.org/some/link">'
      + '</div>'
      + '<iframe src="/url" title="description"></iframe>';

    const output = '<div class="test">'
      + '<img src="https://openstax.org/some/link">'
      + '</div>'
      + '<iframe src="/url" title="description"></iframe>';

    expect(resolveRelativeResources(input, '')).toEqual(output);
  });
});
