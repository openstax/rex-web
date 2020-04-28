import Highlighter, { Highlight, SerializedHighlight } from '@openstax/highlighter';
import Sentry from '../../../../helpers/Sentry';

const attachHighlight = (
  highlight: Highlight | SerializedHighlight,
  highlighter: Highlighter
) => {
  console.log(highlight.id)
  highlighter.highlight(highlight);
  const result = highlighter.getHighlight(highlight.id);
  if (!result || !result.isAttached()) {
    Sentry.error(`Highlight with id: ${highlight.id} has not been attached.`);
  }
  console.log('result', result)
  return result;
};

export default attachHighlight;
