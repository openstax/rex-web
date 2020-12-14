import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import Button from '../../../components/Button';
import * as Services from '../../../context/Services';
import MessageProvider from '../../../MessageProvider';
import { Store } from '../../../types';
import { LinkedArchiveTreeSection } from '../../types';
import { setSelectedSection } from '../actions';
import FinalScreen from './FinalScreen';

describe('FinalScreen for practice questions', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let services: ReturnType<typeof createTestServices>;

  beforeEach(() => {
    store = createTestStore();
    dispatch = jest.spyOn(store, 'dispatch');
    services = createTestServices();
  });

  it('renders properly and dispatches action on click', () => {
    const mockSection = { title: 'some title' } as LinkedArchiveTreeSection;

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <FinalScreen nextSection={mockSection} />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    const button = component.root.findByType(Button);

    renderer.act(() => {
      button.props.onClick();
    });

    expect(dispatch).toHaveBeenCalledWith(setSelectedSection(mockSection));
    expect(component.toJSON()).toMatchSnapshot();
  });
});
