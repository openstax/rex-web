import UntypedHighlighter, {
  SerializedHighlight as UntypedSerializedHighlight,
} from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';
import defer from 'lodash/fp/defer';
import keyBy from 'lodash/fp/keyBy';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import { page } from '../../../../test/mocks/archiveLoader';
import createMockHighlight from '../../../../test/mocks/highlight';
import { Store } from '../../../types';
import { assertWindow } from '../../../utils';
import Card from '../../highlights/components/Card';
import CardWrapper from '../../highlights/components/CardWrapper';
import { HighlightData } from '../../highlights/types';
import highlightManager from './highlightManager';
import { HighlightProp, stubHighlightManager } from './highlightManager';

jest.mock('@openstax/highlighter');

jest.mock('../../highlights/components/utils/showConfirmation', () => () => new Promise((resolve) => resolve(false)));
jest.mock('../../highlights/components/Card', () => (props: any) => <div mock-card {...props} />);

UntypedHighlighter.prototype.eraseAll = jest.fn();
UntypedHighlighter.prototype.erase = jest.fn();
UntypedHighlighter.prototype.highlight = jest.fn();

// tslint:disable-next-line:variable-name
const Highlighter = UntypedHighlighter as unknown as jest.SpyInstance;
const fromApiResponse = UntypedSerializedHighlight.fromApiResponse = jest.fn();

beforeEach(() => {
  jest.resetAllMocks();

  UntypedHighlighter.prototype.getHighlights = jest.fn(() => []);
  UntypedHighlighter.prototype.getOrderedHighlights = jest.fn(() => []);
});

describe('highlightManager', () => {
  let window: Window;
  let element: HTMLElement;
  let prop: HighlightProp;
  let store: Store;

  beforeEach(() => {
    window = assertWindow();
    element = window.document.createElement('div');
    prop = {
      clearFocus: jest.fn(),
      focus: jest.fn(),
      focused: undefined,
      hasUnsavedHighlight: false,
      highlights: [],
      page,
    };
    store = createTestStore();
  });

  afterEach(() => {
    delete window.document.getSelection;
  });

  it('CardList is rendered initially', () => {
    const {CardList} = highlightManager(element, () => prop);
    const component = renderer.create(<Provider store={store}>
      <CardList/>
    </Provider>);
    // findByType method does not work with memo components (ex. styled components)
    // https://github.com/facebook/react/issues/17301
    expect(() => component.root.findByType(CardWrapper.type)).not.toThrow();
  });

  it('CardList is rendered after update', () => {
    const {CardList, update} = highlightManager(element, () => prop);
    update();
    const component = renderer.create(<Provider store={store}>
      <CardList/>
    </Provider>);
    // findByType method does not work with memo components (ex. styled components)
    // https://github.com/facebook/react/issues/17301
    expect(() => component.root.findByType(CardWrapper.type)).not.toThrow();
  });

  it('CardList doesn\'t double render the pending highlight', async() => {
    const mockHighlight = {
      ...createMockHighlight(),
      isAttached: () => true,
    };
    const mockHighlightData = {id: mockHighlight.id} as HighlightData;
    const {CardList, update} = highlightManager(element, () => prop);
    const component = renderer.create(<Provider store={store}>
      <CardList/>
    </Provider>);

    renderer.act(() => {
      update();
    });

    expect(component.root.findAllByType(Card).length).toEqual(0);

    await renderer.act(() => {
      Highlighter.mock.calls[0][1].onSelect([], mockHighlight);
      return new Promise((resolve) => defer(resolve));
    });

    expect(component.root.findAllByType(Card).length).toEqual(1);

    prop.highlights = [
      mockHighlightData,
    ];
    Highlighter.mock.instances[0].getHighlight
      .mockReturnValueOnce(undefined)
      .mockReturnValue(mockHighlight);
    Highlighter.mock.instances[0].getOrderedHighlights.mockReturnValue([mockHighlight]);

    renderer.act(() => {
      update();
    });

    expect(component.root.findAllByType(Card).length).toEqual(1);
  });

  it('creates highlighter', () => {
    highlightManager(element, () => prop);
    expect(Highlighter).toHaveBeenCalled();
  });

  it('highlights highlights', () => {
    const mockHighlight = {
      ...createMockHighlight(),
      isAttached: () => true,
    };
    const mockHighlightData = {id: mockHighlight.id} as HighlightData;
    const {update} = highlightManager(element, () => prop);

    prop.highlights = [
      mockHighlightData,
    ];

    const highlight = Highlighter.mock.instances[0].highlight;

    Highlighter.mock.instances[0].getHighlight
      .mockReturnValueOnce(mockHighlight)
      .mockReturnValueOnce(undefined)
      .mockReturnValue(mockHighlight)
    ;

    fromApiResponse.mockReturnValue(mockHighlight);

    update();

    expect(fromApiResponse).toHaveBeenCalledTimes(1);
    expect(fromApiResponse).toHaveBeenCalledWith(mockHighlightData);
    expect(highlight).toHaveBeenCalled();
    expect(highlight.mock.calls[0][0]).toBe(mockHighlight);
  });

  it('erases highlights', () => {
    const mockHighlight1 = createMockHighlight();
    const mockHighlight2 = createMockHighlight();
    const {update} = highlightManager(element, () => prop);

    prop.highlights = [
      {id: mockHighlight1.id} as HighlightData,
    ];

    const erase = Highlighter.mock.instances[0].erase;

    Highlighter.mock.instances[0].getHighlight.mockImplementation(
      (id: string) => keyBy('id', [mockHighlight1, mockHighlight2])[id]
    );
    Highlighter.mock.instances[0].getHighlights.mockReturnValue([mockHighlight1, mockHighlight2]);

    fromApiResponse
      .mockReturnValueOnce(mockHighlight1)
      .mockReturnValueOnce(mockHighlight2)
    ;

    update();

    expect(erase).toHaveBeenCalledTimes(1);
    expect(erase).toHaveBeenCalledWith(mockHighlight2);
  });

  it('focuses highlights', () => {
    const mockHighlights = [
      createMockHighlight(),
      createMockHighlight(),
    ];
    const {update} = highlightManager(element, () => prop);

    prop.focused = mockHighlights[0].id;
    prop.highlights = mockHighlights.map(({id}) => ({id} as HighlightData));

    const focus = jest.spyOn(mockHighlights[0], 'focus');

    Highlighter.mock.instances[0].getHighlights.mockReturnValue(mockHighlights);
    Highlighter.mock.instances[0].getHighlight.mockImplementation((id: string) => keyBy('id', mockHighlights)[id]);

    update();

    expect(focus).toHaveBeenCalledTimes(1);
    expect(focus).toHaveBeenCalledWith();
  });

  it('umounts', () => {
    const manager = highlightManager(element, () => prop);

    const unmount = Highlighter.mock.instances[0].unmount = jest.fn();

    manager.unmount();

    expect(unmount).toHaveBeenCalled();
  });

  describe('onSelect', () => {
    let manager: ReturnType<typeof highlightManager>;

    beforeEach(() => {
      manager = highlightManager(element, () => prop);
    });

    afterEach(() => {
      manager.unmount();
    });

    describe('without unsaved changes', () => {
      it('noops when there are highlights in the selection', () => {
        const highlight = Highlighter.mock.instances[0].highlight = jest.fn();

        Highlighter.mock.calls[0][1].onSelect([{}], {});
        expect(highlight).not.toBeCalled();
      });

      it('shows create card when there aren\'t any highlights in selection', async() => {
        const mockHighlight = createMockHighlight();
        manager.update();
        const component = renderer.create(<Provider store={store}>
          <manager.CardList/>
        </Provider>);

        expect(component.root.findAllByType(Card).length).toEqual(0);

        await renderer.act(() => {
          Highlighter.mock.calls[0][1].onSelect([], mockHighlight);
          return new Promise((resolve) => defer(resolve));
        });

        expect(component.root.findAllByType(Card).length).toEqual(1);
      });

      it('clears pending highlight when it is removed from state', async() => {
        const mockHighlight = createMockHighlight();
        const existingHighlight = {
          ...createMockHighlight(),
          isAttached: () => true,
        };
        prop.highlights = [{id: existingHighlight.id} as HighlightData];

        const component = renderer.create(<Provider store={store}>
          <manager.CardList/>
        </Provider>);

        Highlighter.mock.instances[0].getHighlight
          .mockReturnValueOnce(existingHighlight)
          .mockReturnValueOnce()
          .mockReturnValueOnce(existingHighlight)
        ;

        Highlighter.mock.instances[0].getOrderedHighlights
          .mockReturnValueOnce([existingHighlight]);

        fromApiResponse.mockReturnValue(existingHighlight);

        renderer.act(() => {
          manager.update();
        });

        expect(component.root.findAllByType(Card).length).toEqual(1);

        await renderer.act(() => {
          Highlighter.mock.calls[0][1].onSelect([], mockHighlight);
          return new Promise((resolve) => defer(resolve));
        });
        prop.focused = mockHighlight.id;

        expect(component.root.findAllByType(Card).length).toEqual(2);

        Highlighter.mock.instances[0].getHighlight
          .mockReturnValueOnce(existingHighlight)
          .mockReturnValueOnce(mockHighlight)
          .mockReturnValueOnce(mockHighlight);

        Highlighter.mock.instances[0].getHighlights.mockReturnValue([existingHighlight, mockHighlight]);

        Highlighter.mock.instances[0].getOrderedHighlights
          .mockReturnValueOnce([existingHighlight]);

        renderer.act(() => {
          manager.update();
        });

        expect(component.root.findAllByType(Card).length).toEqual(1);
      });

      it('clears pending highlight when it is removed from state before element is mounted', async() => {
        const mockHighlight = createMockHighlight();
        manager.update();

        await renderer.act(() => {
          Highlighter.mock.calls[0][1].onSelect([], mockHighlight);
          return new Promise((resolve) => defer(resolve));
        });

        Highlighter.mock.instances[0].getHighlights.mockReturnValue([mockHighlight]);
        renderer.act(() => {
          manager.update();
        });

        const component = renderer.create(<Provider store={store}>
          <manager.CardList/>
        </Provider>);
        expect(component.root.findAllByType(Card).length).toEqual(0);
      });

      it('loads pending highlight when selected before component mount', async() => {
        const mockHighlight = createMockHighlight();
        manager.update();

        Highlighter.mock.calls[0][1].onSelect([], mockHighlight);

        await new Promise((resolve) => defer(resolve));

        const component = renderer.create(<Provider store={store}>
          <manager.CardList/>
        </Provider>);

        await new Promise((resolve) => defer(resolve));

        expect(component.root.findAllByType(Card).length).toEqual(1);
      });
    });

    describe('with unsaved changes', () => {
      const removeAllRanges = jest.fn();
      beforeEach(() => {
        window.getSelection = jest.fn(() => ({
          removeAllRanges,
        })) as any;

        prop.focused = 'random id';
        prop.hasUnsavedHighlight = true;
        manager.update();
      });

      it('noops if user decides not to discard changes', async() => {
        const highlight = Highlighter.mock.instances[0].highlight = jest.fn();

        await renderer.act(() => {
          Highlighter.mock.calls[0][1].onSelect([], {});
          return new Promise((resolve) => defer(resolve));
        });

        expect(highlight).not.toHaveBeenCalled();
        expect(removeAllRanges).toHaveBeenCalled();
      });
    });
  });

  describe('onClick', () => {
    let manager: ReturnType<typeof highlightManager>;

    beforeEach(() => {
      manager = highlightManager(element, () => prop);
    });

    afterEach(() => {
      manager.unmount();
    });

    it('noops without highlight', async() => {
      Highlighter.mock.calls[0][1].onClick();
      await new Promise((resolve) => defer(resolve));
      expect(prop.focus).not.toHaveBeenCalled();
    });

    it('noops if user decides not to discard changes', async() => {
      prop.focused = 'random id';
      prop.hasUnsavedHighlight = true;

      manager.update();

      Highlighter.mock.calls[0][1].onClick({});
      await new Promise((resolve) => defer(resolve));
      expect(prop.focus).not.toHaveBeenCalled();
    });

    it('focuses on click', async() => {
      const mockHighlight = createMockHighlight();

      Highlighter.mock.calls[0][1].onClick(mockHighlight);

      await new Promise((resolve) => defer(resolve));

      expect(prop.focus).toHaveBeenCalledWith(mockHighlight.id);
    });

    it('noops when you click on not a highlight', () => {
      Highlighter.mock.calls[0][1].onClick();
      expect(prop.focus).not.toHaveBeenCalled();
    });
  });
});

describe('stubHighlightManager', () => {
  it('umounts', () => {
    expect(stubHighlightManager.unmount).not.toThrow();
  });
});
