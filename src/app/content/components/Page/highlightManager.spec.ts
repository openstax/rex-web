import UntypedHighlighter, {
  SerializedHighlight as UntypedSerializedHighlight
} from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import renderer from 'react-test-renderer';
import { page } from '../../../../test/mocks/archiveLoader';
import createMockHighlight from '../../../../test/mocks/highlight';
import { assertWindow } from '../../../utils';
import CardWrapper from '../../highlights/components/CardWrapper';
import highlightManager from './highlightManager';
import { HighlightProp, stubHighlightManager } from './highlightManager';

jest.mock('@openstax/highlighter');

UntypedHighlighter.prototype.eraseAll = jest.fn();
UntypedHighlighter.prototype.erase = jest.fn();
UntypedHighlighter.prototype.highlight = jest.fn();

// tslint:disable-next-line:variable-name
const Highlighter = UntypedHighlighter as unknown as jest.SpyInstance;
// tslint:disable-next-line:variable-name
const SerializedHighlight = UntypedSerializedHighlight as unknown as jest.SpyInstance;

beforeEach(() => {
  jest.resetAllMocks();

  UntypedHighlighter.prototype.getHighlights = jest.fn(() => []);
  UntypedHighlighter.prototype.getOrderedHighlights = jest.fn(() => []);
});

describe('highlightManager', () => {
  let window: Window;
  let element: HTMLElement;
  let getSelection: jest.SpyInstance;
  let prop: HighlightProp;

  beforeEach(() => {
    window = assertWindow();
    getSelection = window.document.getSelection = jest.fn();
    element = window.document.createElement('div');
    prop = {
      clearFocus: jest.fn(),
      create: jest.fn(),
      enabled: true,
      focus: jest.fn(),
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

    expect(SerializedHighlight).toHaveBeenCalledTimes(1);
    expect(SerializedHighlight).toHaveBeenCalledWith(mockHighlightData);
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

    it('highlights when there aren\'t any highlights in selection', () => {
      const mockHighlight = createMockHighlight();

      Highlighter.mock.calls[0][1].onSelect([], mockHighlight);
      expect(prop.create).toHaveBeenCalledWith(mockHighlight.serialize().data);
    });

    it('removes browser selection if there is one', () => {
      const mockSelection = {removeAllRanges: jest.fn()};

      getSelection.mockReturnValue(mockSelection);

      Highlighter.mock.calls[0][1].onSelect([], createMockHighlight());
      expect(mockSelection.removeAllRanges).toBeCalled();
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

    it('focuses on click', () => {
      const mockHighlight = createMockHighlight();

      Highlighter.mock.calls[0][1].onClick(mockHighlight);
      expect(mockHighlight.focus).toHaveBeenCalled();
    });

    it('noops when you click on not a highlight', () => {
      const erase = Highlighter.mock.instances[0].erase = jest.fn();
      Highlighter.mock.calls[0][1].onClick();
      expect(erase).not.toHaveBeenCalled();
    });
  });
});

describe('stubHighlightManager', () => {
  it('umounts', () => {
    expect(stubHighlightManager.unmount).not.toThrow();
  });
});
