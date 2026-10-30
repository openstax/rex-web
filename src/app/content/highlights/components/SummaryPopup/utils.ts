import { Highlight } from '@openstax/highlighter/dist/api';
import queryString from 'querystring';
import React from 'react';
import { useSelector } from 'react-redux';
import { params, systemQueryParameters } from '../../../../navigation/selectors';
import { Book } from '../../../types';
import { findArchiveTreeNodeById } from '../../../utils/archiveTreeUtils';
import { getBookPageUrlAndParams, getCurrentPortalParams } from '../../../utils/urlUtils';

export const useCreateHighlightLink = ({ sourceId, id, anchor: elementId }: Highlight, book?: Book) => {
  const [link, setLink] = React.useState('');
  const systemQueryParams = useSelector(systemQueryParameters);
  const navigationParams = useSelector(params);

  React.useEffect(() => {
    const page = book ? findArchiveTreeNodeById(book.tree, sourceId) : undefined;
    const data: Record<string, string> = {
      ...systemQueryParams,
      target: JSON.stringify({ id, type: 'highlight' }),
    };
    const target = queryString.stringify(data) + `#${elementId}`;
    const url = page && book
      ? getBookPageUrlAndParams(book, page, getCurrentPortalParams(navigationParams)).url
      : '';
    setLink(`${url}?${target}`);
  }, [id, book, elementId, sourceId, systemQueryParams, navigationParams]);

  return link;
};
