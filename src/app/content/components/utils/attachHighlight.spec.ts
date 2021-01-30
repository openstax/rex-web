import Highlighter, { Highlight, SerializedHighlight } from '@openstax/highlighter';
import Sentry from '../../../../helpers/Sentry';
import createMockHighlight from '../../../../test/mocks/highlight';
import attachHighlight from './attachHighlight';

jest.mock('../../../../helpers/Sentry', () => ({
  ...(jest as any).requireActual('../../../../helpers/Sentry'),
  captureException: jest.fn(),
}));

describe('attachHighlight', () => {
  // tslint:disable-next-line: variable-name
  let HighlighterMock: Highlighter;

  beforeEach(() => {
    jest.resetAllMocks();

    HighlighterMock = {
      getHighlight: () => ({
        isAttached: () => true,
      }),
      highlight: jest.fn(),
    } as unknown as Highlighter;
  });

  it('attaches highlight', () => {
    const mockHighlight = {
      ...createMockHighlight(),
      isAttached: () => true,
    } as unknown as Highlight;

    HighlighterMock.getHighlight = () => mockHighlight;

    attachHighlight(mockHighlight, HighlighterMock);

    expect(HighlighterMock.highlight).toHaveBeenCalledWith(mockHighlight);
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it('attaches serialized highlight', () => {
    const mockHighlight = {
      ...createMockHighlight(),
      isAttached: () => true,
    } as unknown as Highlight;
    const mockSerializedHighlight = new SerializedHighlight({
      ...mockHighlight,
      type: 'TextPositionSelector',
    } as any);

    HighlighterMock.getHighlight = () => mockHighlight;

    attachHighlight(
      mockSerializedHighlight,
      HighlighterMock
    );

    expect(HighlighterMock.highlight).toHaveBeenCalledWith(mockSerializedHighlight);
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  describe('errors', () => {
    let mockHighlight: Highlight;

    beforeEach(() => {
      mockHighlight = {
        ...createMockHighlight(),
        isAttached: () => false,
      } as unknown as Highlight;

      HighlighterMock.getHighlight = () => mockHighlight;
    });

    it('call Sentry if highlight was not attached', () => {
      attachHighlight(mockHighlight, HighlighterMock);

      expect(HighlighterMock.highlight).toHaveBeenCalledWith(mockHighlight);
      expect(Sentry.captureException)
        .toHaveBeenCalledWith(new Error(`Highlight with id: ${mockHighlight.id} has not been attached.`), 'warning');
    });

    it('accepts custom error messages', () => {
      attachHighlight(mockHighlight, HighlighterMock, (failedHighlight) =>
        `${failedHighlight.id} doesn't matter`
      );

      expect(Sentry.captureException)
        .toHaveBeenCalledWith(new Error(`${mockHighlight.id} doesn't matter`), 'warning');
    });
  });
});
