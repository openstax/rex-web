import Highlighter, { Highlight, SerializedHighlight } from '@openstax/highlighter';
import Sentry, { Severity } from '../../../../helpers/Sentry';

const attachHighlight = <T extends Highlight | SerializedHighlight>(
  highlight: T,
  highlighter: Highlighter,
  errorMsg?: (highlight: T) => string
): Highlight | undefined => {
  let attachedHighlight: Highlight | undefined;

  try {
    highlighter.highlight(highlight);
    attachedHighlight = highlighter.getHighlight(highlight.id);
  } catch (e) {
    Sentry.captureException(e);
  }

  if (!attachedHighlight || !attachedHighlight.isAttached()) {
    Sentry.captureException(
      new Error(errorMsg ?  errorMsg(highlight) : `Highlight with id: ${highlight.id} has not been attached.`),
      Severity.Warning
    );
    attachedHighlight = undefined;
  }

  return attachedHighlight;
};

export default attachHighlight;
