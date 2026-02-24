import React from 'react';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import TestContainer from '../../../../test/TestContainer';
import Button from '../../../components/Button';
import { Store } from '../../../types';
import { LinkedArchiveTreeSection } from '../../types';
import { setSelectedSection } from '../actions';
import EmptyScreen, { EmptyScreenStatus } from './EmptyScreen';

describe('EmptyScreen for practice questions', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;

  beforeEach(() => {
    store = createTestStore();
    dispatch = jest.spyOn(store, 'dispatch');
  });

  it('renders properly and dispatches action on click', () => {
    const mockSection = { title: 'some title' } as LinkedArchiveTreeSection;

    const component = renderer.create(<TestContainer store={store}>
      <EmptyScreen nextSection={mockSection} />
    </TestContainer>);

    const button = component.root.findByType(Button);

    renderer.act(() => {
      button.props.onClick();
    });

    expect(dispatch).toHaveBeenCalledWith(setSelectedSection(mockSection));
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('EmptyScreenStatus renders status message without next section button', () => {
    const component = renderer.create(<TestContainer store={store}>
      <EmptyScreenStatus />
    </TestContainer>);

    expect(() => component.root.findByType(Button)).toThrow();
    expect(component.toJSON()).toMatchSnapshot();
  });
});
