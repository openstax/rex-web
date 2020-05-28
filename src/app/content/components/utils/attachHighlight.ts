import Highlighter, { Highlight, SerializedHighlight } from '@openstax/highlighter';
import Sentry from '../../../../helpers/Sentry';

const attachHighlight = <T extends Highlight | SerializedHighlight>(
  highlight: T,
  highlighter: Highlighter,
  onHighlightFailure?: (highlight: T) => void
) => {
  try {
    highlighter.highlight(highlight);
    const result = highlighter.getHighlight(highlight.id);
    if (result && result.isAttached()) {
      return result;
    }
    if (onHighlightFailure) {
      onHighlightFailure(highlight);
    } else {
      throw new Error(`Highlight with id: ${highlight.id} has not been attached.`);
    }
  } catch (e) {
    Sentry.captureException(e);
  }
};

export default attachHighlight;
