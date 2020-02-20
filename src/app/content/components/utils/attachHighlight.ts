import Highlighter, { Highlight, SerializedHighlight } from '@openstax/highlighter';
import Sentry from '../../../../helpers/Sentry';

const attachHighlight = (
  highlight: Highlight | SerializedHighlight,
  highlighter: Highlighter
) => {
  if (highlight instanceof SerializedHighlight) {
    attachHighlight(highlight.load(highlighter), highlighter);
  } else {
    highlighter.highlight(highlight);
    if (!highlight.isAttached()) {
      Sentry.captureException(`Highlight with id: ${highlight.id} has not been attached.`);
    }
  }
};

export default attachHighlight;
