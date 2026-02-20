import React from 'react';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../../test/createTestServices';
import createTestStore from '../../../../../test/createTestStore';
import { book, page } from '../../../../../test/mocks/archiveLoader';
import createMockHighlight from '../../../../../test/mocks/highlight';
import { mockCmsBook } from '../../../../../test/mocks/osWebLoader';
import TestContainer from '../../../../../test/TestContainer';
import { MiddlewareAPI, Store } from '../../../../types';
import { receiveBook, receivePage } from '../../../actions';
import { assertDocument } from '../../../../utils';
import { formatBookData } from '../../../utils';
import { highlightLocationFilters } from '../../selectors';
import { HighlightData } from '../../types';
import { getHighlightLocationFilterForPage } from '../../utils';
import MenuToggle from '../MenuToggle';
import ColorPicker from '../ColorPicker';
import HighlightAnnotation from './HighlightAnnotation';
import HighlightListElement from './HighlightListElement';
import HighlightDeleteWrapper from './HighlightDeleteWrapper';
import * as utils from './utils';
import { ConfirmationToastProvider } from '../../../components/ConfirmationToast';

describe('HighlightDeleteWrapper', () => {
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
  });

  it('match snapshot when editing is set to false', () => {
    const component = renderer.create(<TestContainer store={store}>
      <HighlightAnnotation
        annotation='Some annotation'
        isEditing={false}
        onSave={() => {}}
        onCancel={() => {}}
      />
    </TestContainer>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('match snapshot when editing is set to true', () => {
    const createNodeMock = () => assertDocument().createElement('div');
    const component = renderer.create(<TestContainer store={store}>
      <HighlightAnnotation
        annotation='Some annotation'
        isEditing={true}
        onSave={() => {}}
        onCancel={() => {}}
      />
    </TestContainer>, {createNodeMock});

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('properly fire onCancel and onSave props', () => {
    let savedText = '';
    let cancelClicked = false;
    const annotation = 'TEST';

    const createNodeMock = () => assertDocument().createElement('div');
    const component = renderer.create(<TestContainer store={store}>
      <HighlightAnnotation
        annotation={annotation}
        isEditing={true}
        onCancel={() => { cancelClicked = true; }}
        onSave={(text) => { savedText = text; }}
      />
    </TestContainer>, {createNodeMock});

    renderer.act(() => { return; });

    renderer.act(() => {
      const textarea = component.root.findByProps({ value: annotation });
      textarea.props.onChange({
        preventDefault: jest.fn(),
        target: {value: 'newAnno'},
      });
    });

    renderer.act(() => {
      const saveButton = component.root.findByProps({ 'data-testid': 'save' });
      saveButton.props.onClick();
      const cancelButton = component.root.findByProps({ 'data-testid': 'cancel' });
      cancelButton.props.onClick();
    });

    expect(savedText).toEqual('newAnno');
    expect(cancelClicked).toEqual(true);
  });
});

describe('Highlight annotation', () => {
  let store: Store;
  let services: ReturnType<typeof createTestServices> & MiddlewareAPI;
  let highlight: ReturnType<typeof createMockHighlight>;

  beforeEach(() => {
    store = createTestStore();
    services = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };
    highlight = createMockHighlight('asdf');
  });

  it('edits annotation from MH pop up and track analytics', () => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));

    const locationFilters = highlightLocationFilters(store.getState());
    const location = getHighlightLocationFilterForPage(locationFilters, page);

    jest.spyOn(utils, 'useCreateHighlightLink')
      .mockReturnValue('/link/to/highlight');

      const createNodeMock = () => assertDocument().createElement('div');
      const component = renderer.create(<TestContainer services={services} store={store}>
      <ConfirmationToastProvider>
        <HighlightListElement
          highlight={highlight as unknown as HighlightData}
          locationFilterId={location!.id}
          pageId={page.id}
        />
      </ConfirmationToastProvider>
    </TestContainer>, {createNodeMock});

    const track = jest.spyOn(services.analytics.editAnnotation, 'track');

    renderer.act(() => {
      const dropdown = component.root.findByType(MenuToggle);
      dropdown.props.onClick();
    });

    renderer.act(() => {
      const editButton = component.root.findByProps({ 'data-testid': 'edit' });
      editButton.props.onClick();
    });

    renderer.act(() => {
      const textarea = component.root.findByType('textarea');
      textarea.props.onChange({
        preventDefault: jest.fn(),
        target: {value: 'newAnno'},
      });
    });

    renderer.act(() => {
      const saveButton = component.root.findByProps({ 'data-testid': 'save' });
      saveButton.props.onClick();
    });

    expect(track).toHaveBeenCalled();
  });

  it('shows success toast when changing highlight color', () => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));

    const locationFilters = highlightLocationFilters(store.getState());
    const location = getHighlightLocationFilterForPage(locationFilters, page);

    jest.spyOn(utils, 'useCreateHighlightLink')
      .mockReturnValue('/link/to/highlight');

    const createNodeMock = () => assertDocument().createElement('div');
    const component = renderer.create(<TestContainer services={services} store={store}>
      <ConfirmationToastProvider>
        <HighlightListElement
          highlight={highlight as unknown as HighlightData}
          locationFilterId={location!.id}
          pageId={page.id}
        />
      </ConfirmationToastProvider>
    </TestContainer>, {createNodeMock});

    renderer.act(() => {
      const dropdown = component.root.findByType(MenuToggle);
      dropdown.props.onClick();
    });

    renderer.act(() => {
      const colorPicker = component.root.findByType(ColorPicker);
      colorPicker.props.onChange('blue');
    });

    jest.spyOn(services.analytics.editNoteColor, 'track');
    expect(component.root.findAllByProps({ 'aria-live': 'polite' }).length).toBeGreaterThan(0);
  });

  it('shows delete toast when deleting highlight', () => {
    store.dispatch(receiveBook(formatBookData(book, mockCmsBook)));
    store.dispatch(receivePage({...page, references: []}));

    const locationFilters = highlightLocationFilters(store.getState());
    const location = getHighlightLocationFilterForPage(locationFilters, page);

    jest.spyOn(utils, 'useCreateHighlightLink')
      .mockReturnValue('/link/to/highlight');

    const createNodeMock = () => assertDocument().createElement('div');
    const component = renderer.create(<TestContainer services={services} store={store}>
      <ConfirmationToastProvider>
        <HighlightListElement
          highlight={highlight as unknown as HighlightData}
          locationFilterId={location!.id}
          pageId={page.id}
        />
      </ConfirmationToastProvider>
    </TestContainer>, {createNodeMock});

    renderer.act(() => {
      const dropdown = component.root.findByType(MenuToggle);
      dropdown.props.onClick();
    });

    renderer.act(() => {
      const deleteButton = component.root.findByProps({ 'data-testid': 'delete' });
      deleteButton.props.onClick();
    });

    renderer.act(() => {
      const deleteWrapper = component.root.findByType(HighlightDeleteWrapper);
      deleteWrapper.props.onDelete();
    });

    jest.spyOn(services.analytics.deleteHighlight, 'track');
    expect(component.root.findAllByProps({ 'aria-live': 'polite' }).length).toBeGreaterThan(0);
  });
});
