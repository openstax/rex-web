import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import Button from '../../../components/Button';
import * as Services from '../../../context/Services';
import MessageProvider from '../../../MessageProvider';
import { Store } from '../../../types';
import { nextQuestion, setQuestions } from '../actions';
import { PracticeQuestions } from '../types';
import IntroScreen from './IntroScreen';

describe('IntroScreen for practice questions', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let services: ReturnType<typeof createTestServices>;
  let render: () => JSX.Element;

  beforeEach(() => {
    store = createTestStore();
    dispatch = jest.spyOn(store, 'dispatch');
    services = createTestServices();
    render = () => <Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <IntroScreen />
        </MessageProvider>
      </Services.Provider>
    </Provider>;
  });

  it('renders properly for 1 question', () => {
    store.dispatch(setQuestions([{}, {}] as PracticeQuestions));
    const component = renderer.create(render());
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders properly for 2 questions', () => {
    store.dispatch(setQuestions([{}, {}] as PracticeQuestions));
    const component = renderer.create(render());
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('dispatch action onClick', () => {
    const component = renderer.create(render());

    const button = component.root.findByType(Button);

    renderer.act(() => {
      button.props.onClick();
    });

    expect(dispatch).toHaveBeenCalledWith(nextQuestion());
  });
});
