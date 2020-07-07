import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { receiveLoggedOut } from '../../../auth/actions';
import { DropdownToggle } from '../../../components/Dropdown';
import MessageProvider from '../../../MessageProvider';
import { Store } from '../../../types';
import { formatBookData, stripIdVersion } from '../../utils';
import { receiveStudyGuidesTotalCounts } from '../actions';
import Filters, { ConnectedFilterList } from './Filters';

jest.mock('../../components/popUp/ChapterFilter', () => (props: any) => <div mock-chapter-filter {...props} />);

describe('Filters', () => {
  let store: Store;
  const book = formatBookData(archiveBook, mockCmsBook);

  beforeEach(() => {
    store = createTestStore();
  });

  it('matches snapshot', () => {
    const pageId = stripIdVersion(book.tree.contents[0].id);
    store.dispatch(receiveStudyGuidesTotalCounts({
      [pageId]: {
        [HighlightColorEnum.Green]: 1,
        [HighlightColorEnum.Yellow]: 1,
        [HighlightColorEnum.Blue]: 1,
        [HighlightColorEnum.Pink]: 1,
        [HighlightColorEnum.Purple]: 1,
      },
    }));

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <Filters />
      </MessageProvider>
    </Provider>);

    renderer.act(() => {
      const chapterFilterToggle = component.root.findByType(DropdownToggle);
      chapterFilterToggle.props.onClick();
    });

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('does not render ConnectedFilterList if user is logged out', () => {
    store.dispatch(receiveLoggedOut());
    const pageId = stripIdVersion(book.tree.contents[0].id);
    store.dispatch(receiveStudyGuidesTotalCounts({
      [pageId]: {
        [HighlightColorEnum.Green]: 1,
        [HighlightColorEnum.Yellow]: 1,
      },
    }));

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <Filters />
      </MessageProvider>
    </Provider>);

    let message: string | undefined;
    try {
      component.root.findByType(ConnectedFilterList);
    } catch (e) {
      message = e.message;
    }
    expect(message).toEqual('No instances found with node type: "Connect(FiltersList)"');
  });

});
