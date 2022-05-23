import React from 'react';
import { useSelector } from 'react-redux';
import {v4 as uuid } from 'uuid';
import * as selectNavigation from '../../navigation/selectors';
import { assertString } from '../../utils/assertions';
import { assertWindow } from '../../utils/browser-assertions';
import * as selectContent from '../selectors';
import { findArchiveTreeNodeById, findTreePages, getTitleStringFromArchiveNode } from '../utils/archiveTreeUtils';
import { stripIdVersion } from '../utils/idUtils';

export default () => {
  const book = useSelector(selectContent.book);
  const {webhook, redirect} = useSelector(selectNavigation.query);
  const pages = React.useMemo(() => book && findTreePages(book.tree), [book]);
  const [errorMessage, setError] = React.useState<string>();

  if (!book || !pages) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new (FormData as any)(e.target as HTMLFormElement);
    const sections = formData.getAll('section');
    const id = uuid();
    fetch(assertString(webhook, 'webhook should be a string'), {
      body: JSON.stringify({
        config: {sections, page: sections[0], mode: 'assignable'},
        description: 'Read and take notes',
        id,
        integration: {xapi: true, navigation: true},
        iri: `http://openstax.org/activities/readings/${id}`,
        resources: [
          ...sections.map((section: string) => {
            const sectionNode = findArchiveTreeNodeById(book.tree, section)!;

            return {
              label: getTitleStringFromArchiveNode(book, sectionNode),
              orn: `org.openstax.activities.readings.${book.id}:${stripIdVersion(sectionNode.id)}`,
            };
          }),
          // hypothetical additional tags that can be derived from the content somehow
          // indicating the type of content or topics covered in these sections
          {
            label: 'Cool Science Topic 1',
            orn: `org.openstax.content.topics.science.science-topic-1`,
          },
          {
            label: 'Cool Science Topic 2',
            orn: `org.openstax.content.topics.science.science-topic-2`,
          },
        ],
        title: `Read ${sections.length} sections.`,
        type: 'reading', // TODO - its kinda silly to have this here, the api should know already
      }),
      credentials: 'include',
      headers: {
        'content-type': 'application/json',
      },
      method: 'POST',
      mode: 'cors',
    })
      .then((response) => {response.status === 400
        ? response.text().then((error) => setError(error))
        : response.status !== 201
          ? setError('something has gone wrong')
          : assertWindow().location.href = assertString(redirect, 'redirect should be a string');
      });

  };

  return <div>

    {errorMessage ? <strong>{errorMessage}</strong> : null}

    <form onSubmit={handleSubmit}>
      {pages.map((page) => <li key={page.id}>
        <label>
          <input name='section' value={stripIdVersion(page.id)} type='checkbox' />
          <span dangerouslySetInnerHTML={{ __html: page.title }} />
        </label>
      </li>)}
      <button type='submit'>select</button>
    </form>
  </div>;
};
