import Highlighter, { Highlight, SerializedHighlight } from '@openstax/highlighter';
import Sentry from '../../../../helpers/Sentry';

const attachHighlight = (
  highlight: Highlight | SerializedHighlight,
  highlighter: Highlighter
) => {
  highlighter.highlight(highlight);
  const hl = highlight instanceof SerializedHighlight
    ? highlighter.getHighlight(highlight.id)
    : highlight;
  if (!hl || !hl.isAttached()) {
    Sentry.captureException(`Highlight with id: ${highlight.id} has not been attached.`);
  }
};

export default attachHighlight;
