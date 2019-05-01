import React, {ComponentClass} from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { renderToDom } from '../../../test/reactutils';
import renderer from 'react-test-renderer';
import NavBar, {Dropdown} from '.';
import {Store} from '../../types';
import {assertWindowDefined} from '../../utils';
import createTestStore from '../../../test/createTestStore';
import { receiveLoggedOut, receiveUser } from '../../auth/actions';
import MessageProvider from '../../MessageProvider';

describe('content', () => {
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
  });

  const render = () => <Provider store={store}>
    <MessageProvider>
      <NavBar />
    </MessageProvider>
  </Provider>;

  it('matches snapshot for null state', () => {
    const component = renderer.create(render());

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot for logged in', () => {

    store.dispatch(receiveUser({firstName: 'test'}));

    const component = renderer.create(render());

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot for logged out', () => {

    store.dispatch(receiveLoggedOut());

    const component = renderer.create(render());

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  describe('manages scroll based on ovelay', () => {
    let window: Window;
    let getComputedStyle: jest.SpyInstance;
    let getComputedStyleBack: Window['getComputedStyle'];

    beforeEach(() => {
      store.dispatch(receiveUser({firstName: 'test'}));
      window = assertWindowDefined();
      getComputedStyleBack = window.getComputedStyle;
      getComputedStyle = window.getComputedStyle = jest.fn();
    });

    afterEach(() => {
      window.getComputedStyle = getComputedStyleBack;
    });

    it('blocks scroll when shown', () => {
      const {tree} = renderToDom(render());
      const overlayComponent = ReactTestUtils.findRenderedComponentWithType(
        tree,
        Dropdown as unknown as ComponentClass // ReactTestUtils types seem broken
      );
      const overlay = ReactDOM.findDOMNode(overlayComponent)

      getComputedStyle.mockReturnValue({height: '10px'});

      const event = window.document.createEvent('UIEvents');
      event.initEvent('scroll', true, false);
      const preventDefault = jest.spyOn(event, 'preventDefault');

      window.document.dispatchEvent(event);

      expect(getComputedStyle).toHaveBeenCalledWith(overlay);
      expect(preventDefault).toHaveBeenCalled();
    });

    it('allows scroll when hidden', () => {
      const {tree} = renderToDom(render());
      const overlayComponent = ReactTestUtils.findRenderedComponentWithType(
        tree,
        Dropdown as unknown as ComponentClass // ReactTestUtils types seem broken
      );
      const overlay = ReactDOM.findDOMNode(overlayComponent)

      getComputedStyle.mockReturnValue({height: '0px'});

      const event = window.document.createEvent('UIEvents');
      event.initEvent('scroll', true, false);
      const preventDefault = jest.spyOn(event, 'preventDefault');

      window.document.dispatchEvent(event);

      expect(getComputedStyle).toHaveBeenCalledWith(overlay);
      expect(preventDefault).not.toHaveBeenCalled();
    });
  });
});
