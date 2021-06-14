import { Highlight } from '@openstax/highlighter/dist/api';
import queryString from 'querystring';
import React from 'react';
import { useSelector } from 'react-redux';
import { systemQueryParameters } from '../../../../navigation/selectors';
import { Book } from '../../../types';
import { findArchiveTreeNodeById } from '../../../utils/archiveTreeUtils';
import { getBookPageUrlAndParams } from '../../../utils/urlUtils';

export const useCreateHighlightLink = ({ sourceId, id, anchor: elementId }: Highlight, book?: Book) => {
  const [link, setLink] = React.useState('');
  const systemQueryParams = useSelector(systemQueryParameters);

  React.useEffect(() => {
    const page = book ? findArchiveTreeNodeById(book.tree, sourceId) : undefined;
    const data: Record<string, string> = {
      ...systemQueryParams,
      target: JSON.stringify({ id, type: 'highlight' }),
    };
    const target = queryString.stringify(data) + `#${elementId}`;
    setLink(`${page && book ? getBookPageUrlAndParams(book, page).url : ''}?${target}`);
  }, [id, book, elementId, sourceId, systemQueryParams]);

  return link;
};
