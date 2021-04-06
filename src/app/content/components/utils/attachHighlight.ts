import Highlighter, { Highlight, SerializedHighlight } from '@openstax/highlighter';
import Sentry, { Severity } from '../../../../helpers/Sentry';

const attachHighlight = <T extends Highlight | SerializedHighlight>(
  highlight: T,
  highlighter: Highlighter,
  errorMsg?: (highlight: T) => string
) => {
  highlighter.highlight(highlight);
  const result = highlighter.getHighlight(highlight.id);
  if (!result || !result.isAttached()) {
    Sentry.captureException(
      new Error(errorMsg
        ?  errorMsg(highlight)
        : `Highlight with id: ${highlight.id} has not been attached.`),
      Severity.Warning
    );
    return;
  }
  return result;
};

export default attachHighlight;
