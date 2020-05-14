import Highlighter, { Highlight, SerializedHighlight } from '@openstax/highlighter';
import Sentry from '../../../../helpers/Sentry';

const attachHighlight = (
  highlight: Highlight | SerializedHighlight,
  highlighter: Highlighter
) => {
  highlighter.highlight(highlight);
  const result = highlighter.getHighlight(highlight.id);
  if (!result || !result.isAttached()) {
    Sentry.captureException(`Highlight with id: ${highlight.id} has not been attached.`);
  }
  return result;
};

export default attachHighlight;
