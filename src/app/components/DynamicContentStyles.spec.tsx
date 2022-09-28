import React from 'react';
import renderer from 'react-test-renderer';
import createTestStore from '../../test/createTestStore';
import { book } from '../../test/mocks/archiveLoader';
import TestContainer from '../../test/TestContainer';
import { setStylesUrl } from '../content/actions';
import { State } from '../content/types';
import DynamicContentStyles, { WithStyles } from './DynamicContentStyles';

describe('DynamicContentStyles', () => {
  // tslint:disable-next-line: variable-name
  let Component: (props: { book: State['book'], disable?: boolean }) => JSX.Element;
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
    Component = (
      props: { book: State['book'], disable?: boolean }
    ) => <DynamicContentStyles book={props.book} disable={props.disable}>
      some text
    </DynamicContentStyles>;
  });

  it('sets styles and data-dynamic-style if stylesUrl is in the store and styles are cached', async() => {
    store.dispatch(setStylesUrl('/apps/archive/codeversion/resources/styles/test-styles.css'));

    const component = renderer.create(<TestContainer store={store}>
      <Component book={book} />
    </TestContainer>);

    const withStyles = component.root.findByType(WithStyles);
    expect(withStyles.props.styles).toEqual('.cool { color: red; }');
    expect(withStyles.props['data-dynamic-style']).toBe(true);
  });

  it('does not set styles and data-dynamic-style if stylesUrl is not set in store', async() => {
    const component = renderer.create(<TestContainer store={store}>
      <Component book={book} />
    </TestContainer>);

    const withStyles = component.root.findByType(WithStyles);
    expect(withStyles.props.styles).toEqual('');
    expect(withStyles.props['data-dynamic-style']).toBe(false);
  });

  it('does not set styles and data-dynamic-style if disable is passed', async() => {
    store.dispatch(setStylesUrl('/apps/archive/codeversion/resources/styles/test-styles.css'));

    const component = renderer.create(<TestContainer store={store}>
      <Component book={book} disable={true} />
    </TestContainer>);

    const withStyles = component.root.findByType(WithStyles);
    expect(withStyles.props.styles).toEqual('');
    expect(withStyles.props['data-dynamic-style']).toBe(false);
  });

  it('does not set styles and data-dynamic-style if style is not cached', async() => {
    store.dispatch(setStylesUrl('/apps/archive/codeversion/resources/styles/uncached-styles.css'));

    const component = renderer.create(<TestContainer store={store}>
      <Component book={book} />
    </TestContainer>);

    const withStyles = component.root.findByType(WithStyles);
    expect(withStyles.props.styles).toEqual('');
    expect(withStyles.props['data-dynamic-style']).toBe(false);
  });
});
