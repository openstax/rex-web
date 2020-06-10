import { Highlights } from '@openstax/highlighter/dist/api';
import { assertDefined } from '../../../utils';

const extractDataFromHighlightClientResponse = (highlightsResponse: Highlights) => {
  // TODO - change swagger so none of this is nullable
  const data = assertDefined(highlightsResponse.data, 'response from highlights api is invalid');
  const meta = assertDefined(highlightsResponse.meta, 'response from highlights api is invalid');
  const page = assertDefined(meta.page, 'response from highlights api is invalid');
  const perPage = assertDefined(meta.perPage, 'response from highlights api is invalid');
  const totalCount = assertDefined(meta.totalCount, 'response from highlights api is invalid');

  return {
    data,
    meta,
    page,
    perPage,
    totalCount,
  };
};

export default extractDataFromHighlightClientResponse;
