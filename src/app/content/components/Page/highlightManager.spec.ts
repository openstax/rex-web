import UntypedHighlighter, {
  SerializedHighlight as UntypedSerializedHighlight
} from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';
import { page } from '../../../../test/mocks/archiveLoader';
import { assertWindow } from '../../../utils';
import { highlightStyles } from '../../highlights/constants';
import highlightManager from './highlightManager';
import { HighlightProp, stubHighlightManager } from './highlightManager';

jest.mock('@openstax/highlighter');

UntypedHighlighter.prototype.eraseAll = jest.fn();

// tslint:disable-next-line:variable-name
const Highlighter = UntypedHighlighter as unknown as jest.SpyInstance;
// tslint:disable-next-line:variable-name
const SerializedHighlight = UntypedSerializedHighlight as unknown as jest.SpyInstance;

beforeEach(() => {
  jest.resetAllMocks();
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
      create: jest.fn(),
      enabled: true,
      highlights: [],
      page,
      remove: jest.fn(),
      update: jest.fn(),
    };
  });

  const createMockHighlight = () => ({
    getStyle: jest.fn(),
    id: Math.random().toString(36).substring(7),
    serialize: () => ({data: 'data'}),
    setStyle: jest.fn(),
  });

  afterEach(() => {
    delete window.document.getSelection;
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
    const mockHighlightData = {id: 'asdf'} as unknown as UntypedSerializedHighlight['data'];
    const {update} = highlightManager(element, () => prop);

    prop.highlights = [
      mockHighlightData,
    ];

    const highlight = Highlighter.mock.instances[0].highlight = jest.fn();

    update();

    expect(SerializedHighlight).toHaveBeenCalledTimes(1);
    expect(SerializedHighlight).toHaveBeenCalledWith(mockHighlightData);
    expect(highlight).toHaveBeenCalled();
    expect(highlight.mock.calls[0][0]).toBe(SerializedHighlight.mock.instances[0]);
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
      const highlight = Highlighter.mock.instances[0].highlight = jest.fn();
      const mockHighlight = createMockHighlight();

      Highlighter.mock.calls[0][1].onSelect([], mockHighlight);
      expect(highlight).toBeCalledWith(mockHighlight);
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

    it('changes color on click', () => {
      const firstStyle = highlightStyles[0].label;
      const secondStyle = highlightStyles[1].label;
      const mockHighlight = createMockHighlight();

      mockHighlight.getStyle.mockReturnValue(firstStyle);

      Highlighter.mock.calls[0][1].onClick(mockHighlight);
      expect(mockHighlight.setStyle).toHaveBeenCalledWith(secondStyle);
    });

    it('erases highlights after all colors', () => {
      const lastStyle = highlightStyles[highlightStyles.length - 1].label;
      const erase = Highlighter.mock.instances[0].erase = jest.fn();
      const mockHighlight = createMockHighlight();
      mockHighlight.getStyle.mockReturnValue(lastStyle);
      Highlighter.mock.calls[0][1].onClick(mockHighlight);
      expect(erase).toHaveBeenCalledWith(mockHighlight);
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
