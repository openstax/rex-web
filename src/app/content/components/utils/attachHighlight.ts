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
      throw new Error(errorMsg
        ?  errorMsg(highlight)
        : `Highlight with id: ${highlight.id} has not been attached.`);
    }
    return result;
  } catch (e) {
    Sentry.captureException(e);
  }
};

export default attachHighlight;
