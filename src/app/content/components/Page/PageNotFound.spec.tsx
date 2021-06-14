import React from 'react';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import TestContainer from '../../../../test/TestContainer';
import { runHooksAsync } from '../../../../test/utils';
import { Store } from '../../../types';
import { openToc } from '../../actions';
import { receiveBook } from '../../actions';
import { tocOpen } from '../../selectors';
import { formatBookData } from '../../utils';
import { SidebarControl } from '../Toolbar/styled';
import PageNotFound from './PageNotFound';

const book = formatBookData(archiveBook, mockCmsBook);

describe('PageNotFound', () => {
  let store: Store;
  const bookState = formatBookData(book, mockCmsBook);

  beforeEach(() => {
    store = createTestStore();
    store.dispatch(receiveBook(bookState));
  });

  it('renders correctly', async() => {
    const { root } = renderer.create(<TestContainer store={store}>
      <PageNotFound />
    </TestContainer>);

    await runHooksAsync();

    expect(root.findByProps({ id: 'i18n:page-not-found:heading' })).toBeTruthy();
    expect(root.findByProps({ id: 'i18n:page-not-found:text-before-button' })).toBeTruthy();
    expect(root.findByType(SidebarControl)).toBeTruthy();
  });

  it('opens toc when clicking on the button', async() => {
    const dispatch = jest.spyOn(store, 'dispatch');

    const component = renderer.create(<TestContainer store={store}>
      <PageNotFound />
    </TestContainer>);

    await runHooksAsync();

    renderer.act(() => {
      component.root.findByProps({ 'data-testid': 'toc-button' }).props.onClick();
    });

    expect(dispatch).toHaveBeenCalledWith(openToc());
  });

  it('clicking multiple times on the button does not close toc', async() => {
    const dispatch = jest.spyOn(store, 'dispatch');

    const component = renderer.create(<TestContainer store={store}>
      <PageNotFound />
    </TestContainer>);

    await runHooksAsync();

    expect(tocOpen(store.getState())).toEqual(null);

    renderer.act(() => {
      component.root.findByProps({ 'data-testid': 'toc-button' }).props.onClick();
    });

    expect(dispatch).toHaveBeenCalledWith(openToc());
    expect(tocOpen(store.getState())).toEqual(true);

    renderer.act(() => {
      component.root.findByProps({ 'data-testid': 'toc-button' }).props.onClick();
    });

    expect(tocOpen(store.getState())).toEqual(true);
  });
});
