import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { DropdownToggle } from '../../../components/Dropdown';
import MessageProvider from '../../../MessageProvider';
import { MiddlewareAPI, Store } from '../../../types';
import { formatBookData, stripIdVersion } from '../../utils';
import { receiveStudyGuidesTotalCounts } from '../actions';
import Filters from './Filters';

jest.mock('../../elements/popUp/ChapterFilter', () => (props: any) => <div mock-chapter-filter {...props} />);

describe('Filters', () => {
  let store: Store;
  const book = formatBookData(archiveBook, mockCmsBook);
  let helpers: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let dispatch: jest.SpyInstance;
  let storeDispatch: jest.SpyInstance;

  beforeEach(() => {
    store = createTestStore();

    helpers = {
    ...createTestServices(),
    dispatch: store.dispatch,
    getState: store.getState,
    };

    dispatch = jest.spyOn(helpers, 'dispatch');
    storeDispatch = jest.spyOn(store, 'dispatch');
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
      const [chapterFilterToggle, ] = component.root.findAllByType(DropdownToggle);
      chapterFilterToggle.props.onClick();
    });

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

});
