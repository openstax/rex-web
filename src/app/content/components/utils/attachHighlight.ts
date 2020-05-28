import Highlighter, { Highlight, SerializedHighlight } from '@openstax/highlighter';
import Sentry from '../../../../helpers/Sentry';

const attachHighlight = <T extends Highlight | SerializedHighlight>(
  highlight: T,
  highlighter: Highlighter,
  errorMsg?: (highlight: T) => string
) => {
  try {
    highlighter.highlight(highlight);
    const result = highlighter.getHighlight(highlight.id);
    if (!result || !result.isAttached()) {
      throw new Error(`Highlight with id: ${highlight.id} has not been attached.`);
    }
    return result;
  } catch (e) {
    const error = errorMsg ? new Error(errorMsg(highlight)) : e;
    Sentry.captureException(error);
  }
};

export default attachHighlight;
