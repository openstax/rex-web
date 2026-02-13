import React from 'react';
import { onEscCallbacks } from '../../../reactUtils';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import MessageProvider from '../../../../test/MessageProvider';
import { makeFindByTestId } from '../../../../test/reactutils';
import * as Services from '../../../context/Services';
import en from '../../../messages/en/index';
import { MiddlewareAPI, Store } from '../../../types';
import Confirmation from './Confirmation';

// this is a hack because useEffect is currently not called
// when using jsdom? https://github.com/facebook/react/issues/14050
// seems to work better in react-test-renderer but
// i need the ref here
jest.mock('react', () => {
  const react = (jest as any).requireActual('react');
  return { ...react, useEffect: react.useLayoutEffect };
});

// Add translations for testing
const messages = {
  ...en,
  confirm: 'confirm',
  message: 'message',
};

describe('Confirmation', () => {
  let store: Store;
  let services: ReturnType<typeof createTestServices> & MiddlewareAPI;

  function Component({
    onCancel = () => null,
    ...otherProps
  }) {
    return (
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider locale='en' messages={messages}>
            <Confirmation
              message='message'
              confirmMessage='confirm'
              onCancel={onCancel}
              {...otherProps}
            />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );
  }

  beforeEach(() => {
    store = createTestStore();
    services = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };
  });

  it('matches snapshot no selection', () => {
    const component = renderer.create(
      <Component data-analytics-region='region' onConfirm={() => null} />
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });


  it('prevents default when clicking confirm button', () => {
    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider locale='en' messages={messages}>
          <Confirmation
            message='message'
            confirmMessage='confirm'
            onCancel={() => null}
            drawFocus={false}
          />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    const findByTestId = makeFindByTestId(component.root);
    const button = findByTestId('confirm');

    const preventDefault = jest.fn();
    button.props.onClick({ preventDefault });

    expect(preventDefault).toHaveBeenCalled();
  });

  it('prevents default when clicking cancel button', () => {
    const component = renderer.create(
      <Component />
    );

    const findByTestId = makeFindByTestId(component.root);
    const button = findByTestId('cancel');

    const preventDefault = jest.fn();
    button.props.onClick({ preventDefault });

    expect(preventDefault).toHaveBeenCalled();
  });

  it('doesn\'t prevent default when clicking confirm link', () => {
    const component = renderer.create(
      <Component confirmLink='/asdf' />
    );

    const findByTestId = makeFindByTestId(component.root);
    const button = findByTestId('confirm');

    const preventDefault = jest.fn();
    button.props.onClick({ preventDefault });

    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('calls onConfirm', () => {
    const onConfirm = jest.fn();
    const component = renderer.create(
      <Component onConfirm={onConfirm} />
    );

    const findByTestId = makeFindByTestId(component.root);
    const button = findByTestId('confirm');
    button.props.onClick({ preventDefault: jest.fn() });

    expect(onConfirm).toHaveBeenCalled();
  });

  it('calls onCancel', () => {
    const onCancel = jest.fn();
    const component = renderer.create(
      <Component onCancel={onCancel} />
    );

    const findByTestId = makeFindByTestId(component.root);
    const button = findByTestId('cancel');
    button.props.onClick({ preventDefault: jest.fn() });

    expect(onCancel).toHaveBeenCalled();
  });

  it('calls always', () => {
    const always = jest.fn();
    const component = renderer.create(
      <Component always={always} />
    );

    const findByTestId = makeFindByTestId(component.root);
    const preventDefault = jest.fn();
    findByTestId('confirm').props.onClick({ preventDefault });
    findByTestId('cancel').props.onClick({ preventDefault });

    expect(always).toHaveBeenCalledTimes(2);
  });

  it('works without optional props and drawFocus={true}', () => {
    const onCancel = jest.fn();
    const component = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider locale='en' messages={messages}>
            <Confirmation
              message='message'
              confirmMessage='confirm'
              onCancel={onCancel}
            />
          </MessageProvider>
        </Services.Provider>
      </Provider>
    );

    const findByTestId = makeFindByTestId(component.root);

    // Call handlers without optional callbacks
    const preventDefault = jest.fn();
    findByTestId('confirm').props.onClick({ preventDefault });
    findByTestId('cancel').props.onClick({ preventDefault });

    expect(onCancel).toHaveBeenCalled();
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders with data-analytics-label and ref', () => {
    const ref = React.createRef<HTMLElement>();
    const component = renderer.create(
      <Component data-analytics-label='custom-label' ref={ref} />
    );

    const findByTestId = makeFindByTestId(component.root);
    const button = findByTestId('confirm');

    expect(button.props['data-analytics-label']).toBe('custom-label');
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('calls onCancel when ESC is pressed', () => {
    const onCancel = jest.fn();
    renderer.create(
      <Component onCancel={onCancel} />
    );

    const callback = onEscCallbacks[onEscCallbacks.length - 1];
    callback();

    expect(onCancel).toHaveBeenCalled();
  });
});
