import UntypedHighlighter, {
  SerializedHighlight as UntypedSerializedHighlight
} from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';
import defer from 'lodash/fp/defer';
import React from 'react';
import renderer from 'react-test-renderer';
import { page } from '../../../../test/mocks/archiveLoader';
import createMockHighlight from '../../../../test/mocks/highlight';
import { assertWindow } from '../../../utils';
import Card from '../../highlights/components/Card';
import CardWrapper from '../../highlights/components/CardWrapper';
import highlightManager from './highlightManager';
import { HighlightProp, stubHighlightManager } from './highlightManager';

jest.mock('@openstax/highlighter');

jest.mock('../../highlights/components/Card', () => (props: any) => <div mock-card {...props} />);

UntypedHighlighter.prototype.eraseAll = jest.fn();
UntypedHighlighter.prototype.erase = jest.fn();
UntypedHighlighter.prototype.highlight = jest.fn();

// tslint:disable-next-line:variable-name
const Highlighter = UntypedHighlighter as unknown as jest.SpyInstance;
// tslint:disable-next-line:variable-name
const SerializedHighlight = UntypedSerializedHighlight as unknown as jest.SpyInstance;
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

  beforeEach(() => {
    window = assertWindow();
    element = window.document.createElement('div');
    prop = {
      clearFocus: jest.fn(),
      create: jest.fn(),
      enabled: true,
      focus: jest.fn(),
      focused: undefined,
      highlights: [],
      page,
      remove: jest.fn(),
      update: jest.fn(),
    };
  });

  afterEach(() => {
    delete window.document.getSelection;
  });

  it('CardList is rendered initially', () => {
    const {CardList} = highlightManager(element, () => prop);
    const component = renderer.create(React.createElement(CardList));
    expect(() => component.root.findByType(CardWrapper)).not.toThrow();
  });

  it('CardList is not rendered when disabled', () => {
    prop.enabled = false;
    const {CardList} = highlightManager(element, () => prop);
    const component = renderer.create(React.createElement(CardList));
    expect(() => component.root.findByType(CardWrapper)).toThrow();
  });

  it('CardList is rendered after update', () => {
    prop.enabled = false;
    const {CardList, update} = highlightManager(element, () => prop);
    prop.enabled = true;
    update();
    const component = renderer.create(React.createElement(CardList));
    expect(() => component.root.findByType(CardWrapper)).not.toThrow();
  });

  it('CardList doesn\'t double render the pending highlight', async() => {
    const mockHighlight = createMockHighlight();
    const mockHighlightData = mockHighlight.serialize().data;
    prop.enabled = true;
    const {CardList, update} = highlightManager(element, () => prop);
    const component = renderer.create(React.createElement(CardList));

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

  it('creates highlighter when enabled', () => {
    highlightManager(element, () => prop);
    expect(Highlighter).toHaveBeenCalled();
  });

  it('doesn\'t create highlighter when not enabled', () => {
    prop.enabled = false;
    highlightManager(element, () => prop);
    expect(Highlighter).not.toHaveBeenCalled();
  });

  it('creates highlighter when it becomes enabled', () => {
    prop.enabled = false;
    const {update} = highlightManager(element, () => prop);
    expect(Highlighter).not.toHaveBeenCalled();
    prop.enabled = true;
    update();
    expect(Highlighter).toHaveBeenCalled();
  });

  it('highlights highlights', () => {
    const mockHighlight = createMockHighlight();
    const mockHighlightData = mockHighlight.serialize().data;
    const {update} = highlightManager(element, () => prop);

    prop.highlights = [
      mockHighlightData,
    ];

    const highlight = Highlighter.mock.instances[0].highlight;

    Highlighter.mock.instances[0].getHighlight
      .mockReturnValueOnce(undefined)
      .mockReturnValue(mockHighlight);

    update();

    expect(fromApiResponse).toHaveBeenCalledTimes(1);
    expect(fromApiResponse).toHaveBeenCalledWith(mockHighlightData);
    expect(highlight).toHaveBeenCalled();
    expect(highlight.mock.calls[0][0]).toBe(SerializedHighlight.mock.instances[0]);
  });

  it('erases highlights', () => {
    const mockHighlight1 = createMockHighlight();
    const mockHighlight2 = createMockHighlight();
    const {update} = highlightManager(element, () => prop);

    prop.highlights = [
      mockHighlight1.serialize().data,
    ];

    const erase = Highlighter.mock.instances[0].erase;

    Highlighter.mock.instances[0].getHighlights.mockReturnValue([mockHighlight1, mockHighlight2]);

    update();

    expect(erase).toHaveBeenCalledTimes(1);
    expect(erase).toHaveBeenCalledWith(mockHighlight2);
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

    it('noops when there are highlights in the selection', () => {
      const highlight = Highlighter.mock.instances[0].highlight = jest.fn();

      Highlighter.mock.calls[0][1].onSelect([{}], {});
      expect(highlight).not.toBeCalled();
    });

    it('shows create card when there aren\'t any highlights in selection', async() => {
      const mockHighlight = createMockHighlight();
      prop.enabled = true;
      manager.update();
      const component = renderer.create(React.createElement(manager.CardList));

      expect(component.root.findAllByType(Card).length).toEqual(0);

      await renderer.act(() => {
        Highlighter.mock.calls[0][1].onSelect([], mockHighlight);
        return new Promise((resolve) => defer(resolve));
      });

      expect(component.root.findAllByType(Card).length).toEqual(1);
    });

    it('clears pending highlight when it is removed from state', async() => {
      const mockHighlight = createMockHighlight();
      const existingHighlight = createMockHighlight();
      prop.enabled = true;
      prop.highlights = [existingHighlight.serialize().data];

      const component = renderer.create(React.createElement(manager.CardList));

      Highlighter.mock.instances[0].getHighlight
        .mockReturnValueOnce()
        .mockReturnValueOnce(existingHighlight);

      Highlighter.mock.instances[0].getOrderedHighlights
        .mockReturnValueOnce([existingHighlight]);

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
      prop.enabled = true;
      manager.update();

      await renderer.act(() => {
        Highlighter.mock.calls[0][1].onSelect([], mockHighlight);
        return new Promise((resolve) => defer(resolve));
      });

      Highlighter.mock.instances[0].getHighlights.mockReturnValue([mockHighlight]);
      renderer.act(() => {
        manager.update();
      });

      const component = renderer.create(React.createElement(manager.CardList));
      expect(component.root.findAllByType(Card).length).toEqual(0);
    });

    it('loads pending highlight when selected before component mount', async() => {
      const mockHighlight = createMockHighlight();
      prop.enabled = true;
      manager.update();

      Highlighter.mock.calls[0][1].onSelect([], mockHighlight);

      await new Promise((resolve) => defer(resolve));

      const component = renderer.create(React.createElement(manager.CardList));

      expect(component.root.findAllByType(Card).length).toEqual(1);
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
