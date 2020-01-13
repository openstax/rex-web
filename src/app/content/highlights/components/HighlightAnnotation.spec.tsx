import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import MessageProvider from '../../../MessageProvider';
import { Store } from '../../../types';
import HighlightAnnotation from './HighlightAnnotation';

describe('HighlightDeleteWrapper', () => {
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
  });

  it('match snapshot when editing is set to false', () => {
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <HighlightAnnotation
          annotation='Some annotation'
          isEditable={false}
          // tslint:disable-next-line: no-empty
          onSave={() => {}}
          // tslint:disable-next-line: no-empty
          onCancel={() => {}}
        />
      </MessageProvider>
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('match snapshot when editing is set to true', () => {
    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <HighlightAnnotation
          annotation='Some annotation'
          isEditable={true}
          // tslint:disable-next-line: no-empty
          onSave={() => {}}
          // tslint:disable-next-line: no-empty
          onCancel={() => {}}
        />
      </MessageProvider>
    </Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('properly fire onCancel and onSave props', () => {
    let savedText = '';
    let cancelClicked = false;
    const annotation = 'TEST';

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <HighlightAnnotation
          annotation={annotation}
          isEditable={true}
          onCancel={() => { cancelClicked = true; }}
          onSave={(text) => { savedText = text; }}
        />
      </MessageProvider>
    </Provider>);

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

  it('properly handle Escape and Enter', () => {
    let escClicked = false;
    let enterClicked = false;
    const annotation = 'TEST';

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <HighlightAnnotation
          annotation={annotation}
          isEditable={true}
          onCancel={() => { escClicked = true; }}
          onSave={() => { enterClicked = true; }}
        />
      </MessageProvider>
    </Provider>);

    renderer.act(() => {
      const textarea = component.root.findByProps({ value: annotation });
      textarea.props.onKeyDown({
        key: 'Enter',
      });
      textarea.props.onKeyDown({
        key: 'Escape',
      });
    });

    expect(escClicked).toEqual(true);
    expect(enterClicked).toEqual(true);
  });
});
